import './globals.css'
// import { UserProvider } from '@auth0/nextjs-auth0/client';




export const metadata = {
  title: "AWS-NEXT-UPLOADER",
  description: 'AWS S3 Upload Example',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
         {/* <UserProvider> */}
      <body>{children}</body>
      {/* </UserProvider> */}
    </html>
  )
}
