import { getTelegramInitData } from './telegram.js';

const API_BASE = '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const initData = getTelegramInitData();
  const headers = {
    'Content-Type': 'application/json',
    'x-telegram-init-data': initData,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  getMe: () => request('/me'),
  mintCard: () => request('/cards/mint', { method: 'POST' }),
  getCards: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cards${query ? `?${query}` : ''}`);
  },
  toggleFavorite: (cardId: string) => request(`/cards/${cardId}/favorite`, { method: 'POST' }),
  setCardOfDay: (cardId: string) => request(`/cards/${cardId}/card-of-day`, { method: 'POST' }),
  getAlbums: () => request('/albums'),
  claimAlbum: (key: string) => request(`/albums/${key}/claim`, { method: 'POST' }),
  getTasks: () => request('/tasks'),
  claimTask: (taskId: string) => request(`/tasks/${taskId}/claim`, { method: 'POST' }),
  getShopItems: () => request('/shop/items'),
  equipCosmetic: (itemKey: string) => request('/shop/equip', { method: 'POST', body: JSON.stringify({ itemKey }) }),
  createInvoice: (itemKey: string) => request('/shop/invoice', { method: 'POST', body: JSON.stringify({ itemKey }) }),
  getLeaderboard: () => request('/leaderboard'),
  getHistory: () => request('/history'),
};
