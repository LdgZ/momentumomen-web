import { NextResponse } from 'next/server';

const getScriptUrl = () =>
    process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
        return NextResponse.json({ success: false, message: 'Year and month required' }, { status: 400 });
    }

    const scriptUrl = getScriptUrl();

    if (!scriptUrl) {
        // Fallback for development if no script URL
        return NextResponse.json({ success: true, slots: {} });
    }

    try {
        const response = await fetch(`${scriptUrl}?action=getSlots&year=${year}&month=${month}`, {
            cache: 'no-store'
        });
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching slots:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
