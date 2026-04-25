import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (!password || password !== process.env.ADMIN_PASSWORD) {
            // Delay 1s to prevent brute force
            await new Promise(r => setTimeout(r, 1000));
            return NextResponse.json(
                { success: false, message: 'Password salah' },
                { status: 401 }
            );
        }

        const token = await signToken({ role: 'admin', loginAt: Date.now() });

        const response = NextResponse.json({ success: true });
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60, // 8 jam
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
