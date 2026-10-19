import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function CncLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-site="cnc"
      data-site-font-root
      className={`${jetbrainsMono.variable} flex flex-1 flex-col`}
    >
      {children}
    </div>
  );
}
