"use client";

import { Work_Sans } from "next/font/google";

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
        <div className={workSans.variable}>
            {children}
        </div>
    );
}
