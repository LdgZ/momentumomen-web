// Google Sheets integration via Google Apps Script

import { Booking, BookingFormData } from './types';
import { PACKAGES } from './config';

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export interface GoogleSheetsResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// Submit a new booking to Google Sheets
export const submitBooking = async (
    bookingData: BookingFormData & { paymentMethod?: string; orderId?: string }
): Promise<GoogleSheetsResponse> => {
    try {
        const pkg = PACKAGES.find(p => p.id === bookingData.selectedPackage);

        if (!SCRIPT_URL) {
            console.warn('Google Script URL not configured');
            return {
                success: true,
                message: 'Booking saved (development mode)',
                data: { id: bookingData.orderId || Date.now().toString() }
            };
        }

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addBooking',
                data: {
                    ...bookingData,
                    packageName: pkg?.name || bookingData.selectedPackage,
                    packagePrice: pkg?.price || 0,
                    paymentMethod: bookingData.paymentMethod || 'qris',
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                    paymentStatus: 'pending'
                }
            })
        });

        return {
            success: true,
            message: 'Booking berhasil dikirim!'
        };
    } catch (error) {
        console.error('Error submitting booking:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat mengirim booking'
        };
    }
};

// Check how many active bookings exist on a given date (max 2 per day)
export const checkDateAvailability = async (date: string): Promise<{ available: boolean; count: number }> => {
    try {
        // Check local orders in localStorage first
        const localOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
        const activeLocalCount = localOrders.filter((o: any) =>
            o.weddingDate === date &&
            o.paymentStatus !== 'expired' &&
            o.status !== 'cancelled'
        ).length;

        if (!SCRIPT_URL) {
            // Dev mode: only use local count
            return { available: activeLocalCount < 2, count: activeLocalCount };
        }

        const response = await fetch(`${SCRIPT_URL}?action=checkDate&date=${date}`);
        const data = await response.json();
        const remoteCount = data.count || 0;
        const totalCount = Math.max(remoteCount, activeLocalCount);
        return { available: totalCount < 2, count: totalCount };
    } catch (error) {
        // fallback: check localStorage only
        try {
            const localOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
            const count = localOrders.filter((o: any) =>
                o.weddingDate === date &&
                o.paymentStatus !== 'expired' &&
                o.status !== 'cancelled'
            ).length;
            return { available: count < 2, count };
        } catch {
            return { available: true, count: 0 };
        }
    }
};

// Get all bookings from Google Sheets
export const getAllBookings = async (): Promise<Booking[]> => {
    try {
        if (!SCRIPT_URL) {
            return getMockBookings();
        }

        const response = await fetch(`${SCRIPT_URL}?action=getBookings`);
        const data = await response.json();

        if (data.success) {
            return data.bookings || [];
        }

        return [];
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return getMockBookings();
    }
};

// Get booked dates for calendar
export const getBookedDates = async (): Promise<string[]> => {
    try {
        if (!SCRIPT_URL) {
            return [
                '2025-01-15',
                '2025-01-20',
                '2025-02-14',
                '2025-02-28'
            ];
        }

        const response = await fetch(`${SCRIPT_URL}?action=getBookedDates`);
        const data = await response.json();

        if (data.success) {
            return data.dates || [];
        }

        return [];
    } catch (error) {
        console.error('Error fetching booked dates:', error);
        return [];
    }
};

// Update booking status
export const updateBookingStatus = async (
    bookingId: string,
    status: string,
    paymentStatus?: string
): Promise<GoogleSheetsResponse> => {
    try {
        if (!SCRIPT_URL) {
            return {
                success: true,
                message: 'Status updated (development mode)'
            };
        }

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateStatus',
                bookingId,
                status,
                paymentStatus
            })
        });

        return {
            success: true,
            message: 'Status berhasil diupdate'
        };
    } catch (error) {
        console.error('Error updating status:', error);
        return {
            success: false,
            message: 'Gagal mengupdate status'
        };
    }
};

// Add Google Drive link to booking
export const addDriveLink = async (
    bookingId: string,
    driveLink: string
): Promise<GoogleSheetsResponse> => {
    try {
        if (!SCRIPT_URL) {
            return {
                success: true,
                message: 'Drive link added (development mode)'
            };
        }

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addDriveLink',
                bookingId,
                driveLink
            })
        });

        return {
            success: true,
            message: 'Link Google Drive berhasil ditambahkan'
        };
    } catch (error) {
        console.error('Error adding drive link:', error);
        return {
            success: false,
            message: 'Gagal menambahkan link'
        };
    }
};

// Mock data for development
const getMockBookings = (): Booking[] => {
    return [
        {
            id: 'EW202602251001',
            fullName: 'Budi & Ani',
            email: 'budi@example.com',
            whatsapp: '081234567890',
            weddingDate: '2026-04-15',
            packageId: 'premium',
            packageName: 'Premium Package',
            notes: 'Resepsi di hotel bintang 5',
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'qris',
            paidAt: '2026-02-20T10:30:00Z',
            createdAt: '2026-02-15T10:00:00Z'
        },
        {
            id: 'EW202602241002',
            fullName: 'Dani & Siti',
            email: 'dani@example.com',
            whatsapp: '082345678901',
            weddingDate: '2026-05-20',
            packageId: 'standard',
            packageName: 'Standard Package',
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'transfer',
            createdAt: '2026-02-24T14:30:00Z'
        },
        {
            id: 'EW202602231003',
            fullName: 'Reza & Maya',
            email: 'reza@example.com',
            whatsapp: '085678901234',
            weddingDate: '2026-06-10',
            packageId: 'basic',
            packageName: 'Basic Package',
            notes: 'Akad nikah di masjid dekat rumah',
            status: 'confirmed',
            paymentStatus: 'verified',
            paymentMethod: 'qris',
            paidAt: '2026-02-23T08:15:00Z',
            createdAt: '2026-02-22T09:00:00Z'
        },
        {
            id: 'EW202602221004',
            fullName: 'Andi & Fitri',
            email: 'andi@example.com',
            whatsapp: '087890123456',
            weddingDate: '2026-03-28',
            packageId: 'premium',
            packageName: 'Premium Package',
            notes: 'Outdoor wedding di villa',
            status: 'completed',
            paymentStatus: 'paid',
            paymentMethod: 'transfer',
            paidAt: '2026-02-10T16:45:00Z',
            createdAt: '2026-02-05T11:00:00Z'
        }
    ];
};
