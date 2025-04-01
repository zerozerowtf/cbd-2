import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Ban, 
  MessageSquare, 
  Settings,
  FileText,
  LogOut,
  Euro,
  Menu,
  X,
  Users,
  Mail
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const navigation = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/bookings', label: 'Buchungen', icon: Calendar },
  { path: '/admin/blocked-dates', label: 'Gesperrte Termine', icon: Ban },
  { path: '/admin/guests', label: 'Gäste', icon: Users },
  { path: '/admin/messages', label: 'Nachrichten', icon: MessageSquare },
  { path: '/admin/blog', label: 'Blog', icon: FileText },
  { path: '/admin/pricing', label: 'Preise & Rabatte', icon: Euro },
  { path: '/admin/email-templates', label: 'Email-Vorlagen', icon: Mail },
  { path: '/admin/settings', label: 'Einstellungen', icon: Settings },
];

export const AdminLayout = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-secondary">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-secondary z-50 
                         flex items-center justify-between px-4 shadow-lg">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-primary-light rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-display text-lg">Admin</span>
          <button
            onClick={signOut}
            className="p-2 hover:bg-primary-light rounded-lg transition-colors"
          >
            <LogOut size={24} />
          </button>
        </header>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-secondary transform 
                   transition-transform duration-300 ease-in-out
                   ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                   ${isMobile ? 'top-0' : 'top-16'}`}
      >
        {isMobile && (
          <div className="h-16 flex items-center justify-between px-4 border-b border-secondary/10">
            <span className="font-display text-lg">Menu</span>
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-primary-light rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={isMobile ? closeSidebar : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                          whitespace-nowrap ${
                            isActive(item.path) 
                              ? 'bg-accent text-secondary shadow-lg scale-105' 
                              : 'bg-secondary/10 text-secondary/80 hover:bg-secondary/20'
                          }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {!isMobile && (
            <div className="p-4 border-t border-secondary/10">
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg
                       text-secondary/70 hover:text-secondary hover:bg-secondary/10
                       transition-colors"
              >
                <LogOut size={20} />
                <span>Abmelden</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <div className={`${isMobile ? 'pt-16' : 'pl-64'}`}>
        <main className="min-h-screen p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
