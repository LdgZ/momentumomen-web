import { NextRequest, NextResponse } from 'next/server';

const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || '';
const SCRIPT_URL = () =>
    process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export async function POST(request: NextRequest) {
    // Verifikasi Xendit webhook token
    const callbackToken = request.headers.get('x-callback-token');

    if (!callbackToken || callbackToken !== XENDIT_WEBHOOK_TOKEN) {
        console.warn('Webhook: invalid callback token');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log('Xendit webhook received:', JSON.stringify(body, null, 2));

        const { reference_id, status, id } = body;

        // Xendit QRIS status: SUCCEEDED = bayar berhasil
        if (status === 'SUCCEEDED' && reference_id) {
            const scriptUrl = SCRIPT_URL();

            if (scriptUrl) {
                // Update Google Sheets: set paymentStatus='paid', status='confirmed', paidAt
                await fetch(scriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'updateStatus',
                        bookingId: reference_id,
                        status: 'confirmed',
                        paymentStatus: 'paid',
                    }),
                });
            }

            console.log(`Payment SUCCEEDED for order: ${reference_id}, xenditId: ${id}`);
        }

        // Selalu return 200 agar Xendit tidak retry
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Tetap return 200 agar tidak di-retry berulang-ulang
        return NextResponse.json({ success: true }, { status: 200 });
    }
}
