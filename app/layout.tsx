import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Providers } from "./providers/providers";
import { Toaster } from "@/components/ui/toaster";
import { ThemeSwitcher } from "@/components/theme-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Samurais Admin",
  description: "Admin dashboard for managing samurai resources",
  icons: {
    icon: [{ url: "/samuraisicon.png", href: "/samuraisicon.png" }],
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>            
            <main className="flex items-center justify-center min-h-screen w-full pt-10">
              {children}
            </main>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
