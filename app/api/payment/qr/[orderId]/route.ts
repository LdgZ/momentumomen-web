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

    // Tangani Mock Data jika User belum mengatur GOOGLE_SCRIPT_URL (.env)
    if (orderId === 'EW202604251001') {
        return NextResponse.json({
             success: true,
             qrString: '00020101021226680016COM.GO-JEK.WWW011893600000000000000002142273760410766351140015ID.CO.QRIS.WWW0215ID10220000000000303UMO520448145303360540755000005802ID5912Momentumomen6007Jakarta61051211062320116EW2026042510010708MOMENTUM6304ED46',
             xenditId: 'mock_xendit_id',
             expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
             amount: 5500000
        });
    }

    try {
        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
        
        // Pengecekan data QRIS berdasarkan reference_id (menggunakan Xendit v2 API)
        const response = await fetch(`https://api.xendit.co/qr_codes?reference_id=${orderId}`, {
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
        
        // Response Xendit v2 adalah { data: [...] }
        const qrData = data && data.data && data.data.length > 0 ? data.data[0] : null;

        if (qrData && qrData.qr_string) {
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
