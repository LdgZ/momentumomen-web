// Local storage-based order state management for multi-step form

import { Order } from './types';

const ORDER_KEY = 'momentumomen_order';

export function generateOrderId(): string {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `EW${dateStr}${rand}`;
}

export function saveOrder(order: Order): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    }
}

export function getOrder(): Order | null {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(ORDER_KEY);
        if (data) {
            try {
                return JSON.parse(data) as Order;
            } catch {
                return null;
            }
        }
    }
    return null;
}

export function clearOrder(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ORDER_KEY);
    }
}
