// import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
// import { S3Client } from '@aws-sdk/client-s3'
// import { v4 as uuidv4 } from 'uuid'

// export async function POST(request: Request) {
//   const { filename, contentType } = await request.json()

//   try {
//     const client = new S3Client({ region: process.env.AWS_REGION })
//     const { url, fields } = await createPresignedPost(client, {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: uuidv4(),
//       Conditions: [
//         ['content-length-range', 0, 10485760], // up to 10 MB
//         ['starts-with', '$Content-Type', contentType],
//       ],
//       Fields: {
//         acl: 'public-read',
//         'Content-Type': contentType,
//       },
//       Expires: 600, // Seconds before the presigned post expires. 3600 by default.
//     })

//     return Response.json({ url, fields })
//   } catch (error) {
//     return Response.json({ error: error.message })
//   }
// }

import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string; // Get the folder from the form data
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  try {
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region:process.env.AWS_REGION },
        identityPoolId: process.env.AWS_IDENTITYPOOL_ID,
      }),
      // credentials: {
      //   accessKeyId: "AKIA5SPBTTURUSEMQI7B",
      //   secretAccessKey: "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",
      // },
    });
    const uploadId = uuidv4();

    const multipartUpload = await client.send(new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folder}/${file.name}`,
      ContentType: file.type,
    }));

    const { UploadId } = multipartUpload;

    const uploadPromises: Promise<{ ETag: string }>[] = [];
    let partNumber = 1;
    let offset = 0;

    const totalSize = file.size;
    let uploadedSize = 0;

    const progressStream = new ReadableStream({
      start(controller) {
        controller.enqueue('data: 0\n\n');
      },
      async pull(controller) {
        while (offset < file.size) {
          const chunk = file.slice(offset, Math.min(offset + 5 * 1024 * 1024, file.size));
          const chunkBuffer = await chunk.arrayBuffer();

          const uploadPartCommand = new UploadPartCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${file.name}`, // Include the folder in the object key
            UploadId,
            Body: Buffer.from(chunkBuffer),
            PartNumber: partNumber,
          });

          const uploadPromise = client.send(uploadPartCommand).then((data) => {
            uploadedSize += chunk.size;
            const progress = Math.round((uploadedSize / totalSize) * 100);
            controller.enqueue(`data: ${progress}\n\n`);
            return { ETag: data.ETag };
          });

          uploadPromises.push(uploadPromise);
          offset += chunk.size;
          partNumber++;

          await uploadPromise;
        }

        const uploadResults = await Promise.all(uploadPromises);

        await client.send(
          new CompleteMultipartUploadCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${file.name}`, // Include the folder in the object key
            UploadId,
            MultipartUpload: {
              Parts: uploadResults.map((result, index) => ({
                ETag: result.ETag,
                PartNumber: index + 1,
              })),
            },
          })
        );

        controller.enqueue(`data: 100\n\n`);
        controller.close();
      },
    });

    return new Response(progressStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500 });
  }
}