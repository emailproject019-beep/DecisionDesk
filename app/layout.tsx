import type { Metadata } from "next";
import WebMCPRegistrar from "@/components/WebMCPRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DecisionDesk",
  description: "WebMCP-powered decision analysis workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WebMCPRegistrar />
        {children}
      </body>
    </html>
  );
}
