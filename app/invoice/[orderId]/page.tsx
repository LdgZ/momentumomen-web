'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatWhatsAppLink } from '@/lib/config';
import { getOrder } from '@/lib/orderStore';
import { Order } from '@/lib/types';
import {
    FaDownload,
    FaWhatsapp,
    FaCheckCircle,
    FaArrowLeft,
    FaPrint
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const orderId = unwrappedParams.orderId;
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        // 1. Cek Mock Data
        if (orderId === 'EW202604251001') {
            setOrder({
                orderId: 'EW202604251001',
                fullName: 'Budi & Ani',
                email: 'budi@example.com',
                whatsapp: '081234567890',
                weddingDate: '2026-06-15',
                selectedPackage: 'premium',
                packageName: 'Premium Package',
                packagePrice: 5500000,
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: 'qris',
                notes: 'Ini adalah data MOCK khusus untuk dev testing.',
                createdAt: new Date().toISOString(),
                expiredAt: new Date().toISOString(),
            });
            return;
        }

        // 2. Cek dari Local Storage (Session saat ini)
        const savedOrder = getOrder();
        if (savedOrder && savedOrder.orderId === orderId) {
            setOrder(savedOrder);
            return;
        }

        // 3. Jika tidak ada di local (misal balik dari dashboard), ambil dari server
        const fetchFromServer = async () => {
            try {
                const res = await fetch('/api/customer/bookings');
                const data = await res.json();
                
                if (data.success && data.bookings) {
                    const found = data.bookings.find((b: any) => b.id === orderId);
                    if (found) {
                        setOrder({
                            orderId: found.id,
                            fullName: found.fullName,
                            email: found.email,
                            whatsapp: found.whatsapp,
                            weddingDate: found.weddingDate,
                            selectedPackage: found.packageId,
                            packageName: found.packageName,
                            packagePrice: found.packagePrice,
                            status: found.status,
                            paymentStatus: found.paymentStatus,
                            paymentMethod: found.paymentMethod,
                            notes: found.notes,
                            createdAt: found.createdAt,
                            expiredAt: found.createdAt // Fallback
                        });
                        return;
                    }
                }
                router.push('/pemesanan');
            } catch {
                router.push('/pemesanan');
            }
        };

        fetchFromServer();
    }, [orderId, router]);

    const handlePrintAndSave = () => {
        window.print();
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const whatsappMessage = `Halo momentumomen, pembayaran saya untuk Tagihan *${order.orderId}* (Paket ${order.packageName}) telah *BERHASIL*. Mohon dicek. Terima kasih.`;

    return (
        <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-4 font-sans print:bg-white print:py-0 print:px-0">
            <div className="max-w-3xl mx-auto">
                
                {/* Print Action Header - Hidden on Print */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 print:hidden">
                    <button 
                        onClick={() => router.push('/')}
                        className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2"
                    >
                        <FaArrowLeft /> Kembali ke Beranda
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handlePrintAndSave}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 shadow-sm"
                        >
                            <FaPrint /> Print / Simpan PDF
                        </button>
                        <a
                            href={formatWhatsAppLink(whatsappMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 shadow-sm"
                        >
                            <FaWhatsapp className="text-lg" /> Kabari Admin
                        </a>
                    </div>
                </div>

                {/* Printable Invoice Card */}
                <div id="invoice-card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none">
                    
                    {/* Header Strip */}
                    <div className="bg-indigo-600 p-8 sm:p-10 text-white flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 print:bg-white print:text-black print:border-b-2 print:border-indigo-600">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight mb-1">INVOICE</h2>
                            <p className="text-indigo-200 font-medium tracking-widest text-sm print:text-gray-500 uppercase">MOMENTUMOMEN</p>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-sm text-indigo-100 mb-1 print:text-gray-500">Tanggal Terbit</p>
                            <p className="font-medium text-lg">
                                {format(new Date(), 'dd MMMM yyyy', { locale: id })}
                            </p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10">
                        
                        {/* Success Banner */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-4 mb-10 print:hidden">
                            <FaCheckCircle className="text-2xl text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-emerald-800 text-lg">Pembayaran Berhasil!</h3>
                                <p className="text-emerald-600 text-sm mt-1">
                                    Pesanan Anda telah kami terima dan otomatis terkonfirmasi. Tim kami akan segera menghubungi Anda.
                                </p>
                            </div>
                        </div>

                        {/* Customer & Order Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 border-b border-gray-100 pb-10">
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">Ditagihkan Kepada</h4>
                                <p className="text-gray-900 font-bold text-xl mb-1">{order.fullName}</p>
                                <p className="text-gray-600 text-sm mb-1">{order.whatsapp}</p>
                                <p className="text-gray-600 text-sm">{order.email}</p>
                            </div>
                            <div className="sm:text-right">
                                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">Detail Pesanan</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex justify-between sm:justify-end gap-4">
                                        <span>No. Pesanan:</span>
                                        <span className="font-mono font-medium text-gray-900">{order.orderId}</span>
                                    </p>
                                    <p className="flex justify-between sm:justify-end gap-4">
                                        <span>Acara:</span>
                                        <span className="font-medium text-gray-900">{format(new Date(order.weddingDate), 'dd MMM yyyy', { locale: id })}</span>
                                    </p>
                                    <p className="flex justify-between sm:justify-end gap-4">
                                        <span>Metode:</span>
                                        <span className="font-medium text-gray-900 uppercase">QRIS (XENDIT)</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="py-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-gray-100 text-gray-400 text-xs tracking-wider uppercase">
                                        <th className="pb-3 font-bold">Deskripsi</th>
                                        <th className="pb-3 font-bold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-4">
                                            <p className="font-bold text-gray-900 text-lg">{order.packageName}</p>
                                            <p className="text-sm text-gray-500 mt-1">Layanan Wedding Content Creator Momen Tumomen</p>
                                            {order.notes && (
                                                <p className="text-sm text-gray-400 mt-1 italic">Catatan: {order.notes}</p>
                                            )}
                                        </td>
                                        <td className="py-4 text-right align-top">
                                            <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.packagePrice)}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Total & Stamp */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t-2 border-gray-900 gap-8">
                            
                            {/* Paid Stamp */}
                            {order.paymentStatus === 'paid' && (
                                <div className="flex items-center justify-center transform -rotate-12 border-4 border-emerald-500 text-emerald-500 rounded-lg p-3 sm:order-first order-last text-center max-w-[200px]">
                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-widest leading-none">LUNAS</h4>
                                        <p className="text-[10px] font-bold tracking-widest mt-1 border-t-2 border-emerald-500 pt-1">
                                            MOMENTUMOMEN
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="text-center sm:text-right w-full sm:w-auto">
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Total Pembayaran</p>
                                <p className="text-4xl font-black text-indigo-600 print:text-gray-900">
                                    {formatCurrency(order.packagePrice)}
                                </p>
                            </div>
                        </div>

                    </div>
                    
                    {/* Footer / Terms */}
                    <div className="bg-gray-50 p-8 text-center sm:text-left text-xs text-gray-400 border-t border-gray-100 print:bg-white">
                        <p className="mb-1">Terima kasih telah mempercayakan dokumentasi momen berharga Anda kepada Momen Tumomen.</p>
                        <p>Simpan invoice ini sebagai bukti sah pembayaran.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
