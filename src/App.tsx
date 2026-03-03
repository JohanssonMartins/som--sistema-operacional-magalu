import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HardHat, LayoutDashboard, ListChecks, Check, X, Plus, Save, Edit2,
  Users, Settings, Shield, Package, ShoppingCart, Leaf, ArrowUp, ArrowDown,
  LogOut, Mail, ShieldAlert, User as UserIcon, Bell, Sun, Moon, CheckCircle2, Circle, Database,
  Mic, Sliders, FileText, Award, RefreshCw, BarChart, Trash2, ChevronDown, Lock
} from "lucide-react";
import { ChecklistItem, INITIAL_CHECKLIST, Role, User, MOCK_USERS } from "./data";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

// --- CONSTANTES DE CONFIGURAÇÃO (FORA DO COMPONENTE PARA PERFORMANCE) ---
const UNIDADES_DISPONIVEIS = ['50', '94', '300', '350', '490', '550', '590', '991', '994', '1100', '1250', '1500', '1800', '2500', '2650', '2900', '5200'];

const PILAR_ORDER = ['Pessoas', 'Sustentabilidade', 'Cliente', 'Gestão', 'Armazém'];
const BLOCO_ORDER = [
  'Reconhecimento', 'Carreira', 'Desenvolvimento', 'Clima', 'Retenção', 'Atração', 'Cultura', 'Diversidade',
  'Gestão de Acidente', 'Ergonomia', 'Gestão de Fornecedores', 'Segurança Sanitária', 'PAE', 'Manutenção', 'Saúde', 'Gestão Meio Ambiente', 'Comportamento Seguro',
  'Prazo', 'Gestão do Transportador', 'Encantamento', 'Experiência do Cliente',
  'Maga Lean', 'Resolução de problema', 'Kaizen', 'Conselho', '5S', 'Agenda da Rotina',
  'Recebimento', 'Acuracidade', 'Expedição Leves', 'Expedição Pesado', 'Intralogística'
];

const getPilarWeight = (pilar: string) => {
  const idx = PILAR_ORDER.indexOf(pilar);
  return idx === -1 ? 999 : idx;
};

const getBlocoWeight = (bloco: string) => {
  const idx = BLOCO_ORDER.indexOf(bloco);
  return idx === -1 ? 999 : idx;
};

const LogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="38" y="22" width="55" height="13" rx="6.5" fill="url(#grad1)" />
    <rect x="20" y="41" width="72" height="13" rx="6.5" fill="url(#grad2)" />
    <rect x="28" y="60" width="63" height="13" rx="6.5" fill="url(#grad3)" />
    <rect x="20" y="79" width="68" height="13" rx="6.5" fill="url(#grad4)" />
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FF4B4B" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#D946EF" />
      </linearGradient>
      <linearGradient id="grad4" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
    </defs>
  </svg>
);

const DebouncedTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 2,
  disabled = false
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
      disabled={disabled}
    />
  );
};


const dashboardData = [
  { title: 'Pessoas', icon: Users, color: 'bg-[#7b52ab]', objetivo: 60, autoAuditoria: 72, autoColor: 'bg-[#22a06b]', oficial: 67, oficialColor: 'bg-[#22a06b]', dispersao: 5, dispersaoType: 'down' },
  { title: 'Gestão', icon: Settings, color: 'bg-[#2684ff]', objetivo: 58, autoAuditoria: 54, autoColor: 'bg-[#e34935]', oficial: 53, oficialColor: 'bg-[#e34935]', dispersao: 1, dispersaoType: 'up' },
  { title: 'Segurança', icon: Shield, color: 'bg-[#4a545e]', objetivo: 70, autoAuditoria: 67, autoColor: 'bg-[#e34935]', oficial: 65, oficialColor: 'bg-[#e34935]', dispersao: 2, dispersaoType: 'up' },
  { title: 'Armazém', icon: Package, color: 'bg-[#ff8b00]', objetivo: 60, autoAuditoria: 62, autoColor: 'bg-[#22a06b]', oficial: 58, oficialColor: 'bg-[#e34935]', dispersao: 4, dispersaoType: 'down' },
  { title: 'Clientes', icon: ShoppingCart, color: 'bg-[#00b8d9]', objetivo: 80, autoAuditoria: 82, autoColor: 'bg-[#22a06b]', oficial: 83, oficialColor: 'bg-[#22a06b]', dispersao: 1, dispersaoType: 'up' },
  { title: 'Sustentabilidade', icon: Leaf, color: 'bg-[#36b37e]', objetivo: 55, autoAuditoria: 57, autoColor: 'bg-[#22a06b]', oficial: 56, oficialColor: 'bg-[#22a06b]', dispersao: 1, dispersaoType: 'up' },
];

const getDueDateStatus = (prazo?: string) => {
  if (!prazo) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Using UTC to avoid timezone issues with YYYY-MM-DD strings
  const [year, month, day] = prazo.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'approaching';
  return 'ok';
};

const EVIDENCE_CATEGORIES = [
  { id: 'entrevistas', label: 'Entrevistas em campo', icon: Mic, bg: 'bg-pink-500' },
  { id: 'controles', label: 'Controles', icon: Sliders, bg: 'bg-orange-500' },
  { id: 'reunioes', label: 'Reuniões', icon: Users, bg: 'bg-purple-600' },
  { id: 'documentos', label: 'Documentos', icon: FileText, bg: 'bg-blue-500' },
  { id: 'treinamentos', label: 'Evidências de treinamentos em padrões', icon: Award, bg: 'bg-yellow-500' },
  { id: 'plano_acao', label: 'Plano de ação para desvios de KPIs críticos', icon: RefreshCw, bg: 'bg-blue-600' },
  { id: 'gestao_vista', label: 'Gestão à vista', icon: BarChart, bg: 'bg-green-600' },
];

export default function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@magalu.com');
  const [loginPassword, setLoginPassword] = useState('123');
  const [loginError, setLoginError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS DO SISTEMA ---
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState('home');
  const usersList = useLiveQuery(() => db.users.toArray()) || [];

  // --- ESTADOS DO CHECKLIST ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const baseItems = useLiveQuery(() => db.baseItems.toArray()) || [];
  const items = useLiveQuery(() => db.items.toArray()) || [];
  const [formData, setFormData] = useState<Partial<ChecklistItem>>({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', score: '1.0', exigeEvidencia: false, ativo: true, nossaAcao: '' });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- SINCRONIZAÇÃO AUTOMÁTICA DE NOVAS UNIDADES/ITENS ---
  useEffect(() => {
    const syncChecklists = async () => {
      if (baseItems.length === 0) return;

      const currentItems = await db.items.toArray();

      // Otimização: Criar mapas para busca O(1)
      const itemsMap = new Map<string, ChecklistItem>();
      const ghostMap = new Map<string, ChecklistItem>(); // Chave: unit + item_text

      currentItems.forEach(item => {
        itemsMap.set(item.id, item);
        ghostMap.set(`${item.unidade}-${item.item}`, item);
      });

      const allUnits = Array.from(new Set([
        ...UNIDADES_DISPONIVEIS,
        ...(usersList?.map(u => u.unidade) || [])
      ])).filter(u => u && u !== 'Master' && u !== 'Todas');

      const itemsToPut: ChecklistItem[] = [];
      const itemsToDelete: string[] = [];
      const validIds = new Set<string>();

      // 1. Constroi a Verdade Absoluta baseada nos BaseItems e em todas as Unidades Ativas
      for (const unit of allUnits) {
        for (const baseItem of baseItems) {
          const expectedId = `${unit}-${baseItem.id}`;
          validIds.add(expectedId);

          const existingItem = itemsMap.get(expectedId);

          if (!existingItem) {
            // Busca rápida por "fantasma" via mapa
            const ghost = ghostMap.get(`${unit}-${baseItem.item}`);
            if (ghost && ghost.id !== expectedId) {
              itemsToPut.push({
                ...ghost,
                id: expectedId,
                pilar: baseItem.pilar,
                bloco: baseItem.bloco,
                trilha: baseItem.trilha,
                item: baseItem.item,
                descricao: baseItem.descricao,
                score: baseItem.score,
                exigeEvidencia: baseItem.exigeEvidencia,
                ativo: baseItem.ativo,
                order: baseItem.order
              });
              itemsToDelete.push(ghost.id);
            } else {
              // Totalmente novo
              itemsToPut.push({
                ...baseItem,
                id: expectedId,
                unidade: unit,
                assigneeId: ''
              });
            }
          } else {
            // Atualiza caso os campos da Base tenham mudado
            const hasChanged =
              existingItem.pilar !== baseItem.pilar ||
              existingItem.bloco !== baseItem.bloco ||
              existingItem.ativo !== baseItem.ativo ||
              existingItem.item !== baseItem.item ||
              existingItem.order !== baseItem.order ||
              existingItem.descricao !== baseItem.descricao ||
              existingItem.exigeEvidencia !== baseItem.exigeEvidencia ||
              existingItem.nossaAcao !== baseItem.nossaAcao ||
              existingItem.score !== baseItem.score;

            if (hasChanged) {
              itemsToPut.push({
                ...existingItem,
                pilar: baseItem.pilar,
                bloco: baseItem.bloco,
                trilha: baseItem.trilha,
                item: baseItem.item,
                descricao: baseItem.descricao,
                score: baseItem.score,
                exigeEvidencia: baseItem.exigeEvidencia,
                ativo: baseItem.ativo,
                order: baseItem.order,
                nossaAcao: baseItem.nossaAcao
              });
            }
          }
        }
      }

      // 2. Limpa qualquer item que não pertença à Verdade Absoluta (itens fantasmas deletados ou corrompidos)
      for (const currentItem of currentItems) {
        if (!validIds.has(currentItem.id)) {
          if (!itemsToDelete.includes(currentItem.id)) {
            itemsToDelete.push(currentItem.id);
          }
        }
      }

      if (itemsToPut.length > 0) {
        await db.items.bulkPut(itemsToPut);
      }
      if (itemsToDelete.length > 0) {
        await db.items.bulkDelete(itemsToDelete);
      }
    };

    syncChecklists();
  }, [baseItems, usersList]);
  const [detailsModalPilar, setDetailsModalPilar] = useState<string | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [selectedPilarFilter, setSelectedPilarFilter] = useState('Todos');
  const [prioritySortOrder, setPrioritySortOrder] = useState<'none' | 'desc' | 'asc'>('none');
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedItemForEvidence, setSelectedItemForEvidence] = useState<ChecklistItem | null>(null);
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<{ url: string, name: string } | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('Todas');

  // --- ESTADOS DE USUÁRIOS (ADMIN) ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'COLABORADOR' as Role, password: '', photo: '', unidade: '' });

  // --- FUNÇÕES DE SISTEMA ---
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // --- FUNÇÕES DE AUTENTICAÇÃO ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      setSelectedUnit(user.unidade === 'Master' ? 'Todas' : (user.unidade || 'Todas'));
      setLoginError('');
      setActiveTab('home');
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginPassword('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setCurrentUser(prev => prev ? { ...prev, photo: base64String } : null);
        if (currentUser) {
          await db.users.update(currentUser.id, { photo: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- FUNÇÕES DA BASE DE CHECKLIST ---
  const handleAddBaseItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      delete payload.id; // Evita erro de sobrescrita de chave primária (ex: tentar mudar '6994-1' para '1')

      if (editingId) {
        await db.baseItems.update(editingId, payload);

        const allItems = await db.items.toArray();
        const itemsToUpdate = allItems.filter(item => item.id.endsWith(`-${editingId}`));
        if (itemsToUpdate.length > 0) {
          await Promise.all(itemsToUpdate.map(item => db.items.update(item.id, payload)));
        }
      } else {
        const newId = Date.now().toString();
        const newItem: ChecklistItem = {
          id: newId,
          code: `NEW-${newId.slice(-4)}`,
          order: baseItems.length + 1,
          ...payload
        } as ChecklistItem;
        await db.baseItems.add(newItem);

        const units = Array.from(new Set(usersList.map(u => u.unidade))).filter(u => u !== 'Master');
        const newItems = units.map(unit => ({ ...newItem, id: `${unit}-${newId}`, unidade: unit, assigneeId: '' }));
        if (newItems.length > 0) {
          await db.items.bulkAdd(newItems);
        }
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', score: '1.0', exigeEvidencia: false, ativo: true, nossaAcao: '' });
    } catch (error) {
      console.error("Erro ao salvar item da base:", error);
      alert("Houve um erro ao efetuar o salvamento. Verifique se os dados estão corretos.");
    }
  };

  const handleEditBaseItem = (item: ChecklistItem) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const openNewBaseItemModal = () => {
    setFormData({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', score: '1.0', exigeEvidencia: false, ativo: true, nossaAcao: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleAssignItem = async (itemId: string, assigneeId: string) => {
    await db.items.update(itemId, { assigneeId });
  };

  const handleUpdateItemField = async (itemId: string, field: keyof ChecklistItem, value: string) => {
    await db.items.update(itemId, { [field]: value } as any);
  };

  const handleEvaluateItem = async (itemId: string, aderente: boolean) => {
    await db.items.update(itemId, {
      completed: true,
      aderente,
      completedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    });
  };

  const handleUndoEvaluation = async (itemId: string) => {
    const item = await db.items.get(itemId);
    if (item) {
      const updatedItem = { ...item, completed: false };
      delete updatedItem.aderente;
      delete updatedItem.completedAt;
      await db.items.put(updatedItem);
    }
  };

  const handleEvaluateAuditoria = async (itemId: string, aderente: boolean) => {
    await db.items.update(itemId, {
      auditoriaRealizada: true,
      auditoriaAderente: aderente,
      auditoriaCompletedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    } as any);
  };

  const handleUndoAuditoria = async (itemId: string) => {
    const item = await db.items.get(itemId);
    if (item) {
      const updatedItem = { ...item, auditoriaRealizada: false };
      delete updatedItem.auditoriaAderente;
      delete updatedItem.auditoriaCompletedAt;
      await db.items.put(updatedItem);
    }
  };

  // --- FUNÇÕES DE USUÁRIOS ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      const existingUser = await db.users.get(editingUserId);
      const updatedUser = { ...existingUser, ...userFormData } as User;
      await db.users.put(updatedUser);
      if (currentUser?.id === editingUserId) {
        setCurrentUser({ ...currentUser, ...userFormData });
      }
    } else {
      const newId = Date.now().toString();
      const newUser: User = { id: newId, ...userFormData } as User;
      await db.users.add(newUser);

      // Check if the new user's unit already has items
      const unitExists = items.some(item => item.unidade === newUser.unidade);
      if (!unitExists && newUser.unidade && newUser.unidade !== 'Master') {
        const newItems = baseItems.map(item => ({ ...item, id: `${newUser.unidade}-${item.id}`, unidade: newUser.unidade, assigneeId: '' }));
        if (newItems.length > 0) {
          await db.items.bulkAdd(newItems);
        }
      }
    }

    setIsUserModalOpen(false);
    setUserFormData({ name: '', email: '', role: 'COLABORADOR', password: '', photo: '', unidade: '' });
  };

  const handleEditUser = (user: User) => {
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '',
      photo: user.photo || '',
      unidade: user.unidade
    });
    setEditingUserId(user.id);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      alert("Você não pode excluir a si mesmo enquanto estiver logado.");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      await db.users.delete(userId);
    }
  };

  // --- CÁLCULOS DO PAINEL DE CHECKLIST (MEMOIZADOS PARA PERFORMANCE) ---
  const dashboardStats = React.useMemo(() => {
    const vItems = items.filter(i => selectedUnit === 'Todas' ? true : i.unidade === selectedUnit);

    const aItems = vItems.filter(i => i.ativo);
    const tItems = aItems.length;
    const tResp = aItems.filter(i => i.completed).length;
    const tAder = aItems.filter(i => i.completed && i.aderente).length;

    const progTotal = tItems === 0 ? 0 : (tResp / tItems) * 100;
    const aderMedia = tItems === 0 ? 0 : (tAder / tItems) * 100;
    const sGeral = aderMedia >= 80 ? 'Aderente' : 'Não Aderente';

    const currentPilares = Array.from(new Set(aItems.map(i => i.pilar))).sort((a, b) => getPilarWeight(a) - getPilarWeight(b));

    const rPorPilar = currentPilares.map(pilar => {
      const pilarItems = aItems.filter(i => i.pilar === pilar);
      const pTotal = pilarItems.length;
      const pRespondidos = pilarItems.filter(i => i.completed).length;
      const pAderentes = pilarItems.filter(i => i.completed && i.aderente).length;
      const pNaoAderentes = pRespondidos - pAderentes;
      const pAuditoriasRealizadas = pilarItems.filter(i => i.auditoriaRealizada).length;
      const pAuditoriasConformes = pilarItems.filter(i => i.auditoriaRealizada && i.auditoriaAderente).length;

      const pProgresso = pTotal === 0 ? 0 : (pRespondidos / pTotal) * 100;
      // Adereência oficial deve calcular os conformes sobre os totais (ou sobre os realizados?)
      // Aderência normal é sobre o total de itens para espelhar a nota final do CD
      const pAuditoriaOficial = pTotal === 0 ? 0 : (pAuditoriasConformes / pTotal) * 100;
      const pAderencia = pTotal === 0 ? 0 : (pAderentes / pTotal) * 100;
      const pStatus = pAderencia >= 80 ? 'Aderente' : 'Não Aderente';

      return {
        pilar,
        total: pTotal,
        conforme: pAderentes,
        naoConforme: pNaoAderentes,
        progresso: pProgresso,
        auditoriaOficial: pAuditoriaOficial,
        aderencia: pAderencia,
        status: pStatus
      };
    });

    return {
      visibleItems: vItems,
      activeItems: aItems,
      totalItems: tItems,
      totalRespondidos: tResp,
      totalAderentes: tAder,
      progressoTotal: progTotal,
      aderenciaMedia: aderMedia,
      statusGeral: sGeral,
      resumoPorPilar: rPorPilar,
      pilares: currentPilares
    };
  }, [items, selectedUnit]);

  // Se não houver usuário logado, mostramos a tela de login (acima)
  // Mas por segurança, garantimos que as variáveis existam para o restante do render
  const {
    visibleItems, activeItems, totalItems, totalRespondidos, totalAderentes,
    progressoTotal, aderenciaMedia, statusGeral, resumoPorPilar, pilares
  } = dashboardStats;

  // --- TELA DE LOGIN ---
  if (!currentUser) {
    return (
      <div className={`${theme} min-h-screen`}>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
          {/* Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-colors duration-300"
          >
            <div className="absolute top-4 right-4">
              <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-3">
                <LogoIcon className="w-14 h-14" />
                <div className="flex flex-col items-start">
                  <span className="font-black italic text-4xl tracking-wider text-blue-700 dark:text-blue-400 drop-shadow-sm leading-none">S.O.M</span>
                  <span className="text-base font-medium text-gray-600 dark:text-zinc-300 mt-1 tracking-wide whitespace-nowrap">Sistema Operacional Magalu</span>
                  <div className="h-1 w-full mt-2 rounded-full bg-gradient-to-r from-[#ffcf00] via-[#ff3b30] to-[#c800ff]"></div>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </motion.div>
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
              <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold rounded-lg py-2.5 hover:bg-amber-400 transition-colors mt-6 shadow-lg shadow-amber-500/20">
                Entrar no Sistema
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-500 space-y-3">
              <p className="font-medium text-gray-600 dark:text-zinc-400 mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Contas de Teste (RBAC):</span>
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('admin@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Admin</span>
                  <span className="text-gray-500 dark:text-zinc-400">admin@magalu.com / 123</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('divisional@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">G. Divisional</span>
                  <span className="text-gray-500 dark:text-zinc-400">divisional@...</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('gerentecd@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Gerente CD</span>
                  <span className="text-gray-500 dark:text-zinc-400">gerentecd@...</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('donopilar@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Dono Pilar</span>
                  <span className="text-gray-500 dark:text-zinc-400">donopilar@...</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('auditor@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Auditor</span>
                  <span className="text-gray-500 dark:text-zinc-400">auditor@...</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('colab@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Colab</span>
                  <span className="text-gray-500 dark:text-zinc-400">colab@...</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-600">
              © 2026 Magalu | Feito com ❤ por J's Martins
            </div>
          </motion.div>
        </div>
      </div>
    );
  }



  // --- TELA PRINCIPAL (LOGADO) ---
  return (
    <div className={`${theme} min-h-screen`}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300">
        {/* Navigation Bar */}
        <nav className="border-b border-gray-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center gap-6 xl:gap-10">
              <div className="flex items-center cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
                <div className="flex items-center space-x-2">
                  <LogoIcon className="w-10 h-10" />
                  <div className="flex flex-col items-start">
                    <span className="font-black italic text-2xl tracking-wider text-blue-700 dark:text-blue-400 drop-shadow-sm leading-none">S.O.M</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1 tracking-wide whitespace-nowrap">Sistema Operacional Magalu</span>
                    <div className="h-1 w-full mt-1.5 rounded-full bg-gradient-to-r from-[#ffcf00] via-[#ff3b30] to-[#c800ff]"></div>
                  </div>
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => (currentUser?.role === 'ADMIN' || currentUser?.role === 'AUDITOR' || currentUser?.role === 'GERENTE_DIVISIONAL') && setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${isUnitDropdownOpen
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/50'
                    } ${(currentUser?.role !== 'ADMIN' && currentUser?.role !== 'AUDITOR' && currentUser?.role !== 'GERENTE_DIVISIONAL') ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  <div className={`p-1 rounded-md ${isUnitDropdownOpen ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start leading-tight pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Unidade</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-zinc-200">
                      {selectedUnit === 'Todas' ? 'Todos os CDs' : `Unidade ${selectedUnit}`}
                    </span>
                  </div>
                  {(currentUser?.role === 'ADMIN' || currentUser?.role === 'AUDITOR' || currentUser?.role === 'GERENTE_DIVISIONAL') && (
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                <AnimatePresence>
                  {isUnitDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 max-h-[400px] overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-[60] py-2 no-scrollbar scroll-smooth"
                    >
                      <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-zinc-800/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Selecione a Visão</span>
                      </div>
                      <button
                        onClick={() => { setSelectedUnit('Todas'); setIsUnitDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${selectedUnit === 'Todas'
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedUnit === 'Todas' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                        Todos os CDs
                      </button>
                      {UNIDADES_DISPONIVEIS.map(u => (
                        <button
                          key={u}
                          onClick={() => { setSelectedUnit(u); setIsUnitDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${selectedUnit === u
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedUnit === u ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                          Unidade {u}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors h-9 box-border ${activeTab === 'home' ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800/80' : 'text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors h-9 box-border ${activeTab === 'checklist' ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800/80' : 'text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
              >
                <ListChecks className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Preencher Check-List</span>
              </button>

              {/* Apenas ADMIN e GERENTES (Divisional e do CD) veem a base. Colaborador e Dono do Pilar não veem */}
              {(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'GERENTE_DO_CD') && (
                <button
                  onClick={() => setActiveTab('base-checklist')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors h-9 box-border ${activeTab === 'base-checklist' ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800/80' : 'text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                >
                  <Database className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Base Check-List</span>
                </button>
              )}

              {/* Apenas ADMIN vê a aba de usuários */}
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors h-9 box-border ${activeTab === 'users' ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800/80' : 'text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Usuários</span>
                </button>
              )}

              <div className="h-6 w-px bg-gray-300 dark:bg-zinc-800 mx-2 hidden sm:block"></div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
                title="Alternar Tema"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notificações */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-md transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {(visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length > 0 || visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length > 0) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notificações</h4>
                        <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length + visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length}
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {/* Atribuições Pendentes */}
                        {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length > 0 && (
                          <div className="p-2 bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800/50">
                            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Suas Atribuições</span>
                          </div>
                        )}
                        {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).map(task => (
                          <div key={`assign-${task.id}`} className="p-4 border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <p className="text-sm text-gray-800 dark:text-zinc-200 leading-snug">
                              Você foi designado para verificar: <strong className="text-amber-600 dark:text-amber-400 block mt-1">{task.item}</strong>
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded border border-gray-200 dark:border-zinc-800">{task.pilar}</span>
                              <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded border border-gray-200 dark:border-zinc-800">{task.bloco}</span>
                            </div>
                          </div>
                        ))}

                        {/* Prazos Vencendo/Vencidos */}
                        {visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length > 0 && (
                          <div className="p-2 bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800/50">
                            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Prazos</span>
                          </div>
                        )}
                        {visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).map(task => {
                          const status = getDueDateStatus(task.prazo);
                          return (
                            <div key={`deadline-${task.id}`} className={`p-4 border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${status === 'overdue' ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-amber-50/50 dark:bg-amber-900/10'}`}>
                              <p className="text-sm text-gray-800 dark:text-zinc-200 leading-snug">
                                {status === 'overdue' ? <span className="text-red-600 dark:text-red-400 font-bold">Atrasado: </span> : <span className="text-amber-600 dark:text-amber-400 font-bold">Vencendo em breve: </span>}
                                {task.item}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded border border-gray-200 dark:border-zinc-800">Prazo: {task.prazo}</span>
                              </div>
                            </div>
                          );
                        })}

                        {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length === 0 && visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length === 0 && (
                          <div className="p-6 text-center text-gray-500 dark:text-zinc-500 text-sm flex flex-col items-center">
                            <Check className="w-8 h-8 text-gray-300 dark:text-zinc-700 mb-2" />
                            <p>Nenhuma notificação no momento.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Perfil do Usuário */}
              <div className="flex items-center space-x-3 pl-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white leading-none">{currentUser.name}</span>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">{currentUser.unidade}</span>
                    <span className={`text-[10px] font-bold ${currentUser.role === 'ADMIN' ? 'text-blue-600 dark:text-blue-400' :
                      currentUser.role === 'GERENTE_DIVISIONAL' ? 'text-purple-600 dark:text-purple-400' :
                        currentUser.role === 'GERENTE_DO_CD' ? 'text-amber-600 dark:text-amber-400' :
                          currentUser.role === 'DONO_DO_PILAR' ? 'text-orange-600 dark:text-orange-400' :
                            'text-emerald-600 dark:text-emerald-400'
                      }`}>
                      {currentUser.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div
                  className="relative group cursor-pointer rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar foto de perfil"
                >
                  {currentUser.photo ? (
                    <img src={currentUser.photo} alt="Perfil" className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full object-cover border border-gray-300 dark:border-zinc-700" />
                  ) : (
                    <div className="bg-gray-200 dark:bg-zinc-800 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full border border-gray-300 dark:border-zinc-700 group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                      <UserIcon className="w-4 h-4 text-gray-500 dark:text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Foto</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-4">
          {activeTab === 'home' ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div>
                <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                  Auditoria - <span className="text-xl font-medium text-gray-700 dark:text-gray-300">{selectedUnit === 'Todas' ? 'Visão Empresa' : `CD ${selectedUnit}`}</span>
                </h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Exemplo de consolidação após auditoria oficial</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.map((card, idx) => {
                  const Icon = card.icon;
                  // Map card titles to base pilar names for exact matches
                  let pilarName = card.title;
                  if (card.title === 'Clientes') pilarName = 'Cliente';
                  else if (card.title === 'Segurança') pilarName = 'Sustentabilidade'; // Base tem bloco Segurança Sanitária dentro de Sustentabilidade

                  const pilarInfo = resumoPorPilar.find(p => p.pilar === pilarName);
                  const actualAutoAuditoria = pilarInfo ? Math.round(pilarInfo.aderencia) : 0;
                  const actualOficialAuditoria = pilarInfo ? Math.round((pilarInfo as any).auditoriaOficial || 0) : 0;
                  const dispersao = Math.abs(actualAutoAuditoria - actualOficialAuditoria);
                  let dispersaoType = 'up';
                  if (actualAutoAuditoria > actualOficialAuditoria) {
                    dispersaoType = 'down';
                  } else if (actualOficialAuditoria > actualAutoAuditoria) {
                    dispersaoType = 'up';
                  } else {
                    dispersaoType = card.dispersaoType; // fallback if equal
                  }

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 group"
                    >
                      <div className={`${card.color} px-4 py-3 flex items-center space-x-3 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: (idx * 0.1) + 0.3, duration: 0.5 }}>
                          <Icon className="w-5 h-5 text-white relative z-10" />
                        </motion.div>
                        <h3 className="text-white font-semibold text-lg relative z-10">{card.title}</h3>
                      </div>

                      <div className="p-5 flex gap-4">
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-zinc-400">Objetivo</span>
                              <span className="text-gray-900 dark:text-zinc-200 font-bold">{card.objetivo}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${card.objetivo}%` }} transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }} className="h-full bg-[#6b778c] rounded-full" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-zinc-400">Auto Auditoria</span>
                              <span className="text-gray-900 dark:text-zinc-200 font-bold">{actualAutoAuditoria}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${actualAutoAuditoria}%` }} transition={{ duration: 1, delay: 0.7 + (idx * 0.1), ease: "easeOut" }} className={`h-full ${card.autoColor} rounded-full`} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-zinc-400">Auditoria Oficial</span>
                              <span className="text-gray-900 dark:text-zinc-200 font-bold">{actualOficialAuditoria}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${actualOficialAuditoria}%` }} transition={{ duration: 1, delay: 0.9 + (idx * 0.1), ease: "easeOut" }} className={`h-full ${card.oficialColor} rounded-full`} />
                            </div>
                          </div>
                        </div>

                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.2 + (idx * 0.1), type: "spring" }} className="w-24 bg-gray-50 dark:bg-zinc-800/50 rounded-lg flex flex-col items-center justify-center p-2 border border-gray-200 dark:border-zinc-700/30 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-default">
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium mb-2 uppercase tracking-wider">Dispersão</span>
                          <div className={`flex items-center space-x-1 font-bold text-xl whitespace-nowrap ${dispersaoType === 'up' ? 'text-[#36b37e]' : 'text-[#e34935]'}`}>
                            {dispersaoType === 'up' ?
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowUp className="w-4 h-4" strokeWidth={3} /></motion.div> :
                              <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowDown className="w-4 h-4" strokeWidth={3} /></motion.div>
                            }
                            <span className="flex items-baseline space-x-1"><span>{dispersao}</span> <span className="text-sm">pp</span></span>
                            {dispersaoType === 'up' ?
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}><ArrowUp className="w-4 h-4" strokeWidth={3} /></motion.div> :
                              <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}><ArrowDown className="w-4 h-4" strokeWidth={3} /></motion.div>
                            }
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'base-checklist' && (currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'GERENTE_DO_CD') ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base de Dados do Check-List</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Gerencie os itens padrão que aparecerão nos preenchimentos.</p>
                </div>
                <button
                  onClick={openNewBaseItemModal}
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
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Pilar</th>
                        <th className="px-6 py-4">Bloco</th>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Evidência</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {baseItems.map((baseItem) => (
                        <tr key={baseItem.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-zinc-400">{baseItem.code}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200">{baseItem.pilar}</td>
                          <td className="px-6 py-4">{baseItem.bloco}</td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate" title={baseItem.item}>{baseItem.item}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-200 dark:border-blue-500/20">
                              {baseItem.score}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {baseItem.exigeEvidencia ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded text-xs font-medium">
                                <Check className="w-3 h-3" /> <span>Sim</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-medium">
                                <X className="w-3 h-3" /> <span>Não</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {baseItem.ativo ? (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Ativo</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 text-xs font-medium">Inativo</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEditBaseItem(baseItem)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Editar Item Base"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'checklist' ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preenchimento do Check-List</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Execute a auditoria e atribua responsáveis.</p>
                </div>
              </div>

              {/* Painel de Resumo */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm mb-6">
                {/* Top Section */}
                <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-zinc-800 border-b border-gray-200 dark:border-zinc-800 p-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{progressoTotal.toFixed(1).replace('.', ',')}%</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Progresso Total</div>
                    <div className="text-xs text-gray-400 dark:text-zinc-500">({totalRespondidos}/{totalItems} itens)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{aderenciaMedia.toFixed(1).replace('.', ',')}%</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Aderência Média</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusGeral}</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Status Geral</div>
                  </div>
                </div>

                {/* Table Section */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">Resumo por Pilar</h3>
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedPilarFilter}
                      onChange={(e) => setSelectedPilarFilter(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="Minhas Atribuições">Minhas atribuições</option>
                      <option value="Todos">Todos os Pilares</option>
                      {pilares.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowOnlyPending(!showOnlyPending)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showOnlyPending ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                      {showOnlyPending ? 'Mostrar Todos' : 'Ver Pendências'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-sm text-gray-600 dark:text-zinc-300">
                    <thead className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Pilar</th>
                        <th className="px-6 py-4">Total de Itens</th>
                        <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Conforme</th>
                        <th className="px-6 py-4 text-red-600 dark:text-red-400">Não Conforme</th>
                        <th className="px-6 py-4">Progresso</th>
                        <th className="px-6 py-4">Aderência</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {resumoPorPilar.map(row => (
                        <tr key={row.pilar} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 text-left font-bold text-gray-900 dark:text-zinc-100">{row.pilar}</td>
                          <td className="px-6 py-4">{row.total}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{row.conforme}</td>
                          <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">{row.naoConforme}</td>
                          <td className="px-6 py-4">{row.progresso.toFixed(1).replace('.', ',')}%</td>
                          <td className="px-6 py-4">{row.aderencia.toFixed(1).replace('.', ',')}%</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold text-white ${row.status === 'Aderente' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setDetailsModalPilar(row.pilar)}
                              className="px-3 py-1.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-950 overflow-hidden">
                <div className="overflow-x-auto pb-8">
                  {selectedUnit === 'Todas' ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-zinc-400">
                      <LayoutDashboard className="w-16 h-16 mb-4 text-gray-300 dark:text-zinc-700" />
                      <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-300 mb-2">Visão Geral dos CDs</h3>
                      <p className="max-w-md">Selecione uma Unidade/CD específica no menu superior para preencher ou visualizar os itens do Check-List detalhadamente.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                      <thead className="hidden">
                        <tr>
                          <th>Pilar</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {visibleItems
                          .filter(i => i.ativo && (!showOnlyPending || !i.completed) && (selectedPilarFilter === 'Todos' || (selectedPilarFilter === 'Minhas Atribuições' ? (i.assigneeId === currentUser?.id || i.assigneeId2 === currentUser?.id || i.assigneeId3 === currentUser?.id) : i.pilar === selectedPilarFilter)))
                          .sort((a, b) => {
                            const wPilarA = getPilarWeight(a.pilar);
                            const wPilarB = getPilarWeight(b.pilar);
                            if (wPilarA !== wPilarB) return wPilarA - wPilarB;

                            const wBlocoA = getBlocoWeight(a.bloco);
                            const wBlocoB = getBlocoWeight(b.bloco);
                            if (wBlocoA !== wBlocoB) return wBlocoA - wBlocoB;

                            if (prioritySortOrder === 'none') return (a.order || 0) - (b.order || 0);

                            const weight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                            const wA = weight[a.prioridade || 'Média'];
                            const wB = weight[b.prioridade || 'Média'];
                            return prioritySortOrder === 'desc' ? wB - wA : wA - wB;
                          })
                          .map((checkItem) => {
                            const dueDateStatus = getDueDateStatus(checkItem.prazo);
                            const isApproaching = dueDateStatus === 'approaching' && !checkItem.completed;
                            const isOverdue = dueDateStatus === 'overdue' && !checkItem.completed;

                            return (
                              <React.Fragment key={checkItem.id}>
                                {/* Row 1: Headers for Item & Score */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/80">
                                  <td rowSpan={6} className="border border-gray-300 dark:border-zinc-700 p-2 w-32 bg-white dark:bg-zinc-900 overflow-hidden">
                                    <div className="flex flex-col items-center justify-center h-full space-y-1">
                                      {checkItem.completed && (
                                        <motion.div
                                          initial={{ scale: 0, opacity: 0, y: 10 }}
                                          animate={{ scale: 1, opacity: 1, y: 0 }}
                                          className="text-amber-500/80"
                                          title="Item Bloqueado"
                                        >
                                          <Lock className="w-4 h-4" />
                                        </motion.div>
                                      )}
                                      <div className="text-center">
                                        <div className="font-bold text-gray-900 dark:text-white leading-tight">{checkItem.pilar}</div>
                                        <div className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">{checkItem.bloco}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 font-bold italic text-center text-gray-700 dark:text-zinc-300">
                                    Item a Verificar
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 font-bold italic text-center text-gray-700 dark:text-zinc-300 w-24">
                                    Score
                                  </td>
                                  <td colSpan={5} className="border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-center text-orange-500 text-lg">Auditoria</td>
                                </tr>

                                {/* Row 2: Item content & Score value */}
                                <tr className="bg-white dark:bg-zinc-900">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <div className="font-bold text-gray-900 dark:text-white">{checkItem.item}</div>
                                    <div className="text-xs text-gray-600 dark:text-zinc-400 mt-1">{checkItem.descricao}</div>
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-center text-xl font-bold text-gray-900 dark:text-white">
                                    {checkItem.score}
                                  </td>
                                  <td colSpan={5} className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <DebouncedTextarea
                                      value={checkItem.auditoriaTexto || ''}
                                      onChange={(val) => handleUpdateItemField(checkItem.id, 'auditoriaTexto', val)}
                                      placeholder="Digite o texto aqui"
                                      className="w-full bg-white/50 dark:bg-black/20 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg text-sm text-center text-orange-500 font-semibold placeholder-orange-300 dark:placeholder-orange-700 resize-y min-h-[50px] p-2 transition-all duration-200 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
                                      rows={2}
                                      disabled={currentUser.role !== 'AUDITOR'}
                                    />
                                  </td>
                                </tr>

                                {/* Row 3: Action Headers */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/80 text-center text-xs font-bold italic text-gray-700 dark:text-zinc-300">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-emerald-600 dark:text-emerald-400">Nossa ação</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Prioridade</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Prazo</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Atribuído a</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Período da ação</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Status</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-orange-500">Auditoria check</td>
                                </tr>

                                {/* Row 4: Action Values */}
                                <tr className="bg-white dark:bg-zinc-900 text-center">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <DebouncedTextarea
                                      value={checkItem.nossaAcao || ''}
                                      onChange={(val) => handleUpdateItemField(checkItem.id, 'nossaAcao', val)}
                                      placeholder="Descreva a ação a ser tomada..."
                                      className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-zinc-700/50 hover:border-gray-300 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-y min-h-[70px] p-3 transition-all duration-200 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5]"
                                      rows={2}
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <select
                                      value={checkItem.prioridade || 'Média'}
                                      onChange={(e) => handleUpdateItemField(checkItem.id, 'prioridade', e.target.value)}
                                      className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    >
                                      <option value="Alta" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">alta</option>
                                      <option value="Média" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">média</option>
                                      <option value="Baixa" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">baixa</option>
                                    </select>
                                  </td>
                                  <td className={`border border-gray-300 dark:border-zinc-700 p-2 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : isApproaching ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                                    <input
                                      type="date"
                                      value={checkItem.prazo || ''}
                                      onChange={(e) => handleUpdateItemField(checkItem.id, 'prazo', e.target.value)}
                                      className={`w-full bg-transparent border-none focus:ring-0 text-center text-sm italic cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed ${isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : isApproaching ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-700 dark:text-zinc-300'}`}
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <div className="flex flex-col space-y-1">
                                      <select
                                        value={checkItem.assigneeId || ''}
                                        onChange={(e) => handleUpdateItemField(checkItem.id, 'assigneeId', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR')}
                                      >
                                        <option value="" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">Não atribuído</option>
                                        {usersList.filter(u => u.unidade === checkItem.unidade && u.id !== checkItem.assigneeId2 && u.id !== checkItem.assigneeId3).map(u => (
                                          <option key={u.id} value={u.id} className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">{u.name.split(' ')[0]}</option>
                                        ))}
                                      </select>

                                      <select
                                        value={checkItem.assigneeId2 || ''}
                                        onChange={(e) => handleUpdateItemField(checkItem.id, 'assigneeId2', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR')}
                                      >
                                        <option value="" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">Não atribuído</option>
                                        {usersList.filter(u => u.unidade === checkItem.unidade && u.id !== checkItem.assigneeId && u.id !== checkItem.assigneeId3).map(u => (
                                          <option key={`a2-${u.id}`} value={u.id} className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">{u.name.split(' ')[0]}</option>
                                        ))}
                                      </select>

                                      <select
                                        value={checkItem.assigneeId3 || ''}
                                        onChange={(e) => handleUpdateItemField(checkItem.id, 'assigneeId3', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR')}
                                      >
                                        <option value="" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">Não atribuído</option>
                                        {usersList.filter(u => u.unidade === checkItem.unidade && u.id !== checkItem.assigneeId && u.id !== checkItem.assigneeId2).map(u => (
                                          <option key={`a3-${u.id}`} value={u.id} className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">{u.name.split(' ')[0]}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <input
                                      type="date"
                                      value={checkItem.periodoAcao || ''}
                                      onChange={(e) => handleUpdateItemField(checkItem.id, 'periodoAcao', e.target.value)}
                                      className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    {checkItem.completed ? (
                                      <div className="flex flex-col items-center justify-center space-y-1">
                                        <div className="flex items-center justify-center space-x-2">
                                          {checkItem.aderente ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm italic whitespace-nowrap">Conforme <Check className="w-4 h-4 inline" /></span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400 font-bold text-sm italic whitespace-nowrap">Não Conforme <X className="w-4 h-4 inline" /></span>
                                          )}
                                          {(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3)) && (
                                            <button onClick={() => handleUndoEvaluation(checkItem.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors" title="Desfazer">
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        {checkItem.completedAt && (
                                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{checkItem.completedAt}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center space-x-2">
                                        <span className="text-gray-500 dark:text-zinc-400 font-bold text-sm italic">Pendente</span>
                                        {(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3)) && (
                                          <>
                                            <button onClick={() => handleEvaluateItem(checkItem.id, true)} className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors" title="Marcar como Conforme">
                                              <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEvaluateItem(checkItem.id, false)} className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Marcar como Não Conforme">
                                              <X className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    {checkItem.auditoriaRealizada ? (
                                      <div className="flex flex-col items-center justify-center space-y-1">
                                        <div className="flex items-center justify-center space-x-2">
                                          {checkItem.auditoriaAderente ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm italic whitespace-nowrap">Conforme <Check className="w-4 h-4 inline" /></span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400 font-bold text-sm italic whitespace-nowrap">Não Conforme <X className="w-4 h-4 inline" /></span>
                                          )}
                                          {currentUser.role === 'AUDITOR' && (
                                            <button onClick={() => handleUndoAuditoria(checkItem.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors" title="Desfazer">
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        {checkItem.auditoriaCompletedAt && (
                                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{checkItem.auditoriaCompletedAt}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center space-x-2">
                                        <span className="text-gray-500 dark:text-zinc-400 font-bold text-sm italic">Pendente</span>
                                        {currentUser.role === 'AUDITOR' && (
                                          <>
                                            <button onClick={() => handleEvaluateAuditoria(checkItem.id, true)} className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors" title="Aprovar">
                                              <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEvaluateAuditoria(checkItem.id, false)} className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Rejeitar">
                                              <X className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>

                                {/* Row 5: Justificativa & Evidencias Headers */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/50 text-center text-xs font-bold italic text-gray-700 dark:text-zinc-300">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-gray-500">Justificativa do responsável</td>
                                  <td colSpan={6} className="border border-gray-300 dark:border-zinc-700 p-2">Anexa Evidências</td>
                                </tr>

                                {/* Row 6: Justificativa & Evidencias Values */}
                                <tr className="bg-white dark:bg-zinc-900 text-center">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <DebouncedTextarea
                                      value={checkItem.justificativaResponsavel || ''}
                                      onChange={(val) => handleUpdateItemField(checkItem.id, 'justificativaResponsavel', val)}
                                      placeholder="Justifique o motivo de não conseguir atender ao item..."
                                      className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-zinc-700/50 hover:border-gray-300 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-y min-h-[70px] p-3 transition-all duration-200 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5]"
                                      rows={2}
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td colSpan={6} className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <div className="flex justify-around items-start">
                                      {EVIDENCE_CATEGORIES.map(cat => {
                                        const count = checkItem.evidencias?.filter(e => e.category === cat.id).length || 0;
                                        return (
                                          <button
                                            key={cat.id}
                                            onClick={() => {
                                              const canAccess = currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3;
                                              if (!canAccess) return;
                                              setSelectedItemForEvidence(checkItem);
                                              setSelectedEvidenceCategory(cat.id);
                                              setIsEvidenceModalOpen(true);
                                            }}
                                            disabled={!(currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3)}
                                            className="flex flex-col items-center justify-start w-20 text-center group relative disabled:opacity-40 disabled:cursor-not-allowed"
                                          >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm mb-1 transition-transform group-hover:scale-110 ${cat.bg}`}>
                                              <cat.icon className="w-5 h-5" />
                                            </div>
                                            {count > 0 && (
                                              <span className="absolute top-0 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-zinc-900">
                                                {count}
                                              </span>
                                            )}
                                            <span className="text-[10px] leading-tight text-gray-700 dark:text-gray-300 italic">{cat.label}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>

                                {/* Spacer Row to separate items */}
                                <tr className="bg-gray-50 dark:bg-zinc-950 border-none">
                                  <td colSpan={8} className="h-8 border-none bg-gray-50 dark:bg-zinc-950"></td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' && (currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DIVISIONAL') ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Controle de acesso e permissões do sistema.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setUserFormData({ name: '', email: '', role: 'COLABORADOR', password: '', photo: '', unidade: '' });
                    setIsUserModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-500 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Usuário</span>
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
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
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                              user.role === 'AUDITOR' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                user.role === 'GERENTE_DIVISIONAL' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
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
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-md transition-colors focus:opacity-100"
                              title="Editar Usuário"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-colors focus:opacity-100"
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
              </div>
            </div>
          ) : null}
        </main>

        {/* Modal Novo Item de Base */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Editar Item da Base' : 'Novo Item da Base'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddBaseItem} className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Pilar</label>
                      <input required type="text" value={formData.pilar} onChange={(e) => setFormData({ ...formData, pilar: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Pessoas" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Bloco</label>
                      <input required type="text" value={formData.bloco} onChange={(e) => setFormData({ ...formData, bloco: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Reconhecimento" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Trilha</label>
                      <input required type="text" value={formData.trilha} onChange={(e) => setFormData({ ...formData, trilha: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Básico bem feito" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Item (Pergunta/Verificação)</label>
                    <input required type="text" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Programa de reconhecimento formalizado?" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Descrição / Instrução</label>
                    <textarea required value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[80px]" placeholder="Instruções detalhadas sobre como auditar este item..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                      <span>Nossa ação (Padrão)</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500 font-normal italic">- Opcional</span>
                    </label>
                    <textarea value={formData.nossaAcao || ''} onChange={(e) => setFormData({ ...formData, nossaAcao: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[60px]" placeholder="Ação padrão a ser tomada que será distribuída para todos..." />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Score (Peso)</label>
                      <input type="number" step="0.1" value={formData.score} onChange={(e) => setFormData({ ...formData, score: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: 1.0" />
                    </div>
                    <div className="space-y-2 flex flex-col justify-center pt-6">
                      <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.exigeEvidencia} onChange={(e) => setFormData({ ...formData, exigeEvidencia: e.target.checked })} className="peer sr-only" />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded bg-gray-50 dark:bg-zinc-950 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                          <Check className="w-3.5 h-3.5 text-white dark:text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Exige Evidência?</span>
                      </label>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center pt-6">
                      <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} className="peer sr-only" />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded bg-gray-50 dark:bg-zinc-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                          <Check className="w-3.5 h-3.5 text-white dark:text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Item Ativo?</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-400 transition-colors flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Salvar Alterações' : 'Salvar Item'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Novo Usuário (Apenas Admin) */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingUserId ? 'Editar Usuário' : 'Criar Novo Usuário'}</h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="relative group">
                      {userFormData.photo ? (
                        <img src={userFormData.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 transition-colors">
                          <UserIcon className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={() => document.getElementById('newUserPhoto')?.click()}
                      >
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Foto</span>
                      </div>
                      {userFormData.photo && (
                        <button
                          type="button"
                          onClick={() => setUserFormData({ ...userFormData, photo: '' })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      id="newUserPhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setUserFormData({ ...userFormData, photo: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nome Completo</label>
                    <input required type="text" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Ex: João Silva" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Unidade/CD</label>
                    <select required value={userFormData.unidade} onChange={(e) => setUserFormData({ ...userFormData, unidade: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Selecione uma Unidade/CD</option>
                      <option value="Master">Master</option>
                      <option value="50">50</option>
                      <option value="94">94</option>
                      <option value="300">300</option>
                      <option value="350">350</option>
                      <option value="490">490</option>
                      <option value="550">550</option>
                      <option value="590">590</option>
                      <option value="991">991</option>
                      <option value="994">994</option>
                      <option value="1100">1100</option>
                      <option value="1250">1250</option>
                      <option value="1500">1500</option>
                      <option value="1800">1800</option>
                      <option value="2500">2500</option>
                      <option value="2650">2650</option>
                      <option value="2900">2900</option>
                      <option value="5200">5200</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">E-mail</label>
                    <input required type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="joao@magalu.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Senha Temporária</label>
                    <input required type="password" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="••••••" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nível de Acesso (Papel)</label>
                    <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as Role })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                      <option value="COLABORADOR">Colaborador (Apenas visualiza)</option>
                      <option value="DONO_DO_PILAR">Dono do Pilar (Edita e atribui no Check-List)</option>
                      <option value="GERENTE_DO_CD">Gerente do CD (Pode editar Check-List)</option>
                      <option value="GERENTE_DIVISIONAL">Gerente Divisional (Visualiza todas as unidades, não edita)</option>
                      <option value="ADMIN">Administrador (Acesso Total)</option>
                      <option value="AUDITOR">Auditor (Validação de Check-list)</option>
                    </select>
                  </div>

                  <div className="pt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Evidence Modal */}
        <AnimatePresence>
          {isEvidenceModalOpen && selectedItemForEvidence && selectedEvidenceCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Evidências</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{selectedItemForEvidence.item}</p>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">
                      {EVIDENCE_CATEGORIES.find(c => c.id === selectedEvidenceCategory)?.label}
                    </p>
                  </div>
                  <button onClick={() => setIsEvidenceModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Upload Section - Permite apenas quem pode editar */}
                  {((!selectedItemForEvidence.completed || currentUser.role === 'ADMIN') && (currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === selectedItemForEvidence.assigneeId || currentUser.id === selectedItemForEvidence.assigneeId2 || currentUser.id === selectedItemForEvidence.assigneeId3)) ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <input
                        type="file"
                        id="evidence-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (!selectedItemForEvidence) return;
                              const newEvidence = { name: file.name, url: reader.result as string, category: selectedEvidenceCategory || '' };
                              const item = await db.items.get(selectedItemForEvidence.id);
                              if (item) {
                                const newEvidencias = [...(item.evidencias || []), newEvidence];
                                setSelectedItemForEvidence({ ...item, evidencias: newEvidencias });
                                await db.items.update(item.id, { evidencias: newEvidencias });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Clique para anexar evidência</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Imagens, PDFs ou documentos</span>
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        O seu nível de acesso atual permite apenas visualização dos anexos.
                      </p>
                    </div>
                  )}

                  {/* Evidence List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Arquivos Anexados</h4>
                    {(() => {
                      const categoryEvidences = selectedItemForEvidence.evidencias?.filter(e => e.category === selectedEvidenceCategory) || [];
                      return categoryEvidences.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {categoryEvidences.map((ev, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setPreviewEvidence(ev)}
                                className="flex items-center space-x-3 overflow-hidden text-left hover:opacity-80 transition-opacity"
                              >
                                <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded flex items-center justify-center flex-shrink-0">
                                  {ev.url.startsWith('data:image') ? (
                                    <img src={ev.url} alt="thumb" className="w-full h-full object-cover rounded" />
                                  ) : (
                                    <Database className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">{ev.name}</span>
                              </button>
                              <div className="flex items-center space-x-2 ml-4">
                                <a href={ev.url} download={ev.name} className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded transition-colors" title="Baixar">
                                  <ArrowDown className="w-4 h-4" />
                                </a>
                                {((!selectedItemForEvidence.completed || currentUser.role === 'ADMIN') && (currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === selectedItemForEvidence.assigneeId || currentUser.id === selectedItemForEvidence.assigneeId2 || currentUser.id === selectedItemForEvidence.assigneeId3)) && (
                                  <button
                                    onClick={async () => {
                                      if (!selectedItemForEvidence) return;
                                      const item = await db.items.get(selectedItemForEvidence.id);
                                      if (item && item.evidencias) {
                                        const originalIndex = item.evidencias.findIndex(e => e.name === ev.name && e.url === ev.url);
                                        if (originalIndex !== -1) {
                                          const newEvidencias = item.evidencias.filter((_, index) => index !== originalIndex);
                                          setSelectedItemForEvidence({ ...item, evidencias: newEvidencias });
                                          await db.items.update(item.id, { evidencias: newEvidencias });
                                        }
                                      }
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition-colors"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">Remover</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg border-dashed">
                          <p className="text-sm text-gray-500 dark:text-zinc-400">Nenhuma evidência anexada ainda.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Preview Evidence Modal */}
        <AnimatePresence>
          {previewEvidence && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">{previewEvidence.name}</h3>
                  <div className="flex items-center space-x-2">
                    <a
                      href={previewEvidence.url}
                      download={previewEvidence.name}
                      className="px-3 py-1.5 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      <ArrowDown className="w-4 h-4" />
                      <span>Baixar</span>
                    </a>
                    <button onClick={() => setPreviewEvidence(null)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-zinc-950 flex items-center justify-center min-h-[50vh]">
                  {previewEvidence.url.startsWith('data:image') ? (
                    <img src={previewEvidence.url} alt={previewEvidence.name} className="max-w-full max-h-[70vh] object-contain rounded shadow-sm" />
                  ) : previewEvidence.url.startsWith('data:application/pdf') ? (
                    <object data={previewEvidence.url} type="application/pdf" className="w-full h-[70vh] rounded">
                      <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded">
                        <p className="mb-4 text-gray-700 dark:text-zinc-300">O navegador não suporta a visualização deste PDF.</p>
                        <a href={previewEvidence.url} download={previewEvidence.name} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-block">Baixar PDF</a>
                      </div>
                    </object>
                  ) : (
                    <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 max-w-md mx-auto">
                      <Database className="w-16 h-16 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Visualização não disponível</h4>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Este tipo de arquivo não pode ser visualizado diretamente no navegador. Por favor, faça o download para abri-lo.</p>
                      <a href={previewEvidence.url} download={previewEvidence.name} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                        <ArrowDown className="w-4 h-4" />
                        <span>Baixar Arquivo</span>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-sm text-gray-500 dark:text-zinc-500 border-t border-gray-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          © 2026 Magalu | Feito com ❤ por J's Martins
        </footer>
      </div >
    </div >
  );
}
