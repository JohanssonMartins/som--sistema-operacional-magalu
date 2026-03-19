import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Database, Check, X, Edit2, Trash2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../api';
import { ChecklistItem } from '../data';

export const BaseChecklist = () => {
    const { baseItems, setBaseItems, currentUser } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [formData, setFormData] = useState<Partial<ChecklistItem>>({
        pilar: '',
        bloco: '',
        trilha: '',
        item: '',
        descricao: '',
        nossaAcao: '',
        exigeEvidencia: false,
        ativo: true,
        order: 0,
        criterios: ''
    });

    const handleEditItem = (item: ChecklistItem) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm("Deseja realmente excluir este item da base? Isso não afetará auditorias já realizadas, mas o item não aparecerá mais em novos meses.")) {
            try {
                await api.deleteBaseItem(id);
                setBaseItems(baseItems.filter(i => i.id !== id));
            } catch (error) {
                console.error("Erro ao excluir item base:", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.updateBaseItem(editingItem.id, formData);
                setBaseItems(baseItems.map(i => i.id === editingItem.id ? { ...i, ...formData } as ChecklistItem : i));
            } else {
                const newItem = { ...formData, id: Math.random().toString(36).substr(2, 9) };
                await api.createBaseItem(newItem);
                setBaseItems([...baseItems, newItem as ChecklistItem]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar item base:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base de Dados do Check-List</h2>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Gerencie os itens mestres que compõem a auditoria.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', nossaAcao: '', exigeEvidencia: false, ativo: true, order: baseItems.length + 1, criterios: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Item Base</span>
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                        <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Pilar</th>
                                <th className="px-6 py-4">Bloco</th>
                                <th className="px-6 py-4">Trilha</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Evidência</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {baseItems.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200">{item.pilar}</td>
                                    <td className="px-6 py-4">{item.bloco}</td>
                                    <td className="px-6 py-4">
                                        {item.trilha ? (
                                            <span className="inline-flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded text-xs font-bold border border-amber-100 dark:border-amber-500/20">
                                                {item.trilha}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs md:max-w-md truncate" title={item.item}>
                                        {item.item}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.exigeEvidencia ? (
                                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                                                <Check className="w-3 h-3 mr-1" /> Sim
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded text-xs font-medium border border-gray-100 dark:border-zinc-800">
                                                <X className="w-3 h-3 mr-1" /> Não
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.ativo ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ativo</span>
                                        ) : (
                                            <span className="text-red-500 dark:text-red-400 font-bold">Inativo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end space-x-1">
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/50">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {editingItem ? 'Editar Item da Base' : 'Novo Item da Base'}
                                    </h3>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Pilar</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.pilar}
                                                onChange={e => setFormData({ ...formData, pilar: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Bloco</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.bloco || ''}
                                                onChange={e => setFormData({ ...formData, bloco: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Trilha</label>
                                        <select
                                            required
                                            value={formData.trilha || ''}
                                            onChange={e => setFormData({ ...formData, trilha: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                                        >
                                            <option value="" disabled>Selecione uma trilha</option>
                                            <option value="Básico bem feito">Básico bem feito</option>
                                            <option value="Gerenciar para melhorar">Gerenciar para melhorar</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Item (Pergunta/Verificação)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.item}
                                            onChange={e => setFormData({ ...formData, item: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Descrição / Ajuda</label>
                                        <textarea
                                            required
                                            value={formData.descricao}
                                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white min-h-[80px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Critérios de Pontuação</label>
                                        <textarea
                                            value={formData.criterios || ''}
                                            onChange={e => setFormData({ ...formData, criterios: e.target.value })}
                                            placeholder="Ex: 3 - Sim completa; 1 - Parcial; 0 - Não realizado"
                                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-6 pt-2">
                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.exigeEvidencia}
                                                onChange={e => setFormData({ ...formData, exigeEvidencia: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-700 rounded bg-gray-50 dark:bg-zinc-950 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5 text-zinc-950 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Exige Evidência</span>
                                        </label>
                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.ativo}
                                                onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-700 rounded bg-gray-50 dark:bg-zinc-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Item Ativo</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all">
                                        <Save className="w-4 h-4" />
                                        <span>Salvar Item</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
