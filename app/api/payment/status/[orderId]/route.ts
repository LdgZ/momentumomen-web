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
                'api-version': '2022-07-31',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Gagal cek status payment' }, { status: response.status });
        }

        const data = await response.json();
        
        // Data dari Xendit berbentuk { data: [...] }. Jika array berikur, berati ada pembayaran.
        const isPaid = data && data.data && data.data.length > 0;
        
        return NextResponse.json({
            success: true,
            status: isPaid ? 'SUCCEEDED' : 'ACTIVE', // Sesuaikan status dengan respon
            payments: data.data
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
