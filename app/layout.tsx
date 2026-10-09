import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "PayU";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: `${APP_NAME} — Platform Bounty Freelance`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "PayU adalah platform bounty untuk freelancer Indonesia. Pemberi kerja pasang tugas berhadiah, pencari kerja submit karya dan menangkan bounty. Pembayaran QRIS instan.",
  applicationName: APP_NAME,
  keywords: ["bounty", "freelance", "QRIS", "pekerjaan", "gig", "Indonesia"],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} — Platform Bounty Freelance`,
    description: "Pasang tugas berhadiah, menangkan bounty. Pembayaran QRIS instan.",
    type: "website",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070b1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Runs before paint to avoid a flash of the wrong theme.
const themeScript = `
(function(){try{var t=localStorage.getItem('payu-theme');var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
