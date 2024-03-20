"use client";
import { useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Login from "../components/login";
import Logout from "../components/logout";
import { FaCopy } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
// import { getSession } from '@auth0/nextjs-auth0';

const bucketOptions = {
  "F4L": [
    { bucket: "rsc-lp-s3",  folder: "001-F4L-MarchLane", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "002-F4L-WilsonWay", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "003-F4L-Lodi", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "004-F4L-WestonRanch", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "005-F4L-HammerLane", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "006-F4L-Manteca", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "007-F4L-LosBanos", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "008-F4L-Salinas", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "009-F4L-Ceres", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "010-F4L-Atascadero", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "011-F4L-SLO", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "012-F4L-PasoRobles", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "013-F4L-ArroyoGrande", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "014-F4L-MackRoad", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "015-F4L-RioLinda", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "016-F4L-RanchoCordova", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "017-F4L-Fairfield", link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",  folder: "550-WH-TeslaDrive", link: "https://d92xkar75na38.cloudfront.net" },
  ],
  "RSM": [
    { bucket: "rsc-lp-s3", folder: "021-RSM-Stockton",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "022-RSM-Lodi",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "023-RSM-Merced",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "024-RSM-Madera",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "025-RSM-Greenfield",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "027-RSM-Livingston",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "028-RSM-Broadway",  link: "https://d92xkar75na38.cloudfront.net" },
    { bucket: "rsc-lp-s3",folder: "041-RSM-MinimartStockton",  link: "https://d92xkar75na38.cloudfront.net" },
  ],
};
export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBucket, setSelectedBucket] = useState("");
  const [cloudFrontLink, setCloudFrontLink] = useState("");
  const [userLink, setUserLink] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user, error, isLoading } = useUser();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [uploadStatus, setUploadStatus] = useState<{
    progress: number;
    message: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [secondDropdownDisabled, setSecondDropdownDisabled] = useState(true);

  const resetUploadStatus = () => {
    setSelectedBucket("");
    setCopied(false);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setButtonDisabled(true);
    setSelectedOption(""); // Reset the selected option
setSecondDropdownDisabled(true); // Disable the second dropdown
  };
  const resetter = () => {
    setSelectedBucket("");
    setCopied(false);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setButtonDisabled(true);
    setCloudFrontLink("");
    setUserLink("");
    setUploadStatus(null);
    setUploading(false); // Set uploading to false when upload completes or fails
    setSelectedOption(""); // Reset the selected option
    setSecondDropdownDisabled(true); // Disable the second dropdown
  };
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    setSelectedOption(selectedOption);
    setSelectedBucket(""); // Reset the selected bucket when the option changes
    setSecondDropdownDisabled(selectedOption === ""); // Enable/disable the second dropdown based on the selected option
    setButtonDisabled(true); // Disable the button when the option changes
  };
  
  const handleBucketChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBucketName = event.target.value;
    setSelectedBucket(selectedBucketName);
  
    const selectedConnector = bucketOptions[selectedOption].find(
      (connector) => connector.folder === selectedBucketName
    );
  
    if (selectedConnector) {
      setCloudFrontLink(selectedConnector.link);
      setSelectedFolder(selectedConnector.folder);
      // console.log(selectedConnector.link);
    }
  
    setButtonDisabled(!selectedBucketName || !file);
    // Reset upload status if touched after upload
    if (uploadStatus) {
      setUploadStatus(null);
    }
    if (cloudFrontLink || userLink) {
      setCloudFrontLink("");
      setUserLink("");
    }
  };
  const settingFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const videoTypes = ["video/mp4"];
      if (!videoTypes.includes(selectedFile.type)) {
        alert("Only mp4 video files are allowed");
        resetUploadStatus();
        return;
      }
      setFile(selectedFile);
      setButtonDisabled(!selectedBucket || !selectedFile);
    }
    // Reset upload status if touched after upload
    if (uploadStatus) {
      setUploadStatus(null);
    }
    if (cloudFrontLink || userLink) {
      // setCloudFrontLink("");
      // setUserLink("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploading) {
      return; // Do nothing if uploading is already in progress
    }
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    // setUploading(true);
    setUploading(true); // Set uploading to true when starting upload
    setUploadStatus({ progress: 0, message: "Upload started..." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", selectedFolder); // Include the selected folder
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value);
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith("data:")) {
              const progress = parseInt(line.substring(5).trim(), 10);
              if (!isNaN(progress)) {
                setUploadStatus({
                  progress,
                  message: `Uploading... ${progress}%`,
                });
              }
            }
          }

          buffer = lines[lines.length - 1];
        }
      }

      setUploadStatus({ progress: 100, message: "Upload successful!" });
      setUserLink(`${cloudFrontLink}/${selectedFolder}/${file.name}`);
      resetUploadStatus();
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus({ progress: 0, message: "Upload failed." });
      // setUserLink("");
      // Reset all fields on failure
      resetter();
    } finally {
      setUploading(false); // Set uploading to false when upload completes or fails
      // console.log(userLink)
    }
  };

  if (isLoading)
    return (
      <main>
        <div>Loading...</div>
      </main>
    );
  if (error)
    return (
      <main>
        <div>{error.message}</div>
      </main>
    );

  return (
    <main>
      {user ? (
        <>
          <div>
            <h1>Upload a File to S3</h1>
            <div className="flex justify-evenly">
              <h3>Username: {user.name}</h3>
              <Logout />
            </div>
            <div>
              <div>
              <label htmlFor="optionDropdown">Option:</label>{" "}
  <select
    id="optionDropdown"
    value={selectedOption}
    onChange={handleOptionChange}
    disabled={uploading}
  >
    <option value="">Please select an option</option>
    {Object.keys(bucketOptions).map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</div>
<div>
  <label htmlFor="dropdown">Store:</label>{" "}
  <select
    id="dropdown"
    value={selectedBucket}
    onChange={handleBucketChange}
    disabled={uploading || secondDropdownDisabled}
  >
    <option value="">Please select a store</option>
    {selectedOption &&
      bucketOptions[selectedOption].map((connector) => (
        <option key={connector.folder} value={connector.folder}>
          {connector.folder}
        </option>
      ))}
  </select>
              </div>
              <div>
                <label htmlFor="fileUp">File:</label>
                <input
                  id="fileUp"
                  type="file"
                  accept="video/mp4"
                  onChange={settingFile}
                  ref={fileInputRef}
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="flex">
              {userLink && (
                <>
                  <CopyToClipboard
                    text={userLink}
                    onCopy={() => setCopied(true)}
                  >
                    <button>
                      <FaCopy /> Copy the Link
                    </button>
                  </CopyToClipboard>
                  {copied && <span style={{ color: "red" }}>Copied.</span>}
                </>
              )}
              {uploadStatus && (
                <div>
                  <progress value={uploadStatus.progress} max="100" />
                  <p>{uploadStatus.message}</p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <form onSubmit={handleSubmit}>
                <button className="bg-black" type="submit" disabled={buttonDisabled || uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </form>
              <button onClick={resetter} disabled={uploading}>
                Reset
              </button>
            </div>
          </div>
        </>
      ) : (
        <Login />
      )}
    </main>
  );
}
//  <button type="submit" disabled={uploading}>
