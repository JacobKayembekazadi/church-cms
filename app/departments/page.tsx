'use client';

import { useState, useEffect } from 'react';
import {
    Layers, Filter, Bell, Plus, ChevronRight, X, Users, Edit2, Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface Department {
    id: string;
    name: string;
    description?: string;
    type: string;
    memberCount: number;
    isActive: boolean;
}

const DEPARTMENT_TYPES = ['WORSHIP', 'YOUTH', 'CHILDREN', 'USHERING', 'MEDIA', 'PRAYER', 'EVANGELISM', 'WELFARE', 'ADMINISTRATION', 'FINANCE'];

export default function DepartmentsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; deptId: string | null }>({ isOpen: false, deptId: null });

    const [formData, setFormData] = useState({
        name: '',
        type: 'WORSHIP',
        description: ''
    });

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const localDepts = storage.get<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);

            if (localDepts.length > 0) {
                setDepartments(localDepts);
            } else {
                const response = await fetch('/api/tools/get_departments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: true })
                });
                const data = await response.json();
                if (data.success) {
                    setDepartments(data.departments);
                    storage.set(STORAGE_KEYS.DEPARTMENTS, data.departments);
                }
            }
        } catch (error) {
            console.error('Failed to load departments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDepartment = () => {
        if (!formData.name) return;

        let updatedDepartments: Department[];

        if (editingDepartment) {
            updatedDepartments = departments.map(d =>
                d.id === editingDepartment.id
                    ? { ...editingDepartment, ...formData }
                    : d
            );
        } else {
            const newDept: Department = {
                id: Date.now().toString(),
                ...formData,
                memberCount: 0,
                isActive: true
            };
            updatedDepartments = [...departments, newDept];
        }

        setDepartments(updatedDepartments);
        storage.set(STORAGE_KEYS.DEPARTMENTS, updatedDepartments);
        closeModal();
    };

    const handleEditDepartment = (dept: Department) => {
        setEditingDepartment(dept);
        setFormData({
            name: dept.name,
            type: dept.type,
            description: dept.description || ''
        });
        setSelectedDepartment(null);
        setIsModalOpen(true);
    };

    const handleDeleteDepartment = (deptId: string) => {
        setDeleteConfirm({ isOpen: true, deptId });
        setSelectedDepartment(null);
    };

    const confirmDelete = () => {
        if (!deleteConfirm.deptId) return;

        const updatedDepartments = departments.filter(d => d.id !== deleteConfirm.deptId);
        setDepartments(updatedDepartments);
        storage.set(STORAGE_KEYS.DEPARTMENTS, updatedDepartments);
        setDeleteConfirm({ isOpen: false, deptId: null });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDepartment(null);
        setFormData({ name: '', type: 'WORSHIP', description: '' });
    };

    const getDepartmentIcon = (type: string) => {
        const icons: Record<string, string> = {
            'WORSHIP': '🎵', 'YOUTH': '🔥', 'CHILDREN': '👶', 'USHERING': '🤝', 'MEDIA': '📹',
            'PRAYER': '🙏', 'EVANGELISM': '📢', 'WELFARE': '❤️', 'ADMINISTRATION': '📋', 'FINANCE': '💰',
        };
        return icons[type] || '⭐';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-24 px-10 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xl z-30 border-b border-slate-50/50">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Departments</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Ministry Units • {departments.length} Active</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <AnimatedButton onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">New Department</span>
                        </AnimatedButton>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in">
                            {departments.map(dept => (
                                <div key={dept.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] group-hover:bg-indigo-600 group-hover:text-white transition-colors text-2xl">
                                            {getDepartmentIcon(dept.type)}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditDepartment(dept)}
                                                className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDepartment(dept.id)}
                                                className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{dept.name}</h3>
                                    <p className="text-sm text-slate-400 font-medium mb-6 line-clamp-2">
                                        {dept.description || `Operational oversight and resource management for ${dept.name}.`}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="text-indigo-600 font-black text-sm">
                                            {dept.memberCount} Members
                                        </div>
                                        <button
                                            onClick={() => setSelectedDepartment(dept)}
                                            className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1"
                                        >
                                            Details <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {departments.length === 0 && (
                                <div className="col-span-full text-center py-16">
                                    <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">No departments found</p>
                                </div>
                            )}
                        </div>
                    )}
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
                                    {editingDepartment ? 'Edit Department' : 'New Department'}
                                </h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                                    {editingDepartment ? 'Update Ministry Unit' : 'Create Ministry Unit'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    placeholder="e.g. Choir Department"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {DEPARTMENT_TYPES.slice(0, 5).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.type === type
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {getDepartmentIcon(type)}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {DEPARTMENT_TYPES.slice(5).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.type === type
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {getDepartmentIcon(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold resize-none h-24"
                                    placeholder="Brief description of the department..."
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <AnimatedButton onClick={closeModal} variant="secondary" className="flex-1">Cancel</AnimatedButton>
                                <AnimatedButton onClick={handleSaveDepartment} className="flex-1">
                                    {editingDepartment ? 'Update' : 'Create'} Department
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedDepartment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedDepartment(null)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden zoom-in">
                        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-indigo-600 text-white rounded-[1.5rem] text-3xl">
                                    {getDepartmentIcon(selectedDepartment.type)}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedDepartment.name}</h3>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedDepartment.type} Department</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDepartment(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10">
                            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                                <p className="text-slate-600">{selectedDepartment.description || `Operational oversight and resource management for ${selectedDepartment.name}.`}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black text-indigo-600">{selectedDepartment.memberCount}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Members</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black text-emerald-600">12</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Meetings</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black text-amber-500">95%</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <AnimatedButton onClick={() => handleEditDepartment(selectedDepartment)} variant="secondary" className="flex-1">Edit Department</AnimatedButton>
                                <AnimatedButton onClick={() => handleDeleteDepartment(selectedDepartment.id)} variant="danger" className="flex-1">Delete</AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Department"
                message="Are you sure you want to delete this department? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, deptId: null })}
                variant="danger"
            />

            <FloatingChat />
        </div>
    );
}
