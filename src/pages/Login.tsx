import React, { useState } from 'react';
import { Sun, Moon, Mail, Lock, ShieldAlert, KeyRound, ArrowLeft, CheckCircle2, RefreshCw, Send, Sparkles } from 'lucide-react';
import { MainLogo } from '../components/Logos';
import { useStore } from '../store/useStore';
import { api } from '../api';

export const Login = () => {
  const { theme, setTheme, setCurrentUser, setSelectedUnit, setActiveTab, usersList, setUsersList } = useStore();
  
  // Modos de exibição: 'login' ou 'reset'
  const [viewMode, setViewMode] = useState<'login' | 'reset'>('login');

  // Estados do Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados da Redefinição de Senha
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword);
    if (user) {
      if (!user.active) {
        setLoginError('Sua conta está inativa. Entre em contato com o administrador.');
        return;
      }
      setCurrentUser(user);

      const targetUnit = user.unidade === 'Master' ? 'Todas' : (user.unidade || 'Todas');
      setSelectedUnit(targetUnit);

      setLoginError('');
      setActiveTab('home');
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  // Solicita o código por e-mail
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    if (!resetEmail.trim()) {
      setResetMessage({ type: 'error', text: 'Informe o seu e-mail cadastrado.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.requestPasswordReset(resetEmail.trim());
      setCodeSent(true);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setResetMessage({
        type: 'success',
        text: 'Código de confirmação enviado para o seu e-mail! Verifique sua caixa de entrada.'
      });
    } catch (err: any) {
      setResetMessage({ type: 'error', text: err.message || 'Erro ao enviar e-mail de confirmação.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirma o código e redefine a senha
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);

    if (!resetCode.trim()) {
      setResetMessage({ type: 'error', text: 'Informe o código de verificação recebido.' });
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setResetMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 3 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetMessage({ type: 'error', text: 'A nova senha e a confirmação não conferem.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.confirmPasswordReset(resetEmail.trim(), resetCode.trim(), newPassword);
      
      // Atualiza o estado local de usuários com a nova senha
      setUsersList(usersList.map(u => 
        u.email.toLowerCase() === resetEmail.trim().toLowerCase() 
          ? { ...u, password: newPassword } 
          : u
      ));

      setResetMessage({
        type: 'success',
        text: 'Senha redefinida com sucesso! Você já pode entrar com a nova senha.'
      });

      // Transiciona para o formulário de login preenchido
      setLoginEmail(resetEmail.trim());
      setLoginPassword(newPassword);

      setTimeout(() => {
        setViewMode('login');
        setResetMessage(null);
        setCodeSent(false);
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
        setDevCode(null);
      }, 2000);
    } catch (err: any) {
      setResetMessage({ type: 'error', text: err.message || 'Erro ao redefinir a senha.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
        {/* Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div
          className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-colors duration-300 animate-in fade-in zoom-in duration-300"
        >
          {/* Botão de Tema (Dark/Light) */}
          <div className="absolute top-4 right-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-md transition-colors" title="Alternar tema">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <MainLogo size="large" />
          </div>

          {/* ──── VISÃO 1: LOGIN ──── */}
          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in duration-300">
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
          )}

          {/* ──── VISÃO 2: REDEFINIR SENHA POR E-MAIL ──── */}
          {viewMode === 'reset' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800/60">
                <button
                  onClick={() => setViewMode('login')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para o Login</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <KeyRound className="w-4 h-4" />
                  <span>Redefinição</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Redefinir Senha</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {!codeSent 
                    ? 'Informe o seu e-mail para receber um código de verificação por e-mail.' 
                    : 'Digite o código recebido no seu e-mail e escolha sua nova senha.'}
                </p>
              </div>

              {resetMessage && (
                <div className={`p-3 rounded-lg border text-sm flex items-start space-x-2 animate-in slide-in-from-top-2 ${
                  resetMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                }`}>
                  {resetMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{resetMessage.text}</span>
                </div>
              )}

              {/* Dev Code Alert Box para facilitar testes em ambiente local */}
              {devCode && (
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Código de Teste:</strong> <code className="bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 rounded font-mono font-bold text-sm tracking-wider">{devCode}</code></span>
                  </div>
                  <button 
                    onClick={() => setResetCode(devCode)} 
                    className="text-[11px] underline font-bold hover:text-amber-900 dark:hover:text-amber-100"
                  >
                    Preencher
                  </button>
                </div>
              )}

              {!codeSent ? (
                /* PASSO 1: Solicitar Código por E-mail */
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Seu E-mail Cadastrado</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="seu@email.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 text-zinc-950 font-bold rounded-lg py-2.5 hover:bg-amber-400 active:scale-95 transition-all mt-4 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enviando e-mail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Código de Confirmação</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* PASSO 2: Digitar Código e Nova Senha */
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Código de Verificação (recebido por e-mail)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[8px] font-mono text-xl font-bold bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-amber-600 dark:text-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      placeholder="000000"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nova Senha</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="••••••"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Confirmar Nova Senha</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="••••••"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 text-zinc-950 font-bold rounded-lg py-2.5 hover:bg-amber-400 active:scale-95 transition-all mt-4 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Redefinindo senha...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar e Redefinir Senha</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleRequestCode}
                      className="text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      Não recebeu o e-mail? Reenviar código
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-600">
            © 2026 Magalu | Feito com ❤ por J's Martins
          </div>
        </div>
      </div>
    </div>
  );
};
