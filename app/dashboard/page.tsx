'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Loader2, LogOut, ArrowRight, CreditCard, Receipt, FolderSymlink, CheckCircle2, Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/config';

export default function CustomerDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/customer/bookings');
                
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    setBookings(data.bookings);
                } else {
                    setError('Gagal memuat data.');
                }
            } catch {
                setError('Kesalahan jaringan.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/customer/logout', { method: 'POST' });
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Buka Brankas Momen Tumomen...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-indigo-600 pb-32">
                <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">MOMENTUMOMEN</h1>
                        <p className="text-indigo-200 text-sm font-medium">Portal Pelanggan</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl transition-colors backdrop-blur-md"
                    >
                        Keluar <LogOut className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-20">
                {error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl shadow-sm text-center">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-xl shadow-indigo-100/50 text-center border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Pesanan</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Kami tidak menemukan riwayat pesanan aktif untuk nomor ini. Mari rencanakan momen Anda.</p>
                        <Link href="/pemesanan" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                            Buat Pesanan Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2 mb-6 text-white">
                            <h2 className="text-2xl font-bold">Riwayat Pesanan Anda ({bookings.length})</h2>
                        </div>
                        
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-3xl shadow-xl shadow-indigo-100/40 border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                                
                                {/* Info Utama */}
                                <div className="p-6 md:p-8 flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="text-xs font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                            #{booking.id}
                                        </span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                                            booking.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                                            booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                            booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                            {booking.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                                             booking.status === 'confirmed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                                             booking.status === 'cancelled' ? null : <Clock className="w-3.5 h-3.5" />}
                                            
                                            {booking.status === 'completed' ? 'Pekerjaan Selesai' :
                                             booking.status === 'confirmed' ? 'Terkonfirmasi' :
                                             booking.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu Validasi'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{booking.packageName}</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tgl Acara</p>
                                            <p className="font-medium text-gray-800">{format(new Date(booking.weddingDate), 'dd MMM yyyy', { locale: id })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status Bayar</p>
                                            <p className={`font-bold ${booking.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {booking.paymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Area Aksi */}
                                <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-6 md:p-8 flex flex-col justify-center min-w-[280px]">
                                    <div className="mb-6 mb-md-8 text-left md:text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Biaya</p>
                                        <p className="text-3xl font-black text-indigo-600">{formatCurrency(booking.packagePrice || 0)}</p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Jika belum lunas -> Tombol Bayar */}
                                        {(booking.paymentStatus === 'pending' && booking.status !== 'cancelled') && (
                                            <Link href={`/pembayaran/${booking.id}`} className="flex items-center justify-center w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition group shadow-md shadow-indigo-200">
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                Lanjutkan Pembayaran
                                            </Link>
                                        )}

                                        {/* Jika sudah lunas -> Tombol Invoice */}
                                        {booking.paymentStatus === 'paid' && (
                                            <Link href={`/invoice/${booking.id}`} className="flex items-center justify-center w-full bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-600 transition group shadow-md shadow-emerald-200">
                                                <Receipt className="w-5 h-5 mr-2" />
                                                Lihat Invoice
                                            </Link>
                                        )}

                                        {/* Jika ada Drive Link -> Tombol Buka Folder */}
                                        {booking.driveLink && (
                                            <a href={booking.driveLink} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 transition group shadow-md shadow-gray-300">
                                                <FolderSymlink className="w-5 h-5 mr-2 text-indigo-400" />
                                                Buka Folder Hasil
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
