import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api';
import { ChecklistItem } from '../data';
import { UNIDADES_DISPONIVEIS } from '../constants/appConstants';

export const useChecklistSync = () => {
    const { baseItems, items, usersList, setItems } = useStore();
    const isSyncing = useRef(false);

    useEffect(() => {
        const syncChecklists = async () => {
            if (baseItems.length === 0 || isSyncing.current) return;
            isSyncing.current = true;

            try {
                const currentItems = items;
                const itemsMap = new Map<string, ChecklistItem>();
                const ghostMap = new Map<string, ChecklistItem>();

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

                for (const unit of allUnits) {
                    for (const baseItem of baseItems) {
                        const expectedId = `${unit}-${baseItem.id}`;
                        validIds.add(expectedId);

                        const existingItem = itemsMap.get(expectedId);

                        if (!existingItem) {
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
                                    exigeEvidencia: baseItem.exigeEvidencia,
                                    ativo: baseItem.ativo,
                                    order: baseItem.order
                                });
                                itemsToDelete.push(ghost.id);
                            } else {
                                itemsToPut.push({
                                    ...baseItem as any,
                                    id: expectedId,
                                    unidade: unit,
                                    assigneeId: ''
                                });
                            }
                        } else {
                            const hasChanged =
                                existingItem.pilar !== baseItem.pilar ||
                                existingItem.bloco !== baseItem.bloco ||
                                existingItem.ativo !== baseItem.ativo ||
                                existingItem.item !== baseItem.item ||
                                (existingItem.order || 0) !== (baseItem.order || 0) ||
                                existingItem.descricao !== baseItem.descricao ||
                                existingItem.exigeEvidencia !== baseItem.exigeEvidencia ||
                                (existingItem.nossaAcao || '') !== (baseItem.nossaAcao || '');

                            if (hasChanged) {
                                itemsToPut.push({
                                    ...existingItem,
                                    pilar: baseItem.pilar,
                                    bloco: baseItem.bloco,
                                    trilha: baseItem.trilha,
                                    item: baseItem.item,
                                    descricao: baseItem.descricao,
                                    exigeEvidencia: baseItem.exigeEvidencia,
                                    ativo: baseItem.ativo,
                                    order: baseItem.order,
                                    nossaAcao: baseItem.nossaAcao
                                });
                            }
                        }
                    }
                }

                for (const currentItem of currentItems) {
                    if (!validIds.has(currentItem.id)) {
                        if (!itemsToDelete.includes(currentItem.id)) {
                            itemsToDelete.push(currentItem.id);
                        }
                    }
                }

                let shouldUpdateLocal = false;
                if (itemsToPut.length > 0) {
                    await api.bulkPutChecklists(itemsToPut);
                    shouldUpdateLocal = true;
                }
                if (itemsToDelete.length > 0) {
                    await api.bulkDeleteChecklists(itemsToDelete);
                    shouldUpdateLocal = true;
                }

                if (shouldUpdateLocal) {
                    const updatedItems = await api.getChecklists();
                    setItems(updatedItems);
                }
            } catch (error) {
                console.error("Erro na sincronização de checklists:", error);
            } finally {
                isSyncing.current = false;
            }
        };

        syncChecklists();
    }, [baseItems, usersList]);
};
