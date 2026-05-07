import { NextRequest, NextResponse } from 'next/server';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';
const XENDIT_QR_URL = 'https://api.xendit.co/qr_codes';
const SCRIPT_URL = () =>
    process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderId,
            fullName,
            email,
            whatsapp,
            packageName,
            packagePrice,
            weddingDate,
            notes,
            selectedPackage,
        } = body;

        // Validasi input
        if (!orderId || !packagePrice || !fullName || !email) {
            return NextResponse.json(
                { success: false, message: 'Data tidak lengkap' },
                { status: 400 }
            );
        }

        // Cek apakah Xendit key tersedia
        if (!XENDIT_SECRET_KEY) {
            return NextResponse.json(
                { success: false, message: 'Payment gateway belum dikonfigurasi' },
                { status: 500 }
            );
        }

        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');

        // Buat QRIS dinamis via Xendit API
        const xenditResponse = await fetch(XENDIT_QR_URL, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
                'api-version': '2022-07-31',
            },
            body: JSON.stringify({
                reference_id: orderId,
                type: 'DYNAMIC',
                currency: 'IDR',
                amount: Math.round(packagePrice), // Xendit requires integer
            }),
        });

        if (!xenditResponse.ok) {
            const errData = await xenditResponse.json();
            console.error('Xendit API error:', errData);
            return NextResponse.json(
                {
                    success: false,
                    message: `Gagal membuat transaksi: ${errData.message || 'Unknown error'}`,
                },
                { status: 500 }
            );
        }

        const xenditData = await xenditResponse.json();

        // Simpan booking ke Google Sheets
        const scriptUrl = SCRIPT_URL();
        if (scriptUrl) {
            try {
                await fetch(scriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'createBooking',
                        booking: {
                            orderId,
                            fullName,
                            email,
                            whatsapp,
                            weddingDate,
                            selectedPackage,
                            packageName,
                            packagePrice,
                            notes: notes || '',
                            paymentMethod: 'qris',
                        },
                    }),
                });
            } catch (sheetErr) {
                console.error('Google Sheets error (non-fatal):', sheetErr);
            }
        }

        // Hitung waktu kadaluarsa (30 menit dari sekarang)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        return NextResponse.json({
            success: true,
            xenditId: xenditData.id,
            qrString: xenditData.qr_string,
            amount: xenditData.amount,
            expiresAt: xenditData.expires_at || expiresAt,
        });
    } catch (error) {
        console.error('Payment create error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
