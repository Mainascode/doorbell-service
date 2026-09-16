import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NITUME — Doorbell Service",
  description: "Your local runner in Ruaka.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
