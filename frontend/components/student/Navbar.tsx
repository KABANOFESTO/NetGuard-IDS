"use client";

import RoleNavbar from "@/components/portal/RoleNavbar";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  return (
    <RoleNavbar
      onSearch={onSearch}
      placeholder="Search your recent activity, devices, and security notices..."
    />
  );
}
