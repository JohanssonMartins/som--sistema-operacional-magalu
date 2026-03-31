import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Database, Check, X, Edit2, Trash2, Save, FileUp, Download, Filter, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../api';
import { ChecklistItem } from '../data';
import * as XLSX from 'xlsx';

export const BaseChecklist = () => {
    const { baseItems, setBaseItems, currentUser } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

    // Filter state
    const [filterPilar, setFilterPilar] = useState("");
    const [filterBloco, setFilterBloco] = useState("");
    const [filterTrilha, setFilterTrilha] = useState("");

    // Compute filter options
    const pilarOptions = useMemo(() => Array.from(new Set(baseItems.map(i => i.pilar))).filter(Boolean).sort(), [baseItems]);
    const blocoOptions = useMemo(() => Array.from(new Set(baseItems.map(i => i.bloco))).filter(Boolean).sort(), [baseItems]);
    const trilhaOptions = useMemo(() => Array.from(new Set(baseItems.map(i => i.trilha))).filter(Boolean).sort(), [baseItems]);

    // Filter items
    const filteredItems = useMemo(() => {
        return baseItems
            .filter(item => {
                const matchPilar = !filterPilar || item.pilar === filterPilar;
                const matchBloco = !filterBloco || item.bloco === filterBloco;
                const matchTrilha = !filterTrilha || item.trilha === filterTrilha;
                return matchPilar && matchBloco && matchTrilha;
            })
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [baseItems, filterPilar, filterBloco, filterTrilha]);
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
                const updateData = {
                    ...formData,
                    updatedBy: currentUser?.name || 'Sistema',
                    updatedAt: new Date().toISOString()
                };
                await api.updateBaseItem(editingItem.id, updateData);
                setBaseItems(baseItems.map(i => i.id === editingItem.id ? { ...i, ...updateData } as ChecklistItem : i));
            } else {
                const newItem = {
                    ...formData,
                    id: Math.random().toString(36).substr(2, 9),
                    code: formData.code || `${formData.pilar?.substring(0, 3).toUpperCase()}-${formData.bloco?.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100)}`,
                    createdBy: currentUser?.name || 'Sistema',
                    createdAt: new Date().toISOString()
                };
                await api.createBaseItem(newItem);
                setBaseItems([...baseItems, newItem as ChecklistItem]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar item base:", error);
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'Pilar': 'Gestão',
                'Bloco': '5S',
                'Trilha': 'Básico bem feito',
                'Item (Pergunta/Verificação)': 'As áreas estão limpas e organizadas?',
                'Descrição / Ajuda': 'Verificar se não há lixo no chão e se as ferramentas estão nos lugares devidos.',
                'Critérios de Pontuação': '3 - Tudo organizado; 1 - Parcial; 0 - Desorganizado',
                'Exige Evidência (Sim/Não)': 'Sim',
                'Item Ativo (Sim/Não)': 'Sim'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "modelo_importacao_checklist.xlsx");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const dataArr = evt.target?.result;
                const workbook = XLSX.read(dataArr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

                if (!jsonData || jsonData.length === 0) {
                    throw new Error("A planilha está vazia ou no formato incorreto.");
                }

                // Função auxiliar para achar a chave correta mesmo com espaços extras ou diferença de caixa
                const getVal = (row: any, ...aliases: string[]) => {
                    const keys = Object.keys(row);
                    for (const alias of aliases) {
                        const directMatch = keys.find(k => k.trim().toLowerCase() === alias.toLowerCase());
                        if (directMatch) return row[directMatch];
                    }
                    return '';
                };

                const existingItemKeys = new Set(baseItems.map(i => `${i.pilar?.trim().toLowerCase()}|${i.bloco?.trim().toLowerCase()}|${i.item?.trim().toLowerCase()}`));
                let skipCount = 0;

                const newItems: Partial<ChecklistItem>[] = [];
                
                jsonData.forEach((row, index) => {
                    const pilar = String(getVal(row, 'Pilar') || '').trim();
                    const bloco = String(getVal(row, 'Bloco') || '').trim();
                    const item = String(getVal(row, 'Item (Pergunta/Verificação)', 'Item', 'Pergunta') || '').trim();
                    
                    const key = `${pilar.toLowerCase()}|${bloco.toLowerCase()}|${item.toLowerCase()}`;
                    
                    if (existingItemKeys.has(key)) {
                        skipCount++;
                        return;
                    }

                    const rawTrilha = String(getVal(row, 'Trilha') || '').trim();
                    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    const nTrilha = normalize(rawTrilha);
                    
                    let trilha = "Básico bem feito"; // Default
                    if (nTrilha.includes("gerenciar") || nTrilha.includes("melhorar")) {
                        trilha = "Gerenciar para melhorar";
                    } else if (nTrilha.includes("basico") || nTrilha.includes("feito")) {
                        trilha = "Básico bem feito";
                    }
                    const descricao = getVal(row, 'Descrição / Ajuda', 'Descrição', 'Ajuda');
                    const criterios = getVal(row, 'Critérios de Pontuação', 'Critérios');
                    const exigeEvidenciaStr = String(getVal(row, 'Exige Evidência (Sim/Não)', 'Exige Evidência') || '').toLowerCase();
                    const ativoStr = String(getVal(row, 'Item Ativo (Sim/Não)', 'Ativo') || '').toLowerCase();

                    newItems.push({
                        id: Math.random().toString(36).substr(2, 9),
                        pilar,
                        bloco,
                        trilha: String(trilha),
                        item,
                        descricao: String(descricao),
                        criterios: String(criterios),
                        exigeEvidencia: exigeEvidenciaStr === 'sim' || exigeEvidenciaStr === 'true' || exigeEvidenciaStr === 's',
                        ativo: ativoStr !== 'não' && ativoStr !== 'false' && ativoStr !== 'n',
                        order: baseItems.length + newItems.length + 1,
                        code: `${String(pilar || 'XXX').substring(0, 3).toUpperCase()}-${String(bloco || 'XXX').substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
                        createdBy: currentUser?.name || 'Importação',
                        createdAt: new Date().toISOString()
                    });
                });

                if (newItems.length > 0) {
                    const response = await api.bulkCreateBaseItems(newItems);
                    if (response.error) {
                        throw new Error(response.error);
                    }
                    const updatedBaseItems = await api.getBaseItems();
                    setBaseItems(updatedBaseItems);
                    
                    const message = skipCount > 0 
                        ? `${newItems.length} itens importados com sucesso! (${skipCount} duplicidade(s) ignorada(s))`
                        : `${newItems.length} itens importados com sucesso!`;
                    alert(message);
                } else if (skipCount > 0) {
                    alert(`Nenhum item novo foi importado. ${skipCount} item(ns) já existiam no sistema.`);
                } else {
                    alert("Nenhum item válido encontrado na planilha.");
                }
            } catch (error: any) {
                console.error("Erro ao importar planilha:", error);
                alert(`Erro ao importar planilha: ${error.message || 'Verifique o formato do arquivo.'}`);
            } finally {
                setIsImporting(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1440px] mx-auto w-full px-4 py-8 space-y-6"
        >
            <div className="flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastro de Itens da Base</h2>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Gerencie os itens mestres que compõem a auditoria.</p>
                </motion.div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDownloadTemplate}
                        className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                        title="Baixar modelo de planilha"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Modelo</span>
                    </button>

                    <div className="relative">
                        <input
                            type="file"
                            id="import-excel"
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            disabled={isImporting}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => document.getElementById('import-excel')?.click()}
                            disabled={isImporting}
                            className={`${isImporting ? 'bg-gray-400' : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700'} text-gray-700 dark:text-zinc-300 border px-4 py-2 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center space-x-2 shadow-sm`}
                        >
                            <FileUp className="w-4 h-4" />
                            <span>{isImporting ? 'Importando...' : 'Importar'}</span>
                        </motion.button>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', nossaAcao: '', exigeEvidencia: false, ativo: true, order: baseItems.length + 1, criterios: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-colors flex items-center space-x-2 shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Novo Item Base</span>
                    </motion.button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-zinc-400 mr-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">Filtros</span>
                </div>

                <div className="flex-1 flex flex-wrap gap-4">
                    <div className="min-w-[150px]">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">Pilar</label>
                        <select
                            value={filterPilar}
                            onChange={(e) => setFilterPilar(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                        >
                            <option value="">Todos os Pilares</option>
                            {pilarOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">Bloco</label>
                        <select
                            value={filterBloco}
                            onChange={(e) => setFilterBloco(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                        >
                            <option value="">Todos os Blocos</option>
                            {blocoOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">Trilha</label>
                        <select
                            value={filterTrilha}
                            onChange={(e) => setFilterTrilha(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                        >
                            <option value="">Todas as Trilhas</option>
                            {trilhaOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {(filterPilar || filterBloco || filterTrilha) && (
                    <button
                        onClick={() => {
                            setFilterPilar("");
                            setFilterBloco("");
                            setFilterTrilha("");
                        }}
                        className="flex items-center space-x-2 text-red-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Limpar Filtros</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                        <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-medium">
                            <tr>
                                <th className="px-4 py-4">Pilar</th>
                                <th className="px-4 py-4">Bloco</th>
                                <th className="px-4 py-4">Trilha</th>
                                <th className="px-4 py-4">Item</th>
                                <th className="px-4 py-4">Critérios</th>
                                <th className="px-4 py-4 text-center">Evidência</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {filteredItems.map((item, idx) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.01 }}
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                >
                                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-zinc-200 whitespace-nowrap">{item.pilar}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{item.bloco}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-xs">
                                        {item.trilha ? (
                                            <span className="inline-flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100 dark:border-amber-500/20">
                                                {item.trilha}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 max-w-[220px] lg:max-w-[280px]">
                                        <div className="font-medium text-gray-900 dark:text-zinc-200 text-[13.5px] leading-snug" title={item.item}>{item.item}</div>
                                        {item.descricao && (
                                            <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 italic line-clamp-2 leading-tight" title={item.descricao}>
                                                {item.descricao}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 max-w-[250px] lg:max-w-[420px]">
                                        {item.criterios ? (
                                            <div className="text-[12px] text-gray-700 dark:text-zinc-300 bg-gray-50/50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700/50 font-medium leading-relaxed shadow-sm" title={item.criterios}>
                                                {item.criterios.split('\n').map((line, i) => (
                                                    <div key={i} className={i > 0 ? "mt-1.5 pt-1.5 border-t border-gray-200/50 dark:border-zinc-700/30" : ""}>
                                                        {line}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Não definido</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        {item.exigeEvidencia ? (
                                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 dark:border-amber-500/20">
                                                <Check className="w-3 h-3 mr-1" /> Sim
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded text-[10px] font-medium border border-gray-100 dark:border-zinc-800">
                                                <X className="w-3 h-3 mr-1" /> Não
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        {item.ativo ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[12px]">Ativo</span>
                                        ) : (
                                            <span className="text-red-500 dark:text-red-400 font-bold text-[12px]">Inativo</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col items-end">
                                            <div className="flex justify-end items-center space-x-1">
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
                                            </div>

                                            {(item.createdBy || item.updatedBy) && (
                                                <div className="mt-2 text-right pr-2">
                                                    {item.createdBy && (
                                                        <div className="text-[9px] text-gray-400 dark:text-zinc-500 leading-tight">
                                                            Criado: <span className="font-semibold text-gray-500 dark:text-zinc-400">{item.createdBy}</span>
                                                            <br />{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : ''}
                                                        </div>
                                                    )}
                                                    {item.updatedBy && (
                                                        <div className="text-[9px] text-amber-500/70 dark:text-amber-400/60 leading-tight mt-1 border-t border-gray-100 dark:border-zinc-800 pt-1">
                                                            Alterado: <span className="font-semibold">{item.updatedBy}</span>
                                                            <br />{item.updatedAt ? new Date(item.updatedAt).toLocaleString('pt-BR') : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
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
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Salvar Item</span>
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
