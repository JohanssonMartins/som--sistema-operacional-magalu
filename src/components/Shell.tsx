import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Trophy, CheckCircle2, Database, Users, 
  Menu, PanelLeftClose, ChevronDown, Package, Bell, 
  Sun, Moon, LogOut, Lock, User as UserIcon, Check, X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MainLogo } from './Logos';
import { UNIDADES_DISPONIVEIS, CD_NAMES } from '../constants/appConstants';
import { getDueDateStatus } from '../utils/appUtils';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { 
    currentUser, logout, theme, toggleTheme, 
    isSidebarCollapsed, setIsSidebarCollapsed,
    selectedUnit, setSelectedUnit,
    items
  } = useStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'GERENTE_DIVISIONAL' || currentUser?.role === 'DIRETORIA';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ANY'] },
    { to: '/rank', icon: Trophy, label: 'Top Magalog', roles: ['ANY'] },
    { to: '/autoauditoria', icon: CheckCircle2, label: 'Autoavaliação', roles: ['ANY'] },
    { to: '/base-checklist', icon: Database, label: 'Base Check-List', roles: ['ADMIN', 'GERENTE_DIVISIONAL', 'DIRETORIA', 'GERENTE_DO_CD'] },
    { to: '/usuarios', icon: Users, label: 'Usuários', roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes('ANY') || (currentUser && item.roles.includes(currentUser.role))
  );

  const notificationsCount = items.filter(i => 
    (i.assigneeId === currentUser?.id || i.assigneeId2 === currentUser?.id || i.assigneeId3 === currentUser?.id) && !i.completed
  ).length + items.filter(i => 
    !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))
  ).length;

  return (
    <div className={`${theme} min-h-screen bg-gray-50 dark:bg-zinc-950 flex text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300`}>
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-zinc-900/80 border-r border-gray-200 dark:border-zinc-800 flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 z-50 backdrop-blur-xl`}>
        
        {/* Logo Area */}
        <div className={`h-[72px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 border-b border-gray-200 dark:border-zinc-800/80 shrink-0`}>
          {!isSidebarCollapsed && (
            <div className="flex flex-col items-center cursor-pointer overflow-hidden py-4 w-full" onClick={() => navigate('/')}>
              <MainLogo size="small" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <PanelLeftClose className="w-5 h-5 text-gray-400" />}
          </button>
        </div>

        {/* Unit Selection */}
        <div className="px-3 py-4 border-b border-gray-100 dark:border-zinc-800/50 shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => isPrivileged && setIsUnitDropdownOpen(!isUnitDropdownOpen)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all duration-200 ${isUnitDropdownOpen
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-sm'
                } ${!isPrivileged ? 'cursor-default opacity-80 border-dashed bg-gray-50/50 dark:bg-zinc-800/20 grayscale-[0.2]' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isUnitDropdownOpen ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
                  <Package className="w-4 h-4" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col items-start leading-tight overflow-hidden flex-1 text-left">
                    <span className="text-[13px] font-bold text-gray-800 dark:text-zinc-200 truncate w-full">
                      {selectedUnit === 'Todas' ? 'Todos os CDs' : `CD ${selectedUnit}`}
                    </span>
                    {selectedUnit !== 'Todas' && CD_NAMES[selectedUnit] && (
                      <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 truncate w-full">
                        {CD_NAMES[selectedUnit].split(' - ').slice(1).join(' - ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {(!isSidebarCollapsed && isPrivileged) && (
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            <AnimatePresence>
              {isUnitDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className={`absolute left-0 mt-2 ${isSidebarCollapsed ? 'w-[260px]' : 'w-full'} max-h-[300px] overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-[60] py-2`}
                >
                  <button
                    onClick={() => { setSelectedUnit('Todas'); setIsUnitDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm ${selectedUnit === 'Todas' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                  >
                    Todos os CDs
                  </button>
                  {UNIDADES_DISPONIVEIS.map(u => (
                    <button
                      key={u}
                      onClick={() => { setSelectedUnit(u); setIsUnitDropdownOpen(false); }}
                      className={`w-full flex flex-col items-start px-3 py-2 text-sm ${selectedUnit === u ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                      <span>CD {u}</span>
                      <span className="text-[10px] opacity-70">{CD_NAMES[u]}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-bold shadow-sm' 
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'}
                ${isSidebarCollapsed ? 'justify-center px-0' : ''}
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-950/80">
          <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center gap-2' : 'items-center justify-between gap-2'}`}>
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm relative"
              >
                <Bell className="w-5 h-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`w-full flex items-center p-2 rounded-xl transition-all ${isProfileDropdownOpen ? 'bg-gray-100 dark:bg-zinc-800' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
            >
              {currentUser?.photo ? (
                <img src={currentUser.photo} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className="ml-3 flex-1 text-left overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">{currentUser?.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-500 truncate">{currentUser?.role.replace(/_/g, ' ')}</p>
                </div>
              )}
            </button>
            
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-2 divide-y divide-gray-100 dark:divide-zinc-800"
                >
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-bold">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair do Sistema
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
        
        <footer className="mt-auto py-6 text-center text-xs text-gray-400 dark:text-zinc-600 opacity-70">
          <p>© 2026 Magalu | Feito com ❤ por J's Martins</p>
        </footer>
      </main>
    </div>
  );
};
