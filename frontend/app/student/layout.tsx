"use client";
import Navbar from "@/components/student/Navbar";
import SideBar from "@/components/student/Sidebar";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { usePortalTelemetry } from "@/hooks/usePortalTelemetry";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const { isAuthorized, isLoading } = useRoleGuard(["Student", "Lecturer"]);
    usePortalTelemetry();

    if (isLoading || !isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="rounded-[28px] border border-white/10 bg-white/5 px-8 py-6 text-center">
                    <p className="text-sm uppercase tracking-[0.2em] text-sky-300">NetGuard</p>
                    <h1 className="mt-3 text-2xl font-semibold">Loading student portal</h1>
                    <p className="mt-2 text-sm text-slate-300">Checking account access and recent network activity.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row w-full min-h-screen lg:w-[100%] bg-none">
            <SideBar />
            <div className="flex flex-col ml-auto w-full bg-slate-50 md:w-[calc(100%-16rem)]">
                <Navbar onSearch={(query: string) => { /* handle search here */ }} />
                {children}
            </div>
        </div>
    );
}
