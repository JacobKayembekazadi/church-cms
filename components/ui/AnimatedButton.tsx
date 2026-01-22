'use client';

import { ReactNode } from 'react';

interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    type?: 'button' | 'submit';
}

const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-slate-100",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200"
};

export default function AnimatedButton({
    children,
    onClick,
    variant = "primary",
    className = "",
    type = "button"
}: AnimatedButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`relative px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
