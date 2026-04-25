'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Loader2,
    CalendarDays,
    CreditCard,
    CheckCircle2,
    Search,
    LogOut,
    Link as LinkIcon,
    RefreshCw,
    TrendingUp,
    Users,
    Activity
} from 'lucide-react';

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const router = useRouter();

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            // Note: Middleware handles auth check. This API route
            // sits behind the middleware, so if it 401s, user is kicked out.
            const res = await fetch('/api/admin/bookings');
            
            if (res.status === 401) {
                router.push('/admin/login');
                return;
            }

            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            } else {
                setError(data.message || 'Gagal mengambil data pesanan.');
            }
        } catch (err) {
            console.error(err);
            setError('Gagal menghubungi server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUpdateStatus = async (bookingId: string, newStatus: string, newPaymentStatus: string) => {
        if (!confirm('Apakah Yakin ingin mengubah status pesanan ini?')) return;

        setUpdatingStatus(bookingId);
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateStatus',
                    bookingId,
                    status: newStatus,
                    paymentStatus: newPaymentStatus
                })
            });

            const data = await res.json();
            if (res.status === 401) {
                router.push('/admin/login');
                return;
            }

            if (data.success) {
                await fetchBookings();
            } else {
                alert('Gagal update status: ' + data.message);
            }
        } catch (err) {
            alert('Gagal menghubungi server.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleAddDriveLink = async (bookingId: string) => {
        const url = prompt('Masukkan URL Google Drive folder hasil foto/video:');
        if (!url) return;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            alert('URL harus diawali dengan http:// atau https://');
            return;
        }

        setUpdatingStatus(bookingId);
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addDriveLink',
                    bookingId,
                    driveLink: url
                })
            });

            const data = await res.json();
            if (data.success) {
                await fetchBookings();
            } else {
                alert('Gagal menyimpan link drive: ' + data.message);
            }
        } catch (err) {
            alert('Gagal menghubungi server.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const { filteredBookings, stats } = useMemo(() => {
        let revenue = 0;
        let confirmed = 0;
        
        const filtered = bookings.filter(b => {
            const searchLower = searchQuery.toLowerCase();
            return (
                b.id?.toLowerCase().includes(searchLower) ||
                b.fullName?.toLowerCase().includes(searchLower) ||
                b.email?.toLowerCase().includes(searchLower) ||
                b.whatsapp?.includes(searchLower)
            );
        });

        // Hitung stats dari semua booking (bukan cuma yg di filter)
        bookings.forEach(b => {
            if (b.paymentStatus === 'paid') {
                revenue += (b.packagePrice || 0);
            }
            if (b.status === 'confirmed' || b.status === 'completed') {
                confirmed++;
            }
        });

        return { 
            filteredBookings: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
            stats: { revenue, total: bookings.length, confirmed } 
        };
    }, [bookings, searchQuery]);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-zinc-400 font-medium animate-pulse">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 font-outfit text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Sub & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                            Dashboard Admin
                        </h1>
                        <p className="text-zinc-400 mt-1">Kelola semua pesanan wedding momentumomen</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchBookings}
                            className="flex items-center px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Keluar
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-sm mb-1">Total Pendapatan (Lunas)</p>
                            <h3 className="text-2xl font-bold text-white">{formatRupiah(stats.revenue)}</h3>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-sm mb-1">Klien Terkonfirmasi</p>
                            <h3 className="text-2xl font-bold text-white">{stats.confirmed} <span className="text-zinc-500 text-sm font-normal">pasangan</span></h3>
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-sm mb-1">Total Transaksi Masuk</p>
                            <h3 className="text-2xl font-bold text-white">{stats.total} <span className="text-zinc-500 text-sm font-normal">pesanan</span></h3>
                        </div>
                    </div>
                </div>

                {/* Main Table Area */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-indigo-400" />
                            Daftar Pesanan
                        </h2>

                        <div className="relative">
                            <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nama, WA, email, atau ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-80 pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white"
                            />
                        </div>
                    </div>

                    {error ? (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center">
                            {error}
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Tidak ada data</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto">
                                Belum ada pesanan yang masuk atau data yang Anda cari tidak ditemukan.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="text-zinc-400 border-b border-zinc-800/80">
                                        <th className="pb-4 font-medium pl-2">ID Pesanan</th>
                                        <th className="pb-4 font-medium">Batas Waktu Detail</th>
                                        <th className="pb-4 font-medium">Paket</th>
                                        <th className="pb-4 font-medium">Status & Bayar</th>
                                        <th className="pb-4 font-medium">Link Hasil (G-Drive)</th>
                                        <th className="pb-4 font-medium text-right pr-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                                            
                                            {/* Kolom ID & Waktu Order */}
                                            <td className="py-5 pl-2">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">{booking.id}</span>
                                                    <span className="text-xs text-zinc-500 mt-1">
                                                        {format(new Date(booking.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Kolom Klien Detail */}
                                            <td className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{booking.fullName}</span>
                                                    <a href={`https://wa.me/${booking.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors inline-block mt-0.5">
                                                        {booking.whatsapp}
                                                    </a>
                                                    <span className="text-xs text-zinc-500 mt-1">Wedding: {format(new Date(booking.weddingDate), 'dd MMM yyyy', { locale: id })}</span>
                                                </div>
                                            </td>

                                            {/* Kolom Paket */}
                                            <td className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-200">{booking.packageName}</span>
                                                    <span className="text-xs font-medium text-zinc-500 mt-1">
                                                        {formatRupiah(booking.packagePrice || 0)}
                                                    </span>
                                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full inline-flex w-fit mt-1.5 uppercase">
                                                        {booking.paymentMethod}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-5">
                                                <div className="flex flex-col gap-2 items-start">
                                                    {/* Status Booking */}
                                                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
                                                        booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        booking.status === 'confirmed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {booking.status === 'completed' ? 'Selesai' :
                                                         booking.status === 'confirmed' ? 'Terkonfirmasi' :
                                                         booking.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}
                                                    </span>

                                                    {/* Status Pembayaran */}
                                                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium border flex items-center gap-1 ${
                                                        booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        booking.paymentStatus === 'verified' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                    }`}>
                                                        <CreditCard className="w-3 h-3" />
                                                        {booking.paymentStatus === 'paid' ? 'Lunas (QRIS)' :
                                                         booking.paymentStatus === 'verified' ? 'Tervalidasi' : 'Belum Lunas'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Drive Link Kolom */}
                                            <td className="py-5">
                                                <div className="flex items-center">
                                                    {booking.driveLink ? (
                                                        <a 
                                                            href={booking.driveLink} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 hover:underline bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                                                        >
                                                            <LinkIcon className="w-4 h-4 mr-1.5" />
                                                            Buka Folder
                                                        </a>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAddDriveLink(booking.id)}
                                                            disabled={updatingStatus === booking.id}
                                                            className="text-xs flex items-center text-zinc-400 hover:text-emerald-400 transition-colors border border-dashed border-zinc-700 rounded-lg px-3 py-1.5 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                                        >
                                                            + Tambah Link Drive
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-5 pr-2 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Opsional Complete Button jika status masi confirmed dan lunas */}
                                                    {(booking.status === 'confirmed' && booking.paymentStatus === 'paid') && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'completed', 'paid')}
                                                            disabled={updatingStatus === booking.id}
                                                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-50 hover:text-white rounded-xl transition-colors border border-emerald-500/20"
                                                            title="Tandai Pekerjaan Selesai"
                                                        >
                                                            {updatingStatus === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                    
                                                    {/* Jika order stuck pending, admin bs paksa batalkan */}
                                                    {booking.status === 'pending' && (
                                                         <button
                                                             onClick={() => handleUpdateStatus(booking.id, 'cancelled', booking.paymentStatus)}
                                                             disabled={updatingStatus === booking.id}
                                                             className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                         >
                                                             Batalkan Pesanan
                                                         </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
