'use client';

import { X } from 'lucide-react';
import AnimatedButton from './ui/AnimatedButton';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onCancel}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden zoom-in">
                <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-slate-50 to-white flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-8">
                    <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>
                    <div className="flex gap-4">
                        <AnimatedButton onClick={onCancel} variant="secondary" className="flex-1">
                            {cancelText}
                        </AnimatedButton>
                        <AnimatedButton onClick={onConfirm} variant={variant} className="flex-1">
                            {confirmText}
                        </AnimatedButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
