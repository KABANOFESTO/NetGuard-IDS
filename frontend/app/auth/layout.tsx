"use client";

import { Work_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"]
});

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
           
                    <div >
                        {children}
                    </div>
                    
        </SessionProvider>
    );
}