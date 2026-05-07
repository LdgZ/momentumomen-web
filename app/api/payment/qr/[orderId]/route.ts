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
        let qrData = null;

        // --- CARA 1: Coba v1 (Langsung pakai orderId sebagai ID) ---
        // Cara ini paling cepat jika orderId adalah ID QR-nya.
        try {
            const resV1 = await fetch(`https://api.xendit.co/qr_codes/${orderId}`, {
                method: 'GET',
                headers: { Authorization: `Basic ${auth}` },
            });
            if (resV1.ok) {
                qrData = await resV1.json();
            }
        } catch (e) {
            console.error('v1 fetch error:', e);
        }

        // --- CARA 2: Coba v2 (Cari berdasarkan reference_id) ---
        // Jika cara 1 gagal, kita cari di daftar QR v2.
        if (!qrData || !qrData.qr_string) {
            try {
                const resV2 = await fetch(`https://api.xendit.co/qr_codes?reference_id=${orderId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'api-version': '2022-07-31',
                    },
                });
                if (resV2.ok) {
                    const dataV2 = await resV2.json();
                    if (dataV2 && dataV2.data && dataV2.data.length > 0) {
                        qrData = dataV2.data[0];
                    }
                }
            } catch (e) {
                console.error('v2 fetch error:', e);
            }
        }

        // --- HASIL ---
        if (qrData && qrData.qr_string) {
             return NextResponse.json({
                 success: true,
                 qrString: qrData.qr_string,
                 xenditId: qrData.id,
                 expiresAt: qrData.expires_at || new Date(new Date(qrData.created || Date.now()).getTime() + 30 * 60 * 1000).toISOString(),
                 amount: qrData.amount
             });
        }

        return NextResponse.json({ success: false, message: 'Tagihan tidak ditemukan di Xendit' }, { status: 404 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
