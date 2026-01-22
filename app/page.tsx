'use client';

import { useState, useEffect } from 'react';
import {
  Users, Calendar, DollarSign, Layers, Plus, Bell, Menu,
  PieChart, MoreVertical, Briefcase, X
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface DashboardData {
  members: { total: number; active: number; new: number; growthRate: string };
  events: { total: number; upcoming: number; recentAttendance: number };
  finance: { totalIncome: number; totalExpenses: number; balance: number; offerings: number; donations: number };
  recentEvents: { id: string; name: string; type: string; date: string; attendanceCount: number }[];
  topDonors: { memberId: string; memberName: string; totalDonations: number }[];
}

const DEPARTMENTS = ['Admin', 'Evangelism', 'Ushering', 'Choir', 'Media', 'Youth', 'Children'];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewOperationOpen, setIsNewOperationOpen] = useState(false);
  const [operationType, setOperationType] = useState('EVENT');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/tools/get_dashboard_summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: 'month' })
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.summary);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `R${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `R${(amount / 1000).toFixed(1)}K`;
    return `R${amount}`;
  };

  const handleCreateOperation = () => {
    // Here you would typically save to API
    alert(`Created new ${operationType} operation!`);
    setIsNewOperationOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-24 px-4 md:px-10 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xl z-30 border-b border-slate-50/50">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 md:p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Dashboard</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Overview • v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <AnimatedButton onClick={() => setIsNewOperationOpen(true)}>
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Operation</span>
            </AnimatedButton>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-10 animate-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Members"
                  value={dashboardData?.members.total || 0}
                  trend={8}
                  icon={Users}
                  colorClass="indigo"
                />
                <StatCard
                  label="Avg Attendance"
                  value={dashboardData?.events.recentAttendance || 0}
                  trend={-2}
                  icon={Calendar}
                  colorClass="purple"
                />
                <StatCard
                  label="Monthly Income"
                  value={formatCurrency(dashboardData?.finance.totalIncome || 0)}
                  trend={15}
                  icon={DollarSign}
                  colorClass="emerald"
                />
                <StatCard
                  label="Departments"
                  value={DEPARTMENTS.length}
                  icon={Layers}
                  colorClass="amber"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Financial Chart */}
                  <Card
                    title="Weekly Income"
                    icon={PieChart}
                    extra={<button className="text-slate-400 hover:text-indigo-600"><MoreVertical className="w-5 h-5" /></button>}
                  >
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 group relative">
                          <div
                            className="w-full bg-slate-100 rounded-2xl group-hover:bg-indigo-500 transition-all duration-500 cursor-pointer"
                            style={{ height: `${h}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              R{(h * 1000).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-4 text-center font-bold">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recent Events */}
                  <Card title="Recent Services" icon={Calendar}>
                    <div className="space-y-4">
                      {(dashboardData?.recentEvents || []).slice(0, 3).map((event, i) => (
                        <div key={event.id || i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              {event.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{event.name}</p>
                              <p className="text-xs text-slate-400">{new Date(event.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">{event.attendanceCount}</p>
                            <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-tighter">Attendance</p>
                          </div>
                        </div>
                      ))}
                      {(!dashboardData?.recentEvents || dashboardData.recentEvents.length === 0) && (
                        <p className="text-slate-400 text-center py-8">No recent events</p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Active Tasks */}
                  <Card title="Active Tasks" icon={Briefcase}>
                    <div className="space-y-6">
                      {[
                        { t: 'Update Membership Roll', p: 80, c: 'bg-indigo-500' },
                        { t: 'Evangelism Outreach', p: 45, c: 'bg-amber-500' },
                        { t: 'Choir Rehearsal', p: 100, c: 'bg-emerald-500' },
                        { t: 'Youth Conference Planning', p: 20, c: 'bg-purple-500' }
                      ].map((task, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-slate-600">{task.t}</span>
                            <span className="text-slate-400">{task.p}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${task.c} transition-all duration-1000`}
                              style={{ width: `${task.p}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Donors */}
                  <Card title="Top Donors" icon={DollarSign}>
                    <div className="space-y-3">
                      {(dashboardData?.topDonors || []).slice(0, 3).map((donor, i) => (
                        <div key={donor.memberId || i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                              {donor.memberName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-bold text-slate-800 text-sm">{donor.memberName}</span>
                          </div>
                          <span className="font-black text-emerald-600 text-sm">
                            {formatCurrency(donor.totalDonations)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Operation Modal */}
      {isNewOperationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsNewOperationOpen(false)}></div>
          <div className="relative bg-white w-[95%] md:w-full max-w-xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden zoom-in">
            <div className="p-6 md:p-10 border-b border-slate-50 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">New Operation</h3>
                <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Create Task or Event</p>
              </div>
              <button onClick={() => setIsNewOperationOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 md:p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['EVENT', 'TASK', 'ANNOUNCEMENT'].map(type => (
                    <button
                      key={type}
                      onClick={() => setOperationType(type)}
                      className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${operationType === type
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                  placeholder="Enter operation title..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold resize-none h-24"
                  placeholder="Describe the operation..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                  <input
                    type="time"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <AnimatedButton onClick={() => setIsNewOperationOpen(false)} variant="secondary" className="flex-1">Cancel</AnimatedButton>
                <AnimatedButton onClick={handleCreateOperation} className="flex-1">Create Operation</AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingChat />
    </div>
  );
}
