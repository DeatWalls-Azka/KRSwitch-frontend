import React, { useState } from 'react';
import api from '../../api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import marbotLogo from '../../assets/MarbotBanner.jpg';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${
      active
        ? 'bg-secondary text-primary font-bold'
        : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
    }`}
  >
    {active && (
      <div className="absolute left-[-16px] w-1 h-6 bg-primary rounded-r-full" />
    )}
    <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} />
    <span className="text-sm tracking-tight">{label}</span>
  </Link>
);

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      icon: LayoutDashboard
    },
    {
      to: '/admin/students',
      label: 'Database Mahasiswa',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex font-sans text-foreground">
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 h-20 flex items-center border-b border-border bg-muted/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-border shrink-0 bg-white">
                <img src={marbotLogo} alt="KRSwitch Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm font-black tracking-tight leading-none uppercase truncate text-primary">KRSwitch</h2>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-80">Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Menu Utama</div>
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

          {/* Bottom Section */}
          <div className="p-4 border-t border-border bg-muted/10">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md font-bold transition-all"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span className="text-sm tracking-tight">Keluar Sesi</span>
            </Button>
          </div>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('/', '_blank')}
              className="gap-2 text-[11px] font-black uppercase tracking-tight h-9"
            >
              <ExternalLink size={12} strokeWidth={3} />
              Buka Beranda
            </Button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
