import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Command,
  GraduationCap,
  Fingerprint,
  Users,
  LogOut,
  Menu,
  ExternalLink,
  BookOpenText
} from 'lucide-react';
import { Button } from '../ui/button';
import marbotLogo from '../../assets/MarbotBanner.jpg';
import { getCurrentUser } from '../../api';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 group relative border-l-2 ${active
      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 font-bold'
      : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
  >
    <Icon size={16} strokeWidth={active ? 2.5 : 2} className={active ? 'text-emerald-600' : 'text-muted-foreground group-hover:text-foreground'} />
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </Link>
);

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(res => setUser(res.data)).catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: Command
    },
    {
      to: '/admin/students',
      label: 'Data Mahasiswa',
      icon: GraduationCap
    },
    {
      to: '/admin/courses',
      label: 'Data Mata Kuliah',
      icon: BookOpenText
    }
  ];

  if (user?.role === 'super_admin' || user?.role === 'admin') {
    navItems.push({
      to: '/admin/management',
      label: 'Manajemen Admin',
      icon: Fingerprint
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-foreground">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-background border-r border-border transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 h-20 flex items-center border-b border-border bg-muted/10">
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-md overflow-hidden border border-border shrink-0 bg-white shadow-sm flex items-center justify-center">
                {user?.picture ? (
                  <img src={user.picture} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <img src={marbotLogo} alt="Logo" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-[11px] font-bold tracking-tight leading-tight truncate text-foreground uppercase">
                  {user?.name || 'ADMIN'}
                </h2>
                <span className="text-[9px] text-muted-foreground/60 truncate">
                  {user?.email || 'admin@ipb.ac.id'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-destructive/10 shrink-0"
              >
                <LogOut size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
            <div className="px-3 mb-3 text-[9px] font-[750] text-muted-foreground uppercase tracking-[0.1em]">Navigasi Dashboard</div>
            {navItems.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.to}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8 shrink-0 sticky top-0 z-40 backdrop-blur-md bg-background/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-secondary rounded-md transition-colors"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
              <span className="uppercase tracking-widest opacity-60">Admin</span>
              <span className="text-border">/</span>
              <span className="text-foreground font-black tracking-tight uppercase">
                {navItems.find(n => n.to === location.pathname)?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
