"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Flag,
    TrendingUp,
    LogOut,
    Shield
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/creators', label: 'Creators', icon: UserCog },
    { href: '/admin/moderation', label: 'Moderation', icon: Flag },
    { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
];

export function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200">
                {/* Logo/Header */}
                <div className="flex items-center gap-2 p-6 border-b border-gray-200">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-xs text-gray-500">CreatorAI</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname?.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
