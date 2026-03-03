import { User, ChecklistItem } from './data';

const API_BASE_URL = 'http://localhost:3333/api';

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
    updateBaseItem: async (id: string, item: any) => {
        const res = await fetch(`${API_BASE_URL}/base-items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
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
    }
};
