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
import { api } from '../api';

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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const updatedUser = await api.updateUser(currentUser.id, { photo: base64String });
        useStore.getState().setCurrentUser(updatedUser);
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        alert('Erro ao atualizar foto de perfil');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-zinc-900/80 border-r border-gray-200 dark:border-zinc-800 flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 z-50 backdrop-blur-xl`}>
        
        {/* Logo Area */}
        <div className={`h-[72px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-5 border-b border-gray-200 dark:border-zinc-800/80 shrink-0 overflow-hidden`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center cursor-pointer h-full flex-1" onClick={() => navigate('/')}>
              <MainLogo size="small" className="!px-0" />
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
              className={`w-full flex items-center p-2.5 rounded-2xl transition-all duration-200 border ${
                isProfileDropdownOpen 
                  ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-lg' 
                  : 'bg-white/50 dark:bg-zinc-900/50 border-transparent hover:bg-white dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-md'
              }`}
            >
              <div className="relative shrink-0 group/avatar overflow-hidden rounded-xl">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                />
                
                {currentUser?.photo ? (
                  <img src={currentUser.photo} className="w-9 h-9 rounded-xl object-cover" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                
                {/* Overlay Glow ao passar o mouse */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white"
                >
                  <label className="cursor-pointer">
                    {isUploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LayoutDashboard className="w-4 h-4 rotate-45" /> /* Usando icone genérico ou camera se disponivel */
                    )}
                  </label>
                </div>
                
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm z-10"></div>
              </div>
              
              {!isSidebarCollapsed && (
                <div className="ml-3 flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate leading-none mb-1">
                    {currentUser?.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest truncate">
                    {currentUser?.role.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
              {!isSidebarCollapsed && (
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  className={`absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden ${isSidebarCollapsed ? 'w-[220px]' : 'w-full'}`}
                >
                  <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Sua Conta</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 mt-1 truncate">{currentUser?.email}</p>
                  </div>

                  <div className="p-1.5">
                    <button 
                      onClick={() => {
                        setIsPasswordModalOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors group"
                    >
                      <Lock className="w-4 h-4 mr-3 text-gray-400 group-hover:text-current" />
                      <span className="font-medium">Alterar Senha</span>
                    </button>
                    
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors font-bold group mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-500/70 group-hover:text-red-600 transition-colors" />
                      Sair do Sistema
                    </button>
                  </div>
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

      {/* Modal de Alteração de Senha */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Alterar Senha</h3>
                    <p className="text-blue-100 text-xs">Proteja sua conta</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                {passwordStatus.type && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className={`p-3 rounded-xl text-sm font-medium ${
                      passwordStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}
                  >
                    {passwordStatus.message}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Senha Atual</label>
                    <input 
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="h-px bg-gray-100 dark:bg-zinc-800 my-2"></div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Nova Senha</label>
                    <input 
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Nova senha"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Confirmar Nova Senha</label>
                    <input 
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-600 dark:text-zinc-400 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={isChangingPassword || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                    onClick={async () => {
                      if (passwordForm.new !== passwordForm.confirm) {
                        setPasswordStatus({ type: 'error', message: 'As senhas não coincidem' });
                        return;
                      }
                      if (passwordForm.new.length < 3) {
                        setPasswordStatus({ type: 'error', message: 'A senha deve ter pelo menos 3 caracteres' });
                        return;
                      }

                      setIsChangingPassword(true);
                      setPasswordStatus({ type: null, message: '' });
                      
                      try {
                        if (currentUser) {
                          // Aqui você pode validar a senha atual se o backend suportar, 
                          // caso contrário, apenas atualizamos o usuário.
                          await api.updateUser(currentUser.id, { password: passwordForm.new });
                          setPasswordStatus({ type: 'success', message: 'Senha alterada com sucesso!' });
                          setTimeout(() => {
                            setIsPasswordModalOpen(false);
                            setPasswordForm({ current: '', new: '', confirm: '' });
                            setPasswordStatus({ type: null, message: '' });
                          }, 2000);
                        }
                      } catch (e) {
                        setPasswordStatus({ type: 'error', message: 'Erro ao alterar senha. Tente novamente.' });
                      } finally {
                        setIsChangingPassword(false);
                      }
                    }}
                    className={`flex-1 px-4 py-3 bg-blue-600 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 transition-all ${
                      isChangingPassword ? 'opacity-70 grayscale' : 'hover:bg-blue-700 active:scale-95'
                    }`}
                  >
                    {isChangingPassword ? 'Alterando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
