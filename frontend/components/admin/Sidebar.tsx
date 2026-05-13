"use client";

import {
  Activity,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Monitor,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import RoleSidebar from "@/components/portal/RoleSidebar";

const items = [
  { title: "Dashboard", url: "/Admin", icon: LayoutDashboard },
  { title: "Network Monitoring", url: "/Admin/Network-Monitoring", icon: Activity },
  { title: "Alerts", url: "/Admin/Alerts", icon: Bell },
  { title: "Devices", url: "/Admin/Devices", icon: Monitor },
  { title: "Users", url: "/Admin/Users", icon: UsersRound },
  { title: "Reports", url: "/Admin/Reports", icon: ClipboardList },
  { title: "Profile & settings", url: "/Admin/Profile-settings", icon: SlidersHorizontal },
];

export default function Sidebar() {
  return <RoleSidebar items={items} accentClassName="bg-rose-600" />;
}
