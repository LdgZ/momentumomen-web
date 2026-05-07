import { NextRequest, NextResponse } from 'next/server';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    if (!orderId) {
        return NextResponse.json({ success: false, message: 'ID tidak valid' }, { status: 400 });
    }

    if (orderId === 'EW202604251001') {
        return NextResponse.json({ success: true, status: 'ACTIVE' });
    }

    if (!XENDIT_SECRET_KEY) {
        return NextResponse.json({ success: false, message: 'Server konfigrasi error' }, { status: 500 });
    }

    try {
        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
        
        // Pengecekan riwayat pembayaran QRIS melalui Xendit API
        // Endpoint ini mengecek apakah reference_id (orderId) sudah dibayar.
        const response = await fetch(`https://api.xendit.co/qr_codes/payments?external_id=${orderId}`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Gagal cek status payment' }, { status: response.status });
        }

        const data = await response.json();
        
        // Xendit V1 mengembalikan Array langsung, V2 mengembalikan { data: [...] }
        let paymentList = [];
        if (Array.isArray(data)) {
            paymentList = data;
        } else if (data && Array.isArray(data.data)) {
            paymentList = data.data;
        }

        const isPaid = paymentList.length > 0;

        // Fallback Sync: Jika Xendit lunas tapi webhook sebelumnya gagal,
        // kita paksa Google Sheets untuk update statusnya sekarang.
        if (isPaid) {
            const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
            if (scriptUrl) {
                try {
                    // Update ke Google Sheets tanpa menunggu (fire and forget)
                    fetch(scriptUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'updateStatus',
                            bookingId: orderId,
                            status: 'confirmed',
                            paymentStatus: 'paid',
                        }),
                    }).catch(err => console.error('Fallback sync fetch error:', err));
                } catch (e) {
                    console.error('Fallback sync error:', e);
                }
            }
        }
        
        return NextResponse.json({
            success: true,
            status: isPaid ? 'SUCCEEDED' : 'ACTIVE', // Sesuaikan status dengan respon
            payments: paymentList
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
