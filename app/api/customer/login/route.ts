import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

// Helper to get Google Script URL (server-side only)
const getScriptUrl = () =>
    process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export async function POST(request: NextRequest) {
    try {
        const { whatsapp } = await request.json();

        if (!whatsapp) {
            return NextResponse.json(
                { success: false, message: 'Nomor WhatsApp wajib diisi' },
                { status: 400 }
            );
        }

        // Normalize whatsapp number format
        let normalizedWa = whatsapp.replace(/\D/g, ''); // remove non digits
        if (normalizedWa.startsWith('0')) {
            normalizedWa = '62' + normalizedWa.slice(1);
        } else if (normalizedWa.startsWith('8')) {
            normalizedWa = '62' + normalizedWa;
        }

        // Simulasikan delay sebentar agar lebih natural 
        await new Promise(r => setTimeout(r, 600));

        const scriptUrl = getScriptUrl();
        let foundBookings = 0;

        if (scriptUrl) {
            // Lakukan cek via Google Sheets apakah ada order dgn WA ini
            const response = await fetch(`${scriptUrl}?action=getBookings`, {
                cache: 'no-store',
            });
            const data = await response.json();
            
            if (data.success && data.bookings) {
                const userBookings = data.bookings.filter((b: any) => {
                    let dbWa = b.whatsapp.replace(/\D/g, '');
                    if (dbWa.startsWith('0')) dbWa = '62' + dbWa.slice(1);
                    else if (dbWa.startsWith('8')) dbWa = '62' + dbWa;
                    
                    return dbWa === normalizedWa;
                });
                foundBookings = userBookings.length;
            }
        } else {
             // Fallback Dev Mode
             foundBookings = 1; 
        }

        if (foundBookings === 0) {
             return NextResponse.json(
                { success: false, message: 'Tidak ada pesanan ditemukan untuk nomor WhatsApp tersebut.' },
                { status: 404 }
            );
        }

        // Berhasil login -> Generate JWT khusus customer valid selama 30 Hari
        const token = await signToken({ role: 'customer', whatsapp: normalizedWa, loginAt: Date.now() }, '30d');

        const response = NextResponse.json({ success: true, message: `Ditemukan ${foundBookings} pesanan.` });
        response.cookies.set('customer_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 hari
            path: '/',
        });

        return response;
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan sistem' },
            { status: 500 }
        );
    }
}
