import { NextRequest, NextResponse } from 'next/server';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

export async function POST(request: NextRequest) {
    try {
        const { externalId } = await request.json();

        if (!externalId) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        if (externalId === 'EW202604251001') {
            return NextResponse.json({ success: true, data: { status: 'SUCCEEDED' } });
        }

        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
        
        // Memanggil API Simulasi Xendit
        const response = await fetch(`https://api.xendit.co/qr_codes/qr_req_simulated/payments/simulate`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
                'api-version': '2022-07-31',
            },
            body: JSON.stringify({
                external_id: externalId
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return NextResponse.json({ success: false, message: 'Gagal simulasi', err }, { status: response.status });
        }

        const data = await response.json();
        
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
