// Type definitions for the Wedding Content Creator app

export interface Package {
    id: string;
    name: string;
    price: number;
    duration: string;
    deliverables: string[];
    features: string[];
}

export interface BookingFormData {
    fullName: string;
    email: string;
    whatsapp: string;
    weddingDate: string;
    selectedPackage: string;
    notes?: string;
}

export interface Order {
    orderId: string;
    fullName: string;
    email: string;
    whatsapp: string;
    weddingDate: string;
    selectedPackage: string;
    packageName: string;
    packagePrice: number;
    notes?: string;
    paymentMethod: 'transfer' | 'qris';
    paymentStatus: 'pending' | 'awaiting_confirmation' | 'verified' | 'paid' | 'expired';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paidAt?: string;
    expiredAt: string;
    createdAt: string;
    xenditId?: string; // Xendit QR code ID for status polling
}

export interface Booking {
    id: string;
    fullName: string;
    email: string;
    whatsapp: string;
    weddingDate: string;
    packageId: string;
    packageName: string;
    packagePrice?: number;
    notes?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'awaiting_confirmation' | 'verified' | 'paid' | 'expired';
    paymentMethod?: string;
    paymentProof?: string;
    driveLink?: string;
    paidAt?: string;
    createdAt: string;
}

export interface CalendarDate {
    date: Date;
    isBooked: boolean;
    isAvailable: boolean;
    bookingId?: string;
    slotCount?: number;
}

export interface PaymentProof {
    bookingId: string;
    fileName: string;
    uploadedAt: string;
}

export interface Testimonial {
    id: string;
    clientName: string;
    content: string;
    rating: number;
    weddingDate: string;
    image?: string;
}

export type XenditQRStatus = 'ACTIVE' | 'SUCCEEDED' | 'INACTIVE' | 'UNKNOWN' | 'ERROR';

export interface CreatePaymentResponse {
    success: boolean;
    xenditId?: string;
    qrString?: string;
    amount?: number;
    expiresAt?: string;
    message?: string;
}
