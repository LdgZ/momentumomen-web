// Package data configuration

import { Package } from './types';

export const PACKAGES: Package[] = [
    {
        id: 'basic',
        name: 'Basic Package',
        price: 1500000,
        duration: '4 Jam Liputan',
        deliverables: [
            '150+ Foto Edited',
            'Semua File Soft Copy',
            'Google Drive Delivery'
        ],
        features: [
            'Liputan akad & resepsi',
            'Dokumentasi candid',
            'Professional photographer',
            'Editing dasar & color grading',
            'Delivery dalam 14 hari'
        ]
    },
    {
        id: 'standard',
        name: 'Standard Package',
        price: 3000000,
        duration: '6 Jam Liputan',
        deliverables: [
            '300+ Foto Edited',
            'Video Highlight 3-5 Menit',
            'Semua File Soft Copy',
            'Google Drive Delivery'
        ],
        features: [
            'Liputan penuh akad & resepsi',
            'Dokumentasi candid & formal',
            '1 Videographer + 1 Photographer',
            'Video cinematic editing',
            'Background music custom',
            'Delivery dalam 21 hari'
        ]
    },
    {
        id: 'premium',
        name: 'Premium Package',
        price: 5500000,
        duration: 'Full Day (10 Jam)',
        deliverables: [
            'Unlimited Foto Edited',
            'Video Cinematic 10-15 Menit',
            'Drone Coverage',
            'Album Cetak (30 Halaman)',
            'Google Drive + USB Flashdisk'
        ],
        features: [
            'Liputan dari persiapan hingga resepsi',
            'Dokumentasi lengkap semua momen',
            '2 Videographer + 2 Photographer',
            'Drone aerial shots',
            'Video cinematic premium editing',
            'Background music & sound design',
            'Pre-wedding mini session',
            'Delivery dalam 30 hari'
        ]
    }
];

export const WHATSAPP_NUMBER = '085607329021';
export const SEABANK_NUMBER = '901861332131';
export const SEABANK_NAME = 'MAISIE ALMA CARISSA';
export const BRAND_NAME = 'momentumomen';
export const INSTAGRAM = '@momentumomen';
export const TIKTOK = '@momentumomen';
export const EMAIL = 'momentumomen@gmail.com';

export const formatWhatsAppLink = (message: string): string => {
    const encodedMessage = encodeURIComponent(message);
    let cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
        cleanNumber = '62' + cleanNumber.substring(1);
    }
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};
