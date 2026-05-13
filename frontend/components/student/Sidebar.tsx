"use client";

import {
  Bell,
  Laptop,
  LayoutDashboard,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

import RoleSidebar from "@/components/portal/RoleSidebar";

const items = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "My activity", url: "/student/my-activity", icon: Zap },
  { title: "My devices", url: "/student/my-devices", icon: Laptop },
  { title: "Alerts", url: "/student/alerts", icon: Bell },
  { title: "Profile & settings", url: "/student/Profile-settings", icon: SlidersHorizontal },
];

export default function Sidebar() {
  return <RoleSidebar items={items} accentClassName="bg-sky-600" />;
}
