"use client";
import Navbar from "@/components/admin/Navbar";
import AdminSideBar from "@/components/admin/Sidebar";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { usePortalTelemetry } from "@/hooks/usePortalTelemetry";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const { isAuthorized, isLoading } = useRoleGuard(["Admin"]);
    usePortalTelemetry();

    if (isLoading || !isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="rounded-[28px] border border-white/10 bg-white/5 px-8 py-6 text-center">
                    <p className="text-sm uppercase tracking-[0.2em] text-sky-300">NetGuard</p>
                    <h1 className="mt-3 text-2xl font-semibold">Loading admin workspace</h1>
                    <p className="mt-2 text-sm text-slate-300">Verifying your access and preparing live monitoring tools.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row w-full min-h-screen lg:w-[100%] bg-none">
            <AdminSideBar />
            <div className="flex flex-col ml-auto w-full bg-slate-50 md:w-[calc(100%-16rem)]">
                <Navbar onSearch={(query: string) => { /* handle search here */ }} />
                {children}
            </div>
        </div>
    );
}
