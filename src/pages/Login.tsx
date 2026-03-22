import React, { useState } from 'react';
import {
  Sun, Moon, Mail, Lock, ShieldAlert, Users,
  ShieldCheck, BarChart3, Map, Warehouse, Columns3, ClipboardCheck
} from 'lucide-react';
import { MainLogo } from '../components/Logos';
import { useStore } from '../store/useStore';

export const Login = () => {
  const { theme, setTheme, setCurrentUser, setSelectedUnit, setActiveTab, usersList } = useStore();
  const [loginEmail, setLoginEmail] = useState('admin@magalu.com');
  const [loginPassword, setLoginPassword] = useState('123');
  const [loginError, setLoginError] = useState('');

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);

      const targetUnit = user.unidade === 'Master' ? 'Todas' : (user.unidade || 'Todas');
      setSelectedUnit(targetUnit);

      setLoginError('');
      setActiveTab('home');
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
        {/* Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div
          className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-colors duration-300 animate-in fade-in zoom-in duration-500"
        >
          <div className="absolute top-4 right-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col items-center mb-10">
            <MainLogo size="large" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">E-mail</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold rounded-lg py-2.5 hover:bg-amber-400 active:scale-95 transition-all mt-6 shadow-lg shadow-amber-500/20">
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-500 space-y-3">
            <p className="font-medium text-gray-600 dark:text-zinc-400 mb-2 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Contas de Teste (RBAC):</span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Admin', email: 'admin@magalu.com', icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Diretoria', email: 'diretoria@magalu.com', icon: BarChart3, color: 'text-purple-600 dark:text-purple-400' },
                { label: 'G. Divisional', email: 'divisional@magalu.com', icon: Map, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Gerente CD', email: 'gerentecd@magalu.com', icon: Warehouse, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Dono Pilar', email: 'donopilar@magalu.com', icon: Columns3, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Auditor', email: 'auditor@magalu.com', icon: ClipboardCheck, color: 'text-rose-600 dark:text-rose-400' }
              ].map((account) => (
                <div
                  key={account.email}
                  className="flex items-center space-x-3 bg-gray-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                  onClick={() => { setLoginEmail(account.email); setLoginPassword('123'); }}
                >
                  <div className={`p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm transition-colors group-hover:border-current ${account.color}`}>
                    <account.icon className="w-4 h-4" />
                  </div>
                  <span className={`${account.color} font-bold text-sm`}>{account.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-600">
            © 2026 Magalu | Feito com ❤ por J's Martins
          </div>
        </div>
      </div>
    </div>
  );
};
