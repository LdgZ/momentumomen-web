import { NextRequest, NextResponse } from 'next/server';

// Helper to get Google Script URL (server-side only)
const getScriptUrl = () =>
    process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

// ─── GET: Fetch all bookings ──────────────────────────────────────────────────
export async function GET() {
    const scriptUrl = getScriptUrl();

    if (!scriptUrl) {
        // Return mock data jika script URL belum dikonfigurasi
        return NextResponse.json({ success: true, bookings: getMockBookings() });
    }

    try {
        const response = await fetch(`${scriptUrl}?action=getBookings`, {
            cache: 'no-store',
        });
        const data = await response.json();
        return NextResponse.json({
            success: true,
            bookings: data.bookings || [],
        });
    } catch (_error: unknown) {
        return NextResponse.json({ success: true, bookings: getMockBookings() });
    }
}

// ─── POST: Update status or add drive link ────────────────────────────────────
export async function POST(request: NextRequest) {
    const scriptUrl = getScriptUrl();

    try {
        const body = await request.json() as { 
            action: string; 
            bookingId: string; 
            status: string; 
            paymentStatus: string; 
            driveLink: string 
        };
        const { action } = body;

        if (!scriptUrl) {
            return NextResponse.json({ success: true, message: 'Dev mode' });
        }

        if (action === 'updateStatus') {
            await fetch(scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateStatus',
                    bookingId: body.bookingId,
                    status: body.status,
                    paymentStatus: body.paymentStatus,
                }),
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'addDriveLink') {
            await fetch(scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addDriveLink',
                    bookingId: body.bookingId,
                    driveLink: body.driveLink,
                }),
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { success: false, message: 'Unknown action' },
            { status: 400 }
        );
    } catch (_error: unknown) {
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}

// Mock data untuk development
function getMockBookings() {
    return [
        {
            id: 'EW202604251001',
            fullName: 'Budi & Ani',
            email: 'budi@example.com',
            whatsapp: '081234567890',
            weddingDate: '2026-06-15',
            packageId: 'premium',
            packageName: 'Premium Package',
            packagePrice: 5500000,
            notes: 'Resepsi di hotel bintang 5',
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'qris',
            paidAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            id: 'EW202604251002',
            fullName: 'Dani & Siti',
            email: 'dani@example.com',
            whatsapp: '082345678901',
            weddingDate: '2026-07-20',
            packageId: 'standard',
            packageName: 'Standard Package',
            packagePrice: 3000000,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'qris',
            createdAt: new Date().toISOString(),
        },
        {
            id: 'EW202604251003',
            fullName: 'Reza & Maya',
            email: 'reza@example.com',
            whatsapp: '085678901234',
            weddingDate: '2026-08-10',
            packageId: 'basic',
            packageName: 'Basic Package',
            packagePrice: 1500000,
            notes: 'Akad nikah di masjid',
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'qris',
            paidAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        },
    ];
}
