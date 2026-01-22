'use client';

import { useState, useEffect } from 'react';
import {
    Calendar, Filter, Bell, Plus, Clock, MapPin, Users, X, Edit2, Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import Card from '@/components/ui/Card';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface Event {
    id: string;
    name: string;
    type: string;
    date: string;
    time?: string;
    location?: string;
    description?: string;
    attendanceCount?: number;
}

const EVENT_TYPES = ['SERVICE', 'CONFERENCE', 'SPECIAL', 'MEETING', 'OUTREACH'];

export default function EventsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; eventId: string | null }>({ isOpen: false, eventId: null });

    const [formData, setFormData] = useState({
        name: '',
        type: 'SERVICE',
        date: '',
        time: '',
        location: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const localEvents = storage.get<Event[]>(STORAGE_KEYS.EVENTS, []);

            if (localEvents.length > 0) {
                setEvents(localEvents);
            } else {
                const mockEvents = [
                    { id: '1', name: 'Sunday Service', type: 'SERVICE', date: '2024-05-26', time: '09:00', location: 'Main Sanctuary', attendanceCount: 450 },
                    { id: '2', name: 'Mid-Week Bible Study', type: 'SERVICE', date: '2024-05-22', time: '18:30', location: 'Chapel Hall', attendanceCount: 125 },
                    { id: '3', name: 'Youth Conference 2024', type: 'CONFERENCE', date: '2024-06-15', time: '10:00', location: 'Convention Center', attendanceCount: 0 },
                ];
                setEvents(mockEvents);
                storage.set(STORAGE_KEYS.EVENTS, mockEvents);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEvent = () => {
        if (!formData.name || !formData.date) return;

        let updatedEvents: Event[];

        if (editingEvent) {
            updatedEvents = events.map(e =>
                e.id === editingEvent.id
                    ? { ...editingEvent, ...formData }
                    : e
            );
        } else {
            const newEvent: Event = {
                id: Date.now().toString(),
                ...formData,
                attendanceCount: 0
            };
            updatedEvents = [newEvent, ...events];
        }

        setEvents(updatedEvents);
        storage.set(STORAGE_KEYS.EVENTS, updatedEvents);
        closeModal();
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            name: event.name,
            type: event.type,
            date: event.date,
            time: event.time || '',
            location: event.location || ''
        });
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleDeleteEvent = (eventId: string) => {
        setDeleteConfirm({ isOpen: true, eventId });
        setSelectedEvent(null);
    };

    const confirmDelete = () => {
        if (!deleteConfirm.eventId) return;

        const updatedEvents = events.filter(e => e.id !== deleteConfirm.eventId);
        setEvents(updatedEvents);
        storage.set(STORAGE_KEYS.EVENTS, updatedEvents);
        setDeleteConfirm({ isOpen: false, eventId: null });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData({ name: '', type: 'SERVICE', date: '', time: '', location: '' });
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'SERVICE': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'CONFERENCE': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'SPECIAL': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'MEETING': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'OUTREACH': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const isUpcoming = (dateStr: string) => {
        return new Date(dateStr) >= new Date();
    };

    const upcomingEvents = events.filter(e => isUpcoming(e.date));
    const pastEvents = events.filter(e => !isUpcoming(e.date));

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
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Events</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Events & Attendance • {events.length} Total</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <AnimatedButton onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">New Event</span>
                        </AnimatedButton>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in">
                            <Card title="Upcoming Services" icon={Calendar}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:shadow-indigo-100 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getEventTypeColor(event.type)}`}>
                                                    {event.type}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditEvent(event)}
                                                        className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-3">{event.name}</h3>
                                            <div className="space-y-2 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-indigo-500" />
                                                    <span className="font-medium">{new Date(event.date).toLocaleDateString()} {event.time && `• ${event.time}`}</span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                                        <span className="font-medium">{event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-100/30 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                        </div>
                                    )) : (
                                        <p className="text-slate-400 col-span-2 text-center py-8">No upcoming events</p>
                                    )}
                                </div>
                            </Card>

                            <Card title="Service Log History" icon={Clock}>
                                <div className="space-y-4">
                                    {pastEvents.length > 0 ? pastEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    <span className="text-lg font-black leading-none">{new Date(event.date).getDate()}</span>
                                                    <span className="text-[8px] font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{event.name}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{event.location || 'Main Sanctuary'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 text-indigo-600">
                                                        <Users className="w-4 h-4" />
                                                        <span className="font-black">{event.attendanceCount || 0}</span>
                                                    </div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditEvent(event)}
                                                        className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-slate-400 text-center py-8">No past events</p>
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
                        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingEvent ? 'Edit Event' : 'New Event'}
                                </h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                                    {editingEvent ? 'Update Event Details' : 'Schedule Service or Event'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    placeholder="e.g. Sunday Service"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Type</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {EVENT_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.type === type
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {type.slice(0, 4)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    placeholder="e.g. Main Sanctuary"
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <AnimatedButton onClick={closeModal} variant="secondary" className="flex-1">Cancel</AnimatedButton>
                                <AnimatedButton onClick={handleSaveEvent} className="flex-1">
                                    {editingEvent ? 'Update' : 'Create'} Event
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Event"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, eventId: null })}
                variant="danger"
            />

            <FloatingChat />
        </div>
    );
}
