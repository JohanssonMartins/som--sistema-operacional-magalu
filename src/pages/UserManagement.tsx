import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Shield, User as UserIcon, Edit2, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../api';
import { Role, User } from '../data';
import { UNIDADES_DISPONIVEIS } from '../constants/appConstants';
import { TableSkeleton } from '../components/Skeleton';

export const UserManagement = () => {
  const { usersList, setUsersList, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    role: 'COLABORADOR' as Role, 
    password: '', 
    photo: '', 
    unidade: '' 
  });

  useEffect(() => {
    const loadUsers = async () => {
      if (usersList.length === 0) {
        setIsLoading(true);
        try {
          const u = await api.getUsers();
          setUsersList(u);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      password: user.password, 
      photo: user.photo || '', 
      unidade: user.unidade || '' 
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert("Você não pode excluir a si mesmo!");
      return;
    }
    if (window.confirm("Deseja realmente excluir este usuário?")) {
      try {
        await api.deleteUser(id);
        setUsersList(usersList.filter(u => u.id !== id));
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await api.updateUser(editingUserId, formData);
        setUsersList(usersList.map(u => u.id === editingUserId ? { ...u, ...formData } : u));
      } else {
        const newUser = { ...formData, id: Math.random().toString(36).substr(2, 9) };
        await api.createUser(newUser as any);
        setUsersList([...usersList, newUser as any]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Controle de acesso e permissões do sistema.</p>
        </div>
        <button
          onClick={() => {
            setEditingUserId(null);
            setFormData({ name: '', email: '', role: 'COLABORADOR', password: '', photo: '', unidade: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-500 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm p-1">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
              <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Unidade/CD</th>
                  <th className="px-6 py-4">Nível de Acesso</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200 flex items-center space-x-3">
                      {user.photo ? (
                        <img src={user.photo} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-zinc-700" />
                      ) : (
                        <div className="bg-gray-200 dark:bg-zinc-800 p-2 rounded-full">
                          <UserIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                        </div>
                      )}
                      <span>{user.name}</span>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.unidade || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                        user.role === 'AUDITOR' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                        ['GERENTE_DIVISIONAL', 'DIRETORIA'].includes(user.role) ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                        user.role === 'GERENTE_DO_CD' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                        user.role === 'DONO_DO_PILAR' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-md transition-colors"
                        title="Editar Usuário"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800"
            >
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingUserId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Nome</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">E-mail</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Perfil</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                        required
                      >
                        <option value="COLABORADOR">Colaborador</option>
                        <option value="DONO_DO_PILAR">Dono do Pilar</option>
                        <option value="GERENTE_DO_CD">Gerente do CD</option>
                        <option value="GERENTE_DIVISIONAL">Gerente Divisional</option>
                        <option value="DIRETORIA">Diretoria</option>
                        <option value="AUDITOR">Auditor</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Unidade/CD</label>
                      <select
                        value={formData.unidade}
                        onChange={e => setFormData({ ...formData, unidade: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                      >
                        <option value="">Nenhuma (Geral)</option>
                        <option value="Master">Master</option>
                        {UNIDADES_DISPONIVEIS.map(u => (
                          <option key={u} value={u}>CD {u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Senha</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                      required={!editingUserId}
                      placeholder={editingUserId ? "Deixe em branco para não alterar" : "Senha do usuário"}
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all text-sm">Salvar Usuário</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
