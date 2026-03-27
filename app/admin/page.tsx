'use client';

import { useState, useEffect } from 'react';
import {
    FaLock, FaSignOutAlt, FaCheckCircle, FaClock, FaBan,
    FaEdit, FaTrash, FaLink, FaWhatsapp, FaInfoCircle,
    FaSearch, FaFilter, FaMoneyBillWave, FaCalendarCheck
} from 'react-icons/fa';
import { getAllBookings, updateBookingStatus, addDriveLink } from '@/lib/googleSheets';
import { Booking } from '@/lib/types';
import { formatCurrency, formatWhatsAppLink } from '@/lib/config';
import { formatDateIndonesian } from '@/lib/calendar';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'momentumomen2024';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingDriveLink, setEditingDriveLink] = useState<string | null>(null);
    const [tempDriveLink, setTempDriveLink] = useState('');

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchBookings();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_auth', 'true');
            fetchBookings();
        } else {
            alert('❌ Password salah!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_auth');
        setPassword('');
    };

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const data = await getAllBookings();
            // Sort by creation date descending
            setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        try {
            await updateBookingStatus(bookingId, newStatus);
            alert('✅ Status berhasil diupdate!');
            fetchBookings();
            if (selectedBooking?.id === bookingId) {
                setSelectedBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('❌ Gagal mengupdate status');
        }
    };

    const handlePaymentStatusChange = async (bookingId: string, newPaymentStatus: string) => {
        try {
            await updateBookingStatus(bookingId, '', newPaymentStatus);
            alert('✅ Status pembayaran berhasil diupdate!');
            fetchBookings();
            if (selectedBooking?.id === bookingId) {
                setSelectedBooking(prev => prev ? { ...prev, paymentStatus: newPaymentStatus as any } : null);
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('❌ Gagal mengupdate status pembayaran');
        }
    };

    const handleSaveDriveLink = async (bookingId: string) => {
        if (!tempDriveLink.trim()) {
            alert('Link Google Drive tidak boleh kosong!');
            return;
        }
        try {
            await addDriveLink(bookingId, tempDriveLink);
            alert('✅ Link Google Drive berhasil ditambahkan!');
            setEditingDriveLink(null);
            setTempDriveLink('');
            fetchBookings();
        } catch (error) {
            console.error('Error adding drive link:', error);
            alert('❌ Gagal menambahkan link');
        }
    };

    const sendWhatsAppNotification = (booking: Booking) => {
        let message = `Halo Kak ${booking.fullName},\n\n`;

        if (booking.paymentStatus === 'paid') {
            message += `Pembayaran Anda untuk pesanan ${booking.id} (${booking.packageName}) telah kami VERIFIKASI. Terima kasih telah melakukan pelunasan.\n\n`;
            message += `Kami akan segera memproses dokumentasi pernikahan Anda pada tanggal ${formatDateIndonesian(booking.weddingDate)}.\n\n`;
        } else if (booking.paymentStatus === 'verified') {
            message += `Pembayaran Anda untuk pesanan ${booking.id} telah kami terima. Status pesanan Anda sekarang TERKONFIRMASI.\n\n`;
        } else {
            message += `Kami menerima pesanan Anda untuk paket ${booking.packageName}. Mohon segera lakukan pembayaran agar jadwal Anda dapat kami amankan.\n\n`;
        }

        message += `Terima kasih,\nmomentumomen`;

        window.open(formatWhatsAppLink(message).replace('wa.me/62', `wa.me/${booking.whatsapp.replace(/^0/, '62')}`), '_blank');
    };

    // Build calendar data: next 30 days, count active bookings per day
    const buildCalendarData = () => {
        const days: { date: string; label: string; count: number }[] = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().slice(0, 10);
            const count = bookings.filter(b =>
                b.weddingDate === dateStr &&
                b.status !== 'cancelled'
            ).length;
            days.push({
                date: dateStr,
                label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
                count
            });
        }
        return days;
    };
    const calendarData = buildCalendarData();

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((acc, b) => acc + (typeof b.packageName === 'string' && b.packageName.includes('Basic') ? 1500000 : b.packageName.includes('Standard') ? 3000000 : 5500000), 0);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock /> },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaCheckCircle /> },
            completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle /> },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <FaBan /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                {config.icon} {status.toUpperCase()}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus: string) => {
        const statusConfig = {
            pending: { bg: 'bg-orange-100', text: 'text-orange-800' },
            verified: { bg: 'bg-blue-100', text: 'text-blue-800' },
            paid: { bg: 'bg-green-100', text: 'text-green-800' },
        };
        const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                {paymentStatus.toUpperCase()}
            </span>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-br from-rose-600 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaLock className="text-4xl text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Silakan login untuk melanjutkan</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password admin"
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 outline-none transition-colors"
                            required
                        />
                        <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
                        <p className="text-gray-600">Monitoring Pesanan & Pembayaran</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchBookings} className="bg-rose-50 text-rose-600 px-6 py-3 rounded-full font-semibold hover:bg-rose-100 transition-colors">
                            Refresh Data
                        </button>
                        <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase">Total Booking</p>
                                <p className="text-3xl font-bold text-gray-800">{bookings.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><FaCalendarCheck size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase">Pending Payment</p>
                                <p className="text-3xl font-bold text-gray-800">{bookings.filter(b => b.paymentStatus === 'pending').length}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full text-orange-600"><FaClock size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase">Verified/Paid</p>
                                <p className="text-3xl font-bold text-gray-800">{bookings.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'verified').length}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full text-green-600"><FaCheckCircle size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-rose-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase">Est. Revenue</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
                            </div>
                            <div className="bg-rose-100 p-3 rounded-full text-rose-600"><FaMoneyBillWave size={24} /></div>
                        </div>
                    </div>
                </div>

                {/* ===== CALENDAR SLOT VIEW ===== */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">📅 Kalender Slot Booking (30 Hari Ke Depan)</h2>
                    <p className="text-sm text-gray-500 mb-4">Maks 2 event per hari. 🟢 Tersedia &nbsp;🟡 1 slot terisi &nbsp;🔴 FULL (2 slot)</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
                        {calendarData.map(day => (
                            <div
                                key={day.date}
                                className={`rounded-xl p-2 text-center text-xs font-semibold border-2 ${
                                    day.count === 0
                                        ? 'bg-green-50 border-green-300 text-green-700'
                                        : day.count === 1
                                        ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                                        : 'bg-red-50 border-red-400 text-red-700'
                                }`}
                            >
                                <div className="text-xs">{day.label}</div>
                                <div className="text-lg font-black mt-1">{day.count}/2</div>
                                <div className="text-xs mt-1">{day.count === 0 ? '✅ Free' : day.count === 1 ? '⚠️ Sisa' : '🔴 FULL'}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari Nama / ID Order..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-rose-500 outline-none bg-white"
                            >
                                <option value="all">Semua Status Order</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-rose-500 outline-none bg-white"
                            >
                                <option value="all">Semua Status Bayar</option>
                                <option value="pending">Belum Bayar / Menunggu Konfirmasi</option>
                                <option value="awaiting_confirmation">Menunggu Konfirmasi</option>
                                <option value="verified">Verified</option>
                                <option value="paid">Lunas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Wedding Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-rose-600">{booking.id}</p>
                                            <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">{booking.fullName}</p>
                                            <p className="text-sm text-gray-600">{booking.packageName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            {formatDateIndonesian(booking.weddingDate)}
                                        </td>
                                        <td className="px-6 py-4 space-y-2">
                                            <div>{getStatusBadge(booking.status)}</div>
                                            <div>{getPaymentBadge(booking.paymentStatus)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                                title="Detail Pesanan"
                                            >
                                                <FaInfoCircle size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada pesanan ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Detail Pesanan</h2>
                                        <p className="text-rose-600 font-bold">{selectedBooking.id}</p>
                                    </div>
                                    <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                                            <p className="font-bold text-gray-800">{selectedBooking.fullName}</p>
                                            <p className="text-sm text-gray-600">{selectedBooking.email}</p>
                                            <p className="text-sm text-gray-600">{selectedBooking.whatsapp}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acara</p>
                                            <p className="font-bold text-gray-800">{formatDateIndonesian(selectedBooking.weddingDate)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paket & Pembayaran</p>
                                            <p className="font-bold text-gray-800">{selectedBooking.packageName}</p>
                                            <p className="text-sm text-gray-600">Method: {selectedBooking.paymentMethod?.toUpperCase() || 'N/A'}</p>
                                            {selectedBooking.paidAt && (
                                                <p className="text-xs text-green-600 font-semibold italic">Paid at: {new Date(selectedBooking.paidAt).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.notes && (
                                    <div className="bg-gray-50 p-4 rounded-xl mb-8">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Catatan</p>
                                        <p className="text-sm text-gray-700 italic">"{selectedBooking.notes}"</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Update Status Order</label>
                                        <select
                                            value={selectedBooking.status}
                                            onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Update Status Bayar</label>
                                        <select
                                            value={selectedBooking.paymentStatus}
                                            onChange={(e) => handlePaymentStatusChange(selectedBooking.id, e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="awaiting_confirmation">Menunggu Konfirmasi</option>
                                            <option value="verified">Verified</option>
                                            <option value="paid">Paid (Lunas)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => sendWhatsAppNotification(selectedBooking)}
                                        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                                    >
                                        <FaWhatsapp size={20} /> Kirim Update ke WhatsApp
                                    </button>

                                    <div className="flex gap-2">
                                        {editingDriveLink === selectedBooking.id ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tempDriveLink}
                                                    onChange={(e) => setTempDriveLink(e.target.value)}
                                                    placeholder="URL Google Drive"
                                                    className="flex-1 px-4 border rounded-xl"
                                                />
                                                <button onClick={() => handleSaveDriveLink(selectedBooking.id)} className="bg-blue-600 text-white px-4 rounded-xl">Save</button>
                                                <button onClick={() => setEditingDriveLink(null)} className="bg-gray-200 text-gray-600 px-4 rounded-xl">X</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingDriveLink(selectedBooking.id);
                                                    setTempDriveLink(selectedBooking.driveLink || '');
                                                }}
                                                className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                            >
                                                <FaLink size={18} /> {selectedBooking.driveLink ? 'Edit Drive Link' : 'Add Drive Link'}
                                            </button>
                                        )}
                                        {selectedBooking.driveLink && !editingDriveLink && (
                                            <a href={selectedBooking.driveLink} target="_blank" className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                                                <FaLink size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
