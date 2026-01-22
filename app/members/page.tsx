'use client';

import { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Edit2, Trash2, Filter, Bell, X, UserPlus
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import Card from '@/components/ui/Card';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    membershipType: string;
    status: string;
    joinDate: string;
}

export default function MembersPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; memberId: string | null }>({ isOpen: false, memberId: null });

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        membershipType: 'REGULAR',
        status: 'ACTIVE'
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            // Load from localStorage first
            const localMembers = storage.get<Member[]>(STORAGE_KEYS.MEMBERS, []);

            if (localMembers.length > 0) {
                setMembers(localMembers);
                setIsLoading(false);
                return;
            }

            // Fallback to API
            const response = await fetch('/api/tools/search_members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 50 })
            });
            const data = await response.json();
            if (data.success) {
                setMembers(data.members);
                storage.set(STORAGE_KEYS.MEMBERS, data.members);
            }
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMember = () => {
        if (!formData.firstName || !formData.lastName) return;

        let updatedMembers: Member[];

        if (editingMember) {
            // Update existing member
            updatedMembers = members.map(m =>
                m.id === editingMember.id
                    ? { ...editingMember, ...formData }
                    : m
            );
        } else {
            // Create new member
            const newMember: Member = {
                id: Date.now().toString(),
                ...formData,
                joinDate: new Date().toISOString()
            };
            updatedMembers = [newMember, ...members];
        }

        setMembers(updatedMembers);
        storage.set(STORAGE_KEYS.MEMBERS, updatedMembers);
        closeModal();
    };

    const handleEditMember = (member: Member) => {
        setEditingMember(member);
        setFormData({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email || '',
            phone: member.phone || '',
            membershipType: member.membershipType,
            status: member.status
        });
        setIsModalOpen(true);
    };

    const handleDeleteMember = (memberId: string) => {
        setDeleteConfirm({ isOpen: true, memberId });
    };

    const confirmDelete = () => {
        if (!deleteConfirm.memberId) return;

        const updatedMembers = members.filter(m => m.id !== deleteConfirm.memberId);
        setMembers(updatedMembers);
        storage.set(STORAGE_KEYS.MEMBERS, updatedMembers);
        setDeleteConfirm({ isOpen: false, memberId: null });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            membershipType: 'REGULAR',
            status: 'ACTIVE'
        });
    };

    const filteredMembers = members.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600';
            case 'INACTIVE': return 'bg-slate-50 text-slate-500';
            default: return 'bg-amber-50 text-amber-600';
        }
    };

    const getMembershipBadge = (type: string) => {
        const colors: Record<string, string> = {
            'LEADERSHIP': 'bg-purple-50 text-purple-600 border-purple-100',
            'BAPTIZED': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'PARTNER': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'REGULAR': 'bg-slate-50 text-slate-600 border-slate-100',
            'VISITOR': 'bg-amber-50 text-amber-600 border-amber-100',
        };
        return colors[type] || colors['REGULAR'];
    };

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
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Members</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Member Directory • {members.length} Members</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <AnimatedButton onClick={() => setIsModalOpen(true)}>
                            <UserPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Add Member</span>
                        </AnimatedButton>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <Card
                        title="All Members"
                        icon={Users}
                        extra={
                            <div className="relative group">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className="pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white w-full md:w-72 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        }
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl">
                                <table className="w-full text-left border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                                            <th className="px-4 pb-2">Profile</th>
                                            <th className="px-4 pb-2">Membership</th>
                                            <th className="px-4 pb-2">Status</th>
                                            <th className="px-4 pb-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map(m => (
                                            <tr key={m.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                                <td className="p-4 bg-white first:rounded-l-2xl border-y border-slate-50 group-hover:border-indigo-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-indigo-600 text-sm">
                                                            {m.firstName[0]}{m.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800">{m.firstName} {m.lastName}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{m.phone || m.email || 'No contact'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 bg-white border-y border-slate-50 group-hover:border-indigo-100">
                                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getMembershipBadge(m.membershipType)}`}>
                                                        {m.membershipType}
                                                    </span>
                                                </td>
                                                <td className="p-4 bg-white border-y border-slate-50 group-hover:border-indigo-100">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(m.status)}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 bg-white last:rounded-r-2xl border-y border-slate-50 group-hover:border-indigo-100">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditMember(m)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMember(m.id)}
                                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredMembers.length === 0 && (
                                    <p className="text-slate-400 text-center py-8">No members found</p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeModal}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden zoom-in">
                        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingMember ? 'Edit Member' : 'New Member'}
                                </h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                                    {editingMember ? 'Update Member Details' : 'Add New Member'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        placeholder="First name..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                        placeholder="Last name..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    placeholder="080XXXXXXXX"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membership</label>
                                    <select
                                        value={formData.membershipType}
                                        onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    >
                                        <option value="REGULAR">Regular</option>
                                        <option value="BAPTIZED">Baptized</option>
                                        <option value="PARTNER">Partner</option>
                                        <option value="LEADERSHIP">Leadership</option>
                                        <option value="VISITOR">Visitor</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <AnimatedButton onClick={closeModal} variant="secondary" className="flex-1">Cancel</AnimatedButton>
                                <AnimatedButton onClick={handleSaveMember} className="flex-1">
                                    {editingMember ? 'Update' : 'Save'} Member
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Member"
                message="Are you sure you want to delete this member? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, memberId: null })}
                variant="danger"
            />

            <FloatingChat />
        </div>
    );
}
