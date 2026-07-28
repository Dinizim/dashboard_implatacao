import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { ClientProviders } from "./providers";
export const metadata: Metadata = {
  title: "Dashboard de Implantação",
  description: "Acompanhamento de implantações",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ClientProviders>
          <Sidebar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
