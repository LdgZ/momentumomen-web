// Route protection middleware — runs on Edge Runtime
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getSecret = () =>
    new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret-change-this-in-env'
    );

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- ADMIN ROUTES PROTECTION ---
    if (
        pathname === '/admin/login' ||
        pathname.startsWith('/api/admin/login') ||
        pathname.startsWith('/api/admin/logout')
    ) {
        // Biarkan lolos
    } else if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        try {
            const { payload } = await jwtVerify(token, getSecret());
            if (payload.role !== 'admin') throw new Error('Not Admin');
        } catch {
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }
    } else if (pathname.startsWith('/api/admin')) {
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        try {
            const { payload } = await jwtVerify(token, getSecret());
            if (payload.role !== 'admin') throw new Error('Not Admin');
        } catch {
            return NextResponse.json({ success: false, message: 'Token expired' }, { status: 401 });
        }
    }

    // --- CUSTOMER ROUTES PROTECTION ---
    if (
        pathname === '/login' ||
        pathname.startsWith('/api/customer/login') ||
        pathname.startsWith('/api/customer/logout')
    ) {
        // Biarkan lolos
    } else if (pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('customer_token')?.value;
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        try {
            const { payload } = await jwtVerify(token, getSecret());
            if (payload.role !== 'customer') throw new Error('Not Customer');
        } catch {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('customer_token');
            return response;
        }
    } else if (pathname.startsWith('/api/customer') && !pathname.startsWith('/api/customer/login')) {
        const token = request.cookies.get('customer_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        try {
            const { payload } = await jwtVerify(token, getSecret());
            if (payload.role !== 'customer') throw new Error('Not Customer');
        } catch {
            return NextResponse.json({ success: false, message: 'Token expired' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/dashboard/:path*', '/api/customer/:path*'],
};
