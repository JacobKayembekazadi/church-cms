'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: number;
    icon?: React.ComponentType<{ className?: string }>;
    colorClass?: 'indigo' | 'emerald' | 'amber' | 'purple';
}

const colors = {
    indigo: "from-indigo-500 to-blue-600 shadow-indigo-200",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-200",
    amber: "from-amber-400 to-orange-500 shadow-amber-200",
    purple: "from-purple-500 to-indigo-600 shadow-purple-200"
};

export default function StatCard({ label, value, trend, icon: Icon, colorClass = "indigo" }: StatCardProps) {
    return (
        <div className="relative overflow-hidden bg-white p-7 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all duration-500 hover:scale-[1.02]">
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[colorClass]} text-white shadow-lg transition-transform group-hover:rotate-6`}>
                        {Icon && <Icon className="w-6 h-6" />}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-black text-slate-900 leading-tight">{value}</p>
                </div>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
        </div>
    );
}
