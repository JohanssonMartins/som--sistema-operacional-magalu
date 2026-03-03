import { User, ChecklistItem } from './data';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
    // Users
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    // Checklists
    getChecklists: async (): Promise<ChecklistItem[]> => {
        const res = await fetch(`${API_BASE_URL}/checklists`);
        if (!res.ok) throw new Error('Failed to fetch checklists');
        return res.json();
    }

    // You can add more endpoints here like POST, PUT, DELETE 
    // for when you want to create/update checklists taking them away from Dexie
};
