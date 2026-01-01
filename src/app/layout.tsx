import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dataset Viewer - Financial AI Training Data",
  description: "Visualize and manage financial advisor fine-tuning datasets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container">
            <Link href="/" className="navbar-brand">
              📊 <span>DatasetViewer</span>
            </Link>
            <div className="navbar-nav">
              <Link href="/" className="nav-link">Dashboard</Link>
              <Link href="/datasets" className="nav-link">Browse</Link>
              <Link href="/upload" className="nav-link">Upload</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
