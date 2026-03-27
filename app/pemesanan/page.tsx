'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    FaUser, FaEnvelope, FaWhatsapp, FaCalendar, FaClipboardList,
    FaCheckCircle, FaDownload, FaClock, FaUniversity, FaCopy,
    FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { PACKAGES, formatCurrency, formatWhatsAppLink, SEABANK_NUMBER, SEABANK_NAME } from '@/lib/config';
import { submitBooking, checkDateAvailability } from '@/lib/googleSheets';
import { BookingFormData, Order } from '@/lib/types';
import { saveOrder, getOrder, clearOrder, generateOrderId } from '@/lib/orderStore';

type Step = 1 | 2 | 3 | 'expired' | 'full';

// Save all orders to localStorage for admin & double-booking checks
function saveToAllOrders(order: Order) {
    try {
        const all = JSON.parse(localStorage.getItem('all_orders') || '[]');
        const idx = all.findIndex((o: Order) => o.orderId === order.orderId);
        if (idx >= 0) all[idx] = order;
        else all.push(order);
        localStorage.setItem('all_orders', JSON.stringify(all));
    } catch { /* silent */ }
}

function PemesananContent() {
    const searchParams = useSearchParams();
    const preSelectedPackage = searchParams.get('package') || '';

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [order, setOrder] = useState<Order | null>(null);
    const [timeLeft, setTimeLeft] = useState(0); // seconds remaining
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState<BookingFormData>({
        fullName: '',
        email: '',
        whatsapp: '',
        weddingDate: '',
        selectedPackage: preSelectedPackage,
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingDate, setIsCheckingDate] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Restore saved order on mount
    useEffect(() => {
        const saved = getOrder();
        if (saved) {
            // Guard: if old order without expiredAt, clear it
            if (!saved.expiredAt) {
                clearOrder();
                return;
            }
            setOrder(saved);
            if (saved.paymentStatus === 'expired') {
                setCurrentStep('expired');
            } else if (saved.paymentStatus === 'awaiting_confirmation') {
                setCurrentStep(3);
            } else {
                setCurrentStep(2);
            }
        }
    }, []);

    // Countdown timer
    const checkExpiry = useCallback((ord: Order) => {
        const expiredAt = new Date(ord.expiredAt).getTime();
        const now = Date.now();
        const diff = Math.floor((expiredAt - now) / 1000);
        if (diff <= 0) {
            // Mark as expired
            const expired = { ...ord, paymentStatus: 'expired' as const };
            saveOrder(expired);
            saveToAllOrders(expired);
            setOrder(expired);
            setCurrentStep('expired');
            setTimeLeft(0);
        } else {
            setTimeLeft(diff);
        }
    }, []);

    useEffect(() => {
        if (!order || currentStep !== 2) return;
        checkExpiry(order);
        const interval = setInterval(() => checkExpiry(order), 1000);
        return () => clearInterval(interval);
    }, [order, currentStep, checkExpiry]);

    const formatCountdown = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap harus diisi';
        if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid';
        if (!formData.whatsapp.trim()) newErrors.whatsapp = 'Nomor WhatsApp harus diisi';
        else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.whatsapp.replace(/\s/g, ''))) newErrors.whatsapp = 'Format nomor WhatsApp tidak valid';
        if (!formData.weddingDate) {
            newErrors.weddingDate = 'Tanggal pernikahan harus dipilih';
        } else {
            const selectedDate = new Date(formData.weddingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) newErrors.weddingDate = 'Tanggal pernikahan tidak boleh di masa lalu';
        }
        if (!formData.selectedPackage) newErrors.selectedPackage = 'Paket harus dipilih';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Check double booking (max 2 per day)
        setIsCheckingDate(true);
        try {
            const { available, count } = await checkDateAvailability(formData.weddingDate);
            if (!available) {
                setCurrentStep('full');
                setIsCheckingDate(false);
                return;
            }
        } catch {
            /* proceed even if check fails */
        }
        setIsCheckingDate(false);

        setIsSubmitting(true);
        try {
            const orderId = generateOrderId();
            const pkg = PACKAGES.find(p => p.id === formData.selectedPackage);
            const createdAt = new Date().toISOString();
            const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

            const result = await submitBooking({
                ...formData,
                paymentMethod: 'transfer',
                orderId
            });

            if (result.success) {
                const newOrder: Order = {
                    orderId,
                    fullName: formData.fullName,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    weddingDate: formData.weddingDate,
                    selectedPackage: formData.selectedPackage,
                    packageName: pkg?.name || formData.selectedPackage,
                    packagePrice: pkg?.price || 0,
                    notes: formData.notes,
                    paymentMethod: 'transfer',
                    paymentStatus: 'pending',
                    status: 'pending',
                    createdAt,
                    expiredAt
                };
                setOrder(newOrder);
                setCurrentStep(2);
                saveOrder(newOrder);
                saveToAllOrders(newOrder);
            } else {
                alert('❌ ' + (result.message || 'Terjadi kesalahan. Silakan coba lagi.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSudahBayar = () => {
        if (!order) return;
        const updated = { ...order, paymentStatus: 'awaiting_confirmation' as const, paidAt: new Date().toISOString() };
        saveOrder(updated);
        saveToAllOrders(updated);
        setOrder(updated);
        setCurrentStep(3);
    };

    const handleNewOrder = () => {
        clearOrder();
        setOrder(null);
        setFormData({ fullName: '', email: '', whatsapp: '', weddingDate: '', selectedPackage: '', notes: '' });
        setCurrentStep(1);
    };

    const handleCopyAccountNumber = () => {
        navigator.clipboard.writeText(SEABANK_NUMBER);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadReceipt = () => {
        if (!order) return;
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) { alert('Popup diblokir browser. Silakan izinkan popup.'); return; }
        const dateStr = new Date(order.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        receiptWindow.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Receipt - ${order.orderId}</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;padding:40px}.receipt{max-width:600px;margin:0 auto;border:2px solid #e11d48;border-radius:16px;overflow:hidden}.header{background:linear-gradient(135deg,#e11d48,#ec4899);color:white;padding:30px;text-align:center}.header h1{font-size:28px;font-weight:800;letter-spacing:2px}.header p{opacity:.85;margin-top:4px}.body{padding:30px}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6}.label{color:#6b7280}.value{font-weight:600}.total{background:#fef2f2;padding:20px;border-radius:12px;margin-top:20px;text-align:center}.total .amount{font-size:32px;font-weight:800;color:#e11d48}.status{display:inline-block;background:#fef9c3;color:#a16207;padding:6px 16px;border-radius:99px;font-size:14px;font-weight:600;margin-top:8px}.bank{background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;margin-top:16px;text-align:center}.bank-name{color:#16a34a;font-weight:700;font-size:18px}.bank-no{font-size:24px;font-weight:800}.bank-holder{color:#6b7280;font-size:14px;margin-top:4px}@media print{body{padding:0}.receipt{border:none}}</style>
        </head><body><div class="receipt"><div class="header"><h1>momentumomen</h1><p>Bukti Pemesanan Wedding Content Creator</p></div>
        <div class="body"><div class="row"><span class="label">No. Pesanan</span><span class="value">${order.orderId}</span></div>
        <div class="row"><span class="label">Nama</span><span class="value">${order.fullName}</span></div>
        <div class="row"><span class="label">Tanggal Pernikahan</span><span class="value">${dateStr}</span></div>
        <div class="row"><span class="label">Paket</span><span class="value">${order.packageName}</span></div>
        <div class="row"><span class="label">Metode Bayar</span><span class="value">Transfer Bank SeaBank</span></div>
        <div class="row"><span class="label">Status</span><span class="value">Menunggu Konfirmasi Admin</span></div>
        <div class="total"><p>Total Pembayaran</p><p class="amount">${new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(order.packagePrice)}</p></div>
        <div class="bank"><div class="bank-name">SeaBank</div><div class="bank-no">${SEABANK_NUMBER}</div><div class="bank-holder">a/n ${SEABANK_NAME}</div></div>
        </div></div><script>window.onload=function(){window.print()}</script></body></html>`);
        receiptWindow.document.close();
    };

    const selectedPackageData = PACKAGES.find(p => p.id === (order?.selectedPackage || formData.selectedPackage));
    const urgencyColor = timeLeft < 3600 ? 'text-red-600' : timeLeft < 7200 ? 'text-orange-500' : 'text-green-600';

    return (
        <div className="py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-white min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">

                    {/* ==================== JADWAL FULL ==================== */}
                    {currentStep === 'full' && (
                        <div className="max-w-xl mx-auto text-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-12">
                                <FaExclamationTriangle className="text-7xl text-yellow-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                    ⚠️ JADWAL FULL BOOKING
                                </h2>
                                <p className="text-lg text-gray-600 mb-3">
                                    Tanggal <span className="font-bold text-rose-600">{formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span> sudah memiliki 2 event yang terdaftar.
                                </p>
                                <p className="text-gray-500 mb-8">
                                    Buat penjadwalan di hari lain untuk memastikan kami dapat melayani pernikahan Anda dengan maksimal.
                                </p>
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all"
                                >
                                    Pilih Tanggal Lain
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== EXPIRED ==================== */}
                    {currentStep === 'expired' && (
                        <div className="max-w-xl mx-auto text-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-12">
                                <FaTimesCircle className="text-7xl text-red-500 mx-auto mb-6 animate-pulse" />
                                <h2 className="text-3xl font-bold text-red-600 mb-4">
                                    Pembayaran & Booking Gagal
                                </h2>
                                <p className="text-gray-600 mb-2">
                                    Batas waktu pembayaran telah habis (lebih dari 24 jam).
                                </p>
                                <p className="text-gray-500 mb-8">
                                    No. Pesanan: <span className="font-bold">{order?.orderId}</span> telah dibatalkan secara otomatis.
                                </p>
                                <button
                                    onClick={handleNewOrder}
                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all"
                                >
                                    Buat Pesanan Baru
                                </button>
                                <a
                                    href={formatWhatsAppLink('Halo momentumomen, saya ingin booking ulang setelah pembayaran saya expired')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 w-full border-2 border-green-500 text-green-600 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-green-50 transition-all"
                                >
                                    <FaWhatsapp /> Hubungi via WhatsApp
                                </a>
                            </div>
                        </div>
                    )}

                    {/* ==================== NORMAL STEPS ==================== */}
                    {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                                    {currentStep === 1 && 'Formulir Pemesanan'}
                                    {currentStep === 2 && 'Pembayaran'}
                                    {currentStep === 3 && 'Konfirmasi Diterima'}
                                </h1>
                            </div>

                            {/* Step Indicator */}
                            <div className="flex items-center justify-center mb-12">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${step <= currentStep ? 'bg-rose-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                                            {(step as number) < (currentStep as number) ? <FaCheckCircle /> : step}
                                        </div>
                                        {step < 3 && <div className={`w-12 sm:w-20 h-1 mx-2 transition-all ${step < (currentStep as number) ? 'bg-rose-500' : 'bg-gray-200'}`} />}
                                    </div>
                                ))}
                            </div>

                            {/* ===== STEP 1: FORM ===== */}
                            {currentStep === 1 && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <div className="bg-white rounded-2xl shadow-xl p-8">
                                            <form onSubmit={handleSubmitForm} className="space-y-6">
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaUser className="inline mr-2 text-rose-600" /> Nama Lengkap Pasangan *
                                                    </label>
                                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                                        placeholder="Cth: Budi & Ani"
                                                        className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors focus:border-rose-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
                                                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaEnvelope className="inline mr-2 text-rose-600" /> Email *
                                                    </label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                                        placeholder="email@contoh.com"
                                                        className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors focus:border-rose-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaWhatsapp className="inline mr-2 text-rose-600" /> Nomor WhatsApp *
                                                    </label>
                                                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                                                        placeholder="085xxxxxxxxx"
                                                        className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors focus:border-rose-500 ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'}`} />
                                                    {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaCalendar className="inline mr-2 text-rose-600" /> Tanggal Pernikahan *
                                                    </label>
                                                    <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors focus:border-rose-500 ${errors.weddingDate ? 'border-red-500' : 'border-gray-300'}`} />
                                                    {errors.weddingDate && <p className="text-red-500 text-sm mt-1">{errors.weddingDate}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaClipboardList className="inline mr-2 text-rose-600" /> Pilih Paket *
                                                    </label>
                                                    <select name="selectedPackage" value={formData.selectedPackage} onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors focus:border-rose-500 ${errors.selectedPackage ? 'border-red-500' : 'border-gray-300'}`}>
                                                        <option value="">-- Pilih Paket --</option>
                                                        {PACKAGES.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name} - {formatCurrency(pkg.price)}</option>)}
                                                    </select>
                                                    {errors.selectedPackage && <p className="text-red-500 text-sm mt-1">{errors.selectedPackage}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Catatan (opsional)</label>
                                                    <textarea name="notes" value={formData.notes} onChange={handleChange}
                                                        rows={3} placeholder="Info tambahan tentang lokasi, tema, dll..."
                                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 outline-none transition-colors resize-none focus:border-rose-500" />
                                                </div>

                                                {/* Payment Info Banner */}
                                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <FaUniversity className="text-2xl text-blue-600 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-bold text-blue-700">Pembayaran via Transfer Bank</p>
                                                            <p className="text-blue-600 text-sm">SeaBank · {SEABANK_NUMBER} · a/n {SEABANK_NAME}</p>
                                                            <p className="text-blue-500 text-xs mt-1">⏱️ Setelah pesan, Anda memiliki <strong>24 jam</strong> untuk menyelesaikan pembayaran</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button type="submit" disabled={isSubmitting || isCheckingDate}
                                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-full text-lg font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed">
                                                    {isCheckingDate ? '⏳ Memeriksa ketersediaan tanggal...' : isSubmitting ? '⏳ Memproses...' : 'Lanjut ke Pembayaran →'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                                            <h3 className="font-bold text-gray-800 mb-4 text-lg">📋 Ringkasan Pesanan</h3>
                                            {selectedPackageData ? (
                                                <div className="space-y-3">
                                                    <p className="text-rose-600 font-bold text-lg">{selectedPackageData.name}</p>
                                                    <p className="text-gray-500 text-sm">{selectedPackageData.duration}</p>
                                                    <div className="border-t pt-3">
                                                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(selectedPackageData.price)}</p>
                                                    </div>
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {selectedPackageData.deliverables.map((d, i) => <li key={i}>✓ {d}</li>)}
                                                    </ul>
                                                </div>
                                            ) : <p className="text-gray-400 text-sm">Pilih paket untuk melihat ringkasan</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== STEP 2: PAYMENT ===== */}
                            {currentStep === 2 && order && (
                                <div className="max-w-lg mx-auto space-y-6">
                                    {/* Countdown */}
                                    <div className={`rounded-2xl p-6 text-center border-2 ${timeLeft < 3600 ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                                        <FaClock className={`text-4xl mx-auto mb-2 ${urgencyColor}`} />
                                        <p className="text-gray-600 text-sm mb-1">Selesaikan pembayaran dalam</p>
                                        <p className={`text-5xl font-black tracking-widest ${urgencyColor}`}>
                                            {formatCountdown(timeLeft)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Batas: {new Date(order.expiredAt).toLocaleString('id-ID')}
                                        </p>
                                        {timeLeft < 3600 && (
                                            <p className="text-red-600 font-bold text-sm mt-2 animate-pulse">
                                                ⚠️ Kurang dari 1 jam! Segera selesaikan pembayaran.
                                            </p>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Ringkasan Pesanan</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">No. Pesanan</span><span className="font-bold">{order.orderId}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Nama</span><span className="font-semibold">{order.fullName}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Tanggal Nikah</span><span className="font-semibold">{new Date(order.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Paket</span><span className="font-semibold">{order.packageName}</span></div>
                                            <div className="border-t pt-2 flex justify-between">
                                                <span className="font-bold text-gray-700">Total Bayar</span>
                                                <span className="font-black text-rose-600 text-lg">{formatCurrency(order.packagePrice)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Account */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <FaUniversity className="text-rose-600" /> Transfer ke Rekening Berikut
                                        </h3>
                                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-teal-700 font-bold text-xl">SeaBank</span>
                                                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-semibold">Virtual Account</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-3">
                                                <p className="text-3xl font-black text-gray-800 tracking-wider">{SEABANK_NUMBER}</p>
                                                <button
                                                    onClick={handleCopyAccountNumber}
                                                    className="text-teal-600 hover:text-teal-800 transition-colors p-2 hover:bg-teal-100 rounded-lg"
                                                    title="Salin nomor rekening"
                                                >
                                                    <FaCopy className="text-xl" />
                                                </button>
                                            </div>
                                            <p className="text-gray-600 mt-1">a/n <span className="font-bold">{SEABANK_NAME}</span></p>
                                            {copied && <p className="text-green-600 text-sm font-semibold mt-2">✓ Nomor rekening disalin!</p>}
                                        </div>
                                        <div className="mt-4 space-y-2 text-xs text-gray-500">
                                            <p>• Transfer tepat sesuai nominal yang tertera</p>
                                            <p>• Simpan bukti transfer sebagai konfirmasi</p>
                                            <p>• Klik tombol &quot;Sudah Transfer&quot; setelah pembayaran</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <button
                                        onClick={handleSudahBayar}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-5 rounded-full text-xl font-black hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        ✅ Saya Sudah Transfer
                                    </button>

                                    <a
                                        href={formatWhatsAppLink(`Halo momentumomen, saya sudah transfer untuk pesanan ${order.orderId} - ${order.packageName} - ${formatCurrency(order.packagePrice)}`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 border-2 border-green-400 text-green-600 py-4 rounded-full font-bold hover:bg-green-50 transition-all"
                                    >
                                        <FaWhatsapp className="text-xl" /> Konfirmasi via WhatsApp
                                    </a>
                                </div>
                            )}

                            {/* ===== STEP 3: AWAITING CONFIRMATION ===== */}
                            {currentStep === 3 && order && (
                                <div className="max-w-lg mx-auto">
                                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-8 text-center text-white">
                                            <FaClock className="text-6xl mx-auto mb-3" />
                                            <h2 className="text-2xl font-black">Menunggu Konfirmasi Admin</h2>
                                            <p className="opacity-90 mt-2">Pembayaran Anda sedang diverifikasi</p>
                                        </div>

                                        <div className="p-8">
                                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                                                <p className="text-amber-800 text-sm font-semibold">
                                                    ⏳ Admin akan memverifikasi pembayaran Anda dalam 1×24 jam. Setelah dikonfirmasi, status booking Anda akan berubah menjadi <strong>Berhasil</strong>.
                                                </p>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between items-center py-2 border-b">
                                                    <span className="text-gray-500">No. Pesanan</span>
                                                    <span className="font-bold text-gray-800">{order.orderId}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b">
                                                    <span className="text-gray-500">Nama</span>
                                                    <span className="font-semibold">{order.fullName}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b">
                                                    <span className="text-gray-500">Paket</span>
                                                    <span className="font-semibold">{order.packageName}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b">
                                                    <span className="text-gray-500">Total</span>
                                                    <span className="font-black text-rose-600 text-lg">{formatCurrency(order.packagePrice)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-gray-500">Status</span>
                                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">Menunggu Konfirmasi</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <button
                                                    onClick={handleDownloadReceipt}
                                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                                                >
                                                    <FaDownload /> Download Bukti Pesanan
                                                </button>
                                                <a
                                                    href={formatWhatsAppLink(`Halo momentumomen, saya sudah transfer untuk pesanan ${order.orderId} - ${order.packageName}. Mohon dikonfirmasi ya.`)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-green-500 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                                                >
                                                    <FaWhatsapp /> Konfirmasi via WhatsApp
                                                </a>
                                                <button
                                                    onClick={handleNewOrder}
                                                    className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all"
                                                >
                                                    Buat Pesanan Baru
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PemesananPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-rose-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
                    <p className="text-gray-600">Memuat halaman pemesanan...</p>
                </div>
            </div>
        }>
            <PemesananContent />
        </Suspense>
    );
}
