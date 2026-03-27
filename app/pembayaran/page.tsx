'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PembayaranRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect old payment page to the new booking flow
        // which now includes payment steps.
        router.replace('/pemesanan');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
                <p className="text-gray-600">Mengalihkan ke halaman pemesanan...</p>
            </div>
        </div>
    );
}
