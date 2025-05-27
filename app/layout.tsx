import { Theme } from "@radix-ui/themes";
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ATM System",
  description: "A modern banking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Theme>
          {children}
          <Toaster />
        </Theme>
      </body>
    </html>
  );
}
