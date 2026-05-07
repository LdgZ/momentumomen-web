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

        // Handle both V1 and V2 webhook payload structures
        let reference_id = body.reference_id;
        let paymentStatus = body.status;
        let paymentId = body.id;

        // V2 Webhook format (nested inside "data")
        if (body.event === 'qr.payment' && body.data) {
            reference_id = body.data.reference_id;
            paymentStatus = body.data.status;
            paymentId = body.data.id;
        } 
        // V1 Webhook format
        else if (body.qr_code) {
            reference_id = body.qr_code.external_id;
            paymentStatus = body.status;
            paymentId = body.id;
        }

        // Xendit QRIS status: SUCCEEDED (v2) atau COMPLETED (v1) = bayar berhasil
        if ((paymentStatus === 'SUCCEEDED' || paymentStatus === 'COMPLETED') && reference_id) {
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

            console.log(`Payment SUCCEEDED for order: ${reference_id}, xenditId: ${paymentId}`);
        }

        // Selalu return 200 agar Xendit tidak retry
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Tetap return 200 agar tidak di-retry berulang-ulang
        return NextResponse.json({ success: true }, { status: 200 });
    }
}
