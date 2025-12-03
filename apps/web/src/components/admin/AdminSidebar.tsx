"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Video,
    ShieldAlert,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react";

const sidebarItems = [
    {
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users
    },
    {
        title: "Creators",
        href: "/admin/creators",
        icon: Video
    },
    {
        title: "Moderation",
        href: "/admin/moderation",
        icon: ShieldAlert
    },
    {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings
    }
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-screen w-64 bg-slate-900 text-white border-r border-slate-800">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                    Admin Panel
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Exit Admin</span>
                </button>
            </div>
        </div>
    );
}
