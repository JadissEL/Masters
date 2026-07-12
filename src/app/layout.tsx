import "./globals.css";

export const metadata = {
  title: "Master Finder — Dina & Jadiss",
  description: "Personal research platform for finding the best master's programs across Europe and New Zealand.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafafa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}