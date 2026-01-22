'use client';

import { ReactNode } from 'react';

interface CardProps {
    title: string;
    children: ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    extra?: ReactNode;
    className?: string;
}

export default function Card({ title, children, icon: Icon, extra, className = '' }: CardProps) {
    return (
        <div className={`group bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${className}`}>
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <h3 className="font-bold text-slate-800 tracking-tight text-lg">{title}</h3>
                </div>
                {extra}
            </div>
            <div className="p-8">{children}</div>
        </div>
    );
}
