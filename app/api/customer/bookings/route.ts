import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Helper to get Google Script URL (server-side only)
const getScriptUrl = () =>
    process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('customer_token')?.value;

    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'customer' || !payload.whatsapp) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const normalizedWa = payload.whatsapp as string;
    const scriptUrl = getScriptUrl();

    if (!scriptUrl) {
         return NextResponse.json({ success: true, bookings: getMockCustomerBookings(normalizedWa) });
    }

    try {
        const response = await fetch(`${scriptUrl}?action=getBookings`, {
            cache: 'no-store',
        });
        const data = await response.json();
        
        if (data.success && data.bookings) {
            // Filter hanya booking milik WA si customer
            const userBookings = data.bookings.filter((b: any) => {
                let dbWa = b.whatsapp.replace(/\D/g, '');
                if (dbWa.startsWith('0')) dbWa = '62' + dbWa.slice(1);
                else if (dbWa.startsWith('8')) dbWa = '62' + dbWa;
                
                return dbWa === normalizedWa;
            });
            
            // Sort by tanggal order terbaru
            const sorted = userBookings.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            return NextResponse.json({
                success: true,
                bookings: sorted,
            });
        }
        
        return NextResponse.json({ success: true, bookings: [] });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

function getMockCustomerBookings(wa: string) {
    return [
        {
            id: 'EW202604251001',
            fullName: 'Budi & Ani',
            email: 'budi@example.com',
            whatsapp: wa,
            weddingDate: '2026-06-15',
            packageId: 'premium',
            packageName: 'Premium Package',
            packagePrice: 5500000,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'qris',
            createdAt: new Date().toISOString(),
            expiredAt: new Date(Date.now() + 3600000).toISOString()
        }
    ];
}
