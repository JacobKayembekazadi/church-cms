'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign, Filter, Bell, Plus, Download, ArrowUpRight, PiggyBank, Briefcase, X, Edit2, Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface FinanceSummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    offerings: number;
    donations: number;
}

interface Transaction {
    id: string;
    date: string;
    type: string;
    amount: number;
    service: string;
}

const TRANSACTION_TYPES = ['Offering', 'Tithe', 'Donation', 'Special Seed', 'Building Fund'];

export default function FinancesPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; transactionId: string | null }>({ isOpen: false, transactionId: null });

    const [formData, setFormData] = useState({
        type: 'Offering',
        amount: '',
        service: ''
    });

    useEffect(() => {
        loadFinanceData();
    }, []);

    const loadFinanceData = async () => {
        try {
            // Load transactions from localStorage
            const localTransactions = storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);

            if (localTransactions.length > 0) {
                setTransactions(localTransactions);
                calculateSummary(localTransactions);
            } else {
                // Fallback to API for summary
                const response = await fetch('/api/tools/get_dashboard_summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ period: 'month' })
                });
                const data = await response.json();
                if (data.success) {
                    setSummary(data.summary.finance);
                    const mockTransactions = [
                        { id: '1', date: '2024-05-19', type: 'Offering', amount: 45000, service: 'Sunday Service' },
                        { id: '2', date: '2024-05-19', type: 'Tithe', amount: 120000, service: 'Sunday Service' },
                        { id: '3', date: '2024-05-20', type: 'Donation', amount: 250000, service: 'Special Event' },
                    ];
                    setTransactions(mockTransactions);
                    storage.set(STORAGE_KEYS.TRANSACTIONS, mockTransactions);
                }
            }
        } catch (error) {
            console.error('Failed to load finance data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateSummary = (txns: Transaction[]) => {
        const totalIncome = txns.reduce((sum, t) => sum + t.amount, 0);
        const offerings = txns.filter(t => t.type === 'Offering').reduce((sum, t) => sum + t.amount, 0);
        const donations = txns.filter(t => t.type === 'Donation').reduce((sum, t) => sum + t.amount, 0);

        setSummary({
            totalIncome,
            totalExpenses: 0,
            balance: totalIncome,
            offerings,
            donations
        });
    };

    const handleSaveTransaction = () => {
        if (!formData.amount || !formData.service) return;

        let updatedTransactions: Transaction[];

        if (editingTransaction) {
            updatedTransactions = transactions.map(t =>
                t.id === editingTransaction.id
                    ? { ...editingTransaction, ...formData, amount: parseFloat(formData.amount) }
                    : t
            );
        } else {
            const newTransaction: Transaction = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                type: formData.type,
                amount: parseFloat(formData.amount),
                service: formData.service
            };
            updatedTransactions = [newTransaction, ...transactions];
        }

        setTransactions(updatedTransactions);
        storage.set(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
        calculateSummary(updatedTransactions);
        closeModal();
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            amount: transaction.amount.toString(),
            service: transaction.service
        });
        setIsModalOpen(true);
    };

    const handleDeleteTransaction = (transactionId: string) => {
        setDeleteConfirm({ isOpen: true, transactionId });
    };

    const confirmDelete = () => {
        if (!deleteConfirm.transactionId) return;

        const updatedTransactions = transactions.filter(t => t.id !== deleteConfirm.transactionId);
        setTransactions(updatedTransactions);
        storage.set(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
        calculateSummary(updatedTransactions);
        setDeleteConfirm({ isOpen: false, transactionId: null });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
        setFormData({ type: 'Offering', amount: '', service: '' });
    };

    const formatCurrency = (amount: number) => {
        return `R${amount.toLocaleString()}`;
    };

    const formatCurrencyShort = (amount: number) => {
        if (amount >= 1000000) return `R${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `R${(amount / 1000).toFixed(1)}K`;
        return `R${amount}`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
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
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Finances</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Financial Overview • This Month</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <AnimatedButton onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Record Transaction</span>
                        </AnimatedButton>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <StatCard
                                    label="Total Income"
                                    value={formatCurrencyShort(summary?.totalIncome || 0)}
                                    trend={15}
                                    icon={DollarSign}
                                    colorClass="emerald"
                                />
                                <StatCard
                                    label="Offerings"
                                    value={formatCurrencyShort(summary?.offerings || 0)}
                                    icon={PiggyBank}
                                    colorClass="indigo"
                                />
                                <StatCard
                                    label="Donations"
                                    value={formatCurrencyShort(summary?.donations || 0)}
                                    icon={Briefcase}
                                    colorClass="purple"
                                />
                            </div>

                            <Card
                                title="Transaction History"
                                icon={DollarSign}
                                extra={
                                    <button className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors">
                                        <Download className="w-4 h-4" /> Export Report
                                    </button>
                                }
                            >
                                <div className="space-y-4">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-6 rounded-3xl border border-slate-50 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 text-lg">
                                                    {t.type[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-lg">{t.type}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">{t.service} • {t.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-900">{formatCurrency(t.amount)}</p>
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center justify-end gap-1">
                                                        <ArrowUpRight className="w-3 h-3" /> Verified
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditTransaction(t)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(t.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {transactions.length === 0 && (
                                        <p className="text-slate-400 text-center py-8">No transactions recorded</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeModal}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden zoom-in">
                        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-emerald-50/50 to-white flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
                                </h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                                    {editingTransaction ? 'Update Financial Entry' : 'Add Financial Entry'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {TRANSACTION_TYPES.slice(0, 3).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${formData.type === type
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {TRANSACTION_TYPES.slice(3).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${formData.type === type
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (R)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all font-bold text-2xl"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service / Event</label>
                                <input
                                    type="text"
                                    value={formData.service}
                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all font-bold"
                                    placeholder="e.g. Sunday Service"
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <AnimatedButton onClick={closeModal} variant="secondary" className="flex-1">Cancel</AnimatedButton>
                                <AnimatedButton onClick={handleSaveTransaction} className="flex-1">
                                    {editingTransaction ? 'Update' : 'Record'}
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, transactionId: null })}
                variant="danger"
            />

            <FloatingChat />
        </div>
    );
}
