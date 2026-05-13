"use client";

import {
  BarChart2,
  CalendarClock,
  LayoutDashboard,
  SlidersHorizontal,
} from "lucide-react";

import RoleSidebar from "@/components/portal/RoleSidebar";

const items = [
  { title: "Dashboard", url: "/guest", icon: LayoutDashboard },
  { title: "Session info", url: "/guest/Session-Info", icon: CalendarClock },
  { title: "Usage info", url: "/guest/Usage-Info", icon: BarChart2 },
  { title: "Profile & settings", url: "/guest/Profile-settings", icon: SlidersHorizontal },
];

export default function Sidebar() {
  return <RoleSidebar items={items} accentClassName="bg-amber-500" />;
}
