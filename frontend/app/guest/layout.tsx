"use client";
import { useState } from "react";
import Navbar from "@/components/guest/Navbar";
import SideBar from "@/components/guest/Sidebar";

interface UserProfile {
    username: string;
    email: string;
    role: string;
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [] = useState<UserProfile | null>({
        username: "admin",
        email: "admin@example.com",
        role: "admin"
    });


    return (
        <div className="flex flex-row w-full min-h-screen lg:w-[100%] bg-none">
            <SideBar />
            <div className="flex flex-col ml-auto w-full lg:w-[85%]">
                <Navbar onSearch={(query: string) => { /* handle search here */ }} />
                {children}
            </div>
        </div>
    );
}