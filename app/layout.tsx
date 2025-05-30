import {
  ThemeProvider,
  LanguageProvider,
  StyleProvider,
} from "@/app/providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import type { Metadata } from "next";

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
        <ThemeProvider>
          <LanguageProvider>
            <StyleProvider>
              {children}
              <Toaster />
            </StyleProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
