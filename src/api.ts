import { User, ChecklistItem } from './data';

const envUrl = import.meta.env.VITE_API_BASE_URL;
console.log('Environment VITE_API_BASE_URL detectado:', envUrl);

// Hardcoding temporário para garantir que localmente a gente sempre bata no servidor local
const API_BASE_URL = envUrl || 'http://localhost:3333/api';
console.log('API_BASE_URL sendo usada pelo Frontend:', API_BASE_URL);

export const api = {
    // Users
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },
    createUser: async (user: User) => {
        const res = await fetch(`${API_BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
        return res.json();
    },
    updateUser: async (id: string, user: Partial<User>) => {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
        return res.json();
    },
    deleteUser: async (id: string) => {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        return res.json();
    },

    // Base Items
    getBaseItems: async (): Promise<ChecklistItem[]> => {
        const res = await fetch(`${API_BASE_URL}/base-items`);
        if (!res.ok) throw new Error('Failed to fetch base items');
        return res.json();
    },
    createBaseItem: async (item: any) => {
        const res = await fetch(`${API_BASE_URL}/base-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
        return res.json();
    },
    bulkCreateBaseItems: async (items: any[]) => {
        const res = await fetch(`${API_BASE_URL}/base-items/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items) });
        return res.json();
    },
    updateBaseItem: async (id: string, item: any) => {
        const res = await fetch(`${API_BASE_URL}/base-items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
        return res.json();
    },
    deletePilar: async (pilar: string) => {
        const res = await fetch(`${API_BASE_URL}/base-items/pilar/${encodeURIComponent(pilar)}`, { method: 'DELETE' });
        return res.json();
    },
    deleteBaseItem: async (id: string) => {
        const res = await fetch(`${API_BASE_URL}/base-items/${id}`, { method: 'DELETE' });
        return res.json();
    },

    // Checklists
    getChecklists: async (): Promise<ChecklistItem[]> => {
        const res = await fetch(`${API_BASE_URL}/checklists`);
        if (!res.ok) throw new Error('Failed to fetch checklists');
        return res.json();
    },
    updateChecklist: async (id: string, data: Partial<ChecklistItem>) => {
        const res = await fetch(`${API_BASE_URL}/checklists/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        return res.json();
    },
    bulkAddChecklists: async (items: any[]) => {
        const res = await fetch(`${API_BASE_URL}/checklists/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items) });
        return res.json();
    },
    bulkDeleteChecklists: async (ids: string[]) => {
        const res = await fetch(`${API_BASE_URL}/checklists/bulk-delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        return res.json();
    },
    bulkPutChecklists: async (items: any[]) => {
        const res = await fetch(`${API_BASE_URL}/checklists/bulk-put`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items) });
        return res.json();
    },

    // Autoauditoria Mensal
    getAutoauditoria: async (unidade: string, mesAno: string, tipo?: 'AUTO' | 'EXTERNA') => {
        const url = new URL(`${API_BASE_URL}/autoauditoria/${encodeURIComponent(unidade)}/${encodeURIComponent(mesAno)}`);
        if (tipo) url.searchParams.append('tipo', tipo);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch autoauditoria');
        return res.json();
    },
    getAllAutoauditorias: async (mesAno: string, tipo?: 'AUTO' | 'EXTERNA') => {
        const url = new URL(`${API_BASE_URL}/autoauditoria/all/${encodeURIComponent(mesAno)}`);
        if (tipo) url.searchParams.append('tipo', tipo);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch all autoauditorias');
        return res.json();
    },
    saveAutoauditoria: async (data: any) => {
        const res = await fetch(`${API_BASE_URL}/autoauditoria`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        return res.json();
    },
    getHistory: async (unidade: string, tipo?: 'AUTO' | 'EXTERNA') => {
        const url = new URL(`${API_BASE_URL}/autoauditoria/history/${encodeURIComponent(unidade)}`);
        if (tipo) url.searchParams.append('tipo', tipo);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
    },
    uploadEvidenciaGoogleDrive: async (formData: FormData) => {
        const res = await fetch(`${API_BASE_URL}/autoauditoria/evidencia/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to upload evidence');
        }
        return res.json();
    },
    suggestAction: async (pilar: string, bloco: string, item: string, descricao: string) => {
        const res = await fetch(`${API_BASE_URL}/ai/suggest-action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pilar, bloco, item, descricao })
        });
        if (!res.ok) throw new Error('Falha ao obter sugestão de IA');
        return res.json();
    },
    analyzeEvidence: async (pilar: string, bloco: string, item: string, descricao: string, evidenceId: string) => {
        const res = await fetch(`${API_BASE_URL}/ai/analyze-evidence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pilar, bloco, item, descricao, evidenceId })
        });
        if (!res.ok) throw new Error('Falha ao analisar evidência com IA');
        return res.json();
    }
};
