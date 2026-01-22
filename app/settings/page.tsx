'use client';

import { useState } from 'react';
import {
    Settings, Filter, Bell, Save, User, Shield, Bell as BellIcon, Database, Palette
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import Card from '@/components/ui/Card';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function SettingsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 md:h-24 px-4 md:px-10 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xl z-30 border-b border-slate-50/50">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">System Settings • v2.0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <AnimatedButton>
                            <Save className="w-5 h-5" />
                            <span className="hidden sm:inline">Save Changes</span>
                        </AnimatedButton>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <div className="max-w-4xl space-y-8 animate-in">
                        {/* Profile Settings */}
                        <Card title="Church Profile" icon={User}>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Church Name</label>
                                        <input
                                            type="text"
                                            defaultValue="New Life Embassy Church"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Head Pastor</label>
                                        <input
                                            type="text"
                                            defaultValue="Pastor John Doe"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Church Address</label>
                                    <input
                                        type="text"
                                        defaultValue="123 Faith Avenue, Lagos, Nigeria"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                        <input
                                            type="tel"
                                            defaultValue="+234 800 000 0000"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                        <input
                                            type="email"
                                            defaultValue="info@newlifeembassy.org"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Notification Settings */}
                        <Card title="Notifications" icon={BellIcon}>
                            <div className="space-y-6">
                                {[
                                    { label: 'Email notifications for new members', enabled: true },
                                    { label: 'SMS reminders for events', enabled: true },
                                    { label: 'Weekly financial summary', enabled: false },
                                    { label: 'Attendance alerts', enabled: true },
                                ].map((setting, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-700">{setting.label}</span>
                                        <button className={`w-14 h-8 rounded-full transition-colors relative ${setting.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${setting.enabled ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Security */}
                        <Card title="Security" icon={Shield}>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Data Management */}
                        <Card title="Data Management" icon={Database}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                                    <h4 className="font-black text-slate-800 mb-2">Export Data</h4>
                                    <p className="text-sm text-slate-400 mb-4">Download all church data as a backup file.</p>
                                    <AnimatedButton variant="secondary">Export All</AnimatedButton>
                                </div>
                                <div className="p-6 rounded-3xl border border-rose-100 bg-rose-50/50">
                                    <h4 className="font-black text-rose-800 mb-2">Danger Zone</h4>
                                    <p className="text-sm text-rose-400 mb-4">Permanently delete all data. This cannot be undone.</p>
                                    <AnimatedButton variant="danger">Delete All Data</AnimatedButton>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <FloatingChat />
        </div>
    );
}
