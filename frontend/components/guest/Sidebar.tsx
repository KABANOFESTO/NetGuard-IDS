"use client"

import {
    LayoutDashboard,
    CalendarClock,
    BarChart2,
    SlidersHorizontal,
    LogOut,
    Menu,
    X,
    User
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGetMyDetailsMutation } from "../../lib/redux/slices/AuthSlice";

const items = [
    {
        title: "Dashboard",
        url: "/guest",
        icon: LayoutDashboard,
    },
    {
        title: "Session Info",
        url: "/guest/Session-Info",
        icon: CalendarClock,
    },
    {
        title: "Usage Info",
        url: "/guest/Usage-Info",
        icon: BarChart2,
    },
    {
        title: "Profile & settings",
        url: "/guest/Profile-settings",
        icon: SlidersHorizontal,
    },
];


export default function Sidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [getMyDetails, { data: userDetails, isLoading, error }] = useGetMyDetailsMutation();

    useEffect(() => {
        getMyDetails({});
    }, [getMyDetails]);

    const handleLogout = () => {
        setIsConfirmDialogOpen(true);
    };

    const performLogout = () => {

        localStorage.clear();

        router.push('/auth');
    };


    const getProfileImageUrl = () => {
        if (userDetails?.profile_picture) {

            if (userDetails.profile_picture.startsWith('/media/')) {

                return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${userDetails.profile_picture}`;
            }

            if (userDetails.profile_picture.startsWith('http')) {
                return userDetails.profile_picture;
            }

            return userDetails.profile_picture.startsWith('/') ? userDetails.profile_picture : `/${userDetails.profile_picture}`;
        }
        return "/profile.jpg";
    };

    type ConfirmDialogProps = {
        open: boolean;
        setOpen: (open: boolean) => void;
        confirmFunc: () => void;
    };

    const ConfirmDialog = ({ open, setOpen, confirmFunc }: ConfirmDialogProps) => {
        if (!open) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-sm">
                    <h3 className="text-lg font-semibold">Are you sure you want to logout?</h3>
                    <p className="mt-2">If you click to continue you will no longer have access to this dashboard until you log in again</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() => {
                                confirmFunc();
                                setOpen(false);
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const UserSkeleton = () => (
        <div className="p-4 flex items-center gap-3 animate-pulse">
            <div className="bg-gray-400 rounded-full w-[46px] h-[46px]"></div>
            <div className="flex flex-col gap-2">
                <div className="bg-gray-400 h-4 w-24 rounded"></div>
                <div className="bg-gray-400 h-3 w-16 rounded"></div>
            </div>
        </div>
    );

    const UserError = () => (
        <div className="p-4 flex items-center gap-3">
            <div className="bg-red-500 rounded-full p-2 flex items-center justify-center">
                <User size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Error loading user</span>
                <span className="text-gray-300 text-xs cursor-pointer hover:text-white" onClick={() => getMyDetails({})}>
                    Click to retry
                </span>
            </div>
        </div>
    );

    return (
        <div className="w-[70%] md:w-64 z-[1000] h-screen fixed">
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 right-2 z-50 p-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800"
                aria-label="Toggle Menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className={`
          inset-y-0 left-0 
          h-full
          w-full
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          bg-[#2E2C58]
          z-40
          flex flex-col justify-between
      `}>
                <div className="flex flex-col h-full">
                    {/* Dynamic User Header */}
                    {isLoading ? (
                        <UserSkeleton />
                    ) : error ? (
                        <UserError />
                    ) : userDetails ? (
                        <div className="p-4 flex items-center gap-3">
                            <div className="bg-blue-500 rounded-full p-2 flex items-center justify-center overflow-hidden w-[46px] h-[46px]">
                                <Image
                                    src={getProfileImageUrl()}
                                    alt={`${userDetails.username}'s profile`}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                        // Fallback to default image on error
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/profile.jpg";
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-sm">
                                    {userDetails.username}
                                </span>
                                <span className="text-gray-300 text-xs">
                                    {userDetails.role}
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Fallback to original static content
                        <div className="p-4 flex items-center gap-3">
                            <div className="bg-blue-500 rounded-full p-2 flex items-center justify-center">
                                <Image
                                    src="/profile.jpg"
                                    alt="logo"
                                    width={30}
                                    height={30}
                                    style={{ borderRadius: "50%" }}
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-white font-semibold text-lg">admin Portal</span>
                        </div>
                    )}

                    <div className="flex-1 px-2 py-4">
                        <ul className="space-y-1">
                            {items.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.url}
                                        className={`flex text-sm items-center gap-3 px-4 py-3 rounded-md ${pathname === item.url
                                            ? 'bg-indigo-800 text-white'
                                            : 'text-gray-300 hover:bg-indigo-800/70'
                                            }`}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 bg-red-400 text-white w-full rounded-md hover:bg-red-500 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            <ConfirmDialog
                open={isConfirmDialogOpen}
                setOpen={setIsConfirmDialogOpen}
                confirmFunc={performLogout}
            />
        </div>
    );
}