"use client";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <title>Net Guard System</title>
        <meta name="description" content="A system for managing network security." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
        }}
      >
        <Provider store={store}>
          <Toaster position={`top-right`} />
          <main className="flex-grow">{children}</main>
        </Provider>
      </body>
    </html>
  );
}
