import { NextRequest, NextResponse } from 'next/server';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    const orderId = params.orderId;

    if (!orderId) {
        return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    try {
        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
        
        // Pengecekan data QRIS berdasarkan external_id/reference_id
        const response = await fetch(`https://api.xendit.co/qr_codes?external_id=${orderId}`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
                'api-version': '2022-07-31',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Gagal fetch QR Data' }, { status: response.status });
        }

        const data = await response.json();
        
        // Response Xendit berupa array data (karena hasil query parameter)
        if (data.data && data.data.length > 0) {
             const qrData = data.data[0];
             return NextResponse.json({
                 success: true,
                 qrString: qrData.qr_string,
                 xenditId: qrData.id,
                 expiresAt: qrData.expires_at,
                 amount: qrData.amount
             });
        }

        return NextResponse.json({ success: false, message: 'QR Not Found' }, { status: 404 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
