'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Calendar,
    DollarSign,
    Layers,
    FileText,
    Settings,
    ShieldCheck,
    LogOut
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onToggle?: () => void;
}

const navItems = [
    { id: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { id: '/members', icon: Users, label: 'Members' },
    { id: '/events', icon: Calendar, label: 'Events' },
    { id: '/finances', icon: DollarSign, label: 'Finances' },
    { id: '/departments', icon: Layers, label: 'Departments' },
    { id: '/documents', icon: FileText, label: 'Documents' },
    { id: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onToggle}
            />

            <aside className={`
                fixed md:relative inset-y-0 left-0 z-50
                bg-white border-r border-slate-100 transition-all duration-500 flex flex-col shrink-0
                ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 md:w-24'}
            `}>
                {/* Logo */}
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-xl shadow-indigo-200 rotate-3 transition-transform hover:rotate-0">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        {isOpen && (
                            <div className="overflow-hidden whitespace-nowrap animate-in fade-in zoom-in duration-500">
                                <h1 className="text-slate-900 font-black text-xl tracking-tight leading-tight">New Life</h1>
                                <p className="text-indigo-600 text-[10px] font-black tracking-[0.3em] uppercase">Embassy</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-6 space-y-2 mt-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.id;
                        return (
                            <Link
                                key={item.id}
                                href={item.id}
                                className={`w-full group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.02]'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {isOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                                {isActive && isOpen && (
                                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-8 border-t border-slate-50">
                    <div className={`flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 ${!isOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs">HP</div>
                        {isOpen && (
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 leading-none">Head Pastor</p>
                                <button className="text-[10px] text-rose-500 font-bold uppercase mt-1 hover:underline flex items-center gap-1">
                                    <LogOut className="w-3 h-3" /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
