import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מד המטבחון — לוח הניקיון המשותף",
  description: "דירוג ניקיון, תורנויות, הזמנות, תקלות ומשחקים — מסונכרנים בין כולם.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
