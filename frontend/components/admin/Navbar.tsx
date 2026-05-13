"use client";

import RoleNavbar from "@/components/portal/RoleNavbar";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  return (
    <RoleNavbar
      onSearch={onSearch}
      placeholder="Search users, alerts, devices, or activity across the university network..."
    />
  );
}
