import { NextRequest, NextResponse } from 'next/server';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    if (!orderId) {
        return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    try {
        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
        
        // Pengecekan data QRIS berdasarkan external_id/reference_id (menggunakan Xendit v1 API)
        const response = await fetch(`https://api.xendit.co/qr_codes/${orderId}`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Gagal fetch QR Data' }, { status: response.status });
        }

        const qrData = await response.json();
        
        // Response Xendit v1 adalah objek langsung, bukan array
        if (qrData && qrData.qr_string) {
             const createdTime = new Date(qrData.created).getTime();
             const expiresAt = new Date(createdTime + 30 * 60 * 1000).toISOString();
             
             return NextResponse.json({
                 success: true,
                 qrString: qrData.qr_string,
                 xenditId: qrData.id,
                 expiresAt: qrData.expires_at || expiresAt, // Default 30 minutes from creation
                 amount: qrData.amount
             });
        }

        return NextResponse.json({ success: false, message: 'QR Not Found' }, { status: 404 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
