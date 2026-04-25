import { NextRequest, NextResponse } from 'next/server';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

export async function GET(
    request: NextRequest,
    { params }: { params: { xenditId: string } }
) {
    const xenditId = params.xenditId;

    if (!xenditId) {
        return NextResponse.json({ success: false, message: 'ID tidak valid' }, { status: 400 });
    }

    if (!XENDIT_SECRET_KEY) {
        return NextResponse.json({ success: false, message: 'Server konfigrasi error' }, { status: 500 });
    }

    try {
        const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
        const response = await fetch(`https://api.xendit.co/qr_codes/${xenditId}`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
                'api-version': '2022-07-31',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Gagal cek status' }, { status: response.status });
        }

        const data = await response.json();
        
        return NextResponse.json({
            success: true,
            status: data.status, // EX: 'ACTIVE', 'INACTIVE', 'SUCCEEDED'
            qrString: data.qr_string
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
