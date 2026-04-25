'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    FaUser, FaEnvelope, FaWhatsapp, FaCalendar, FaClipboardList,
    FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { PACKAGES, formatCurrency } from '@/lib/config';
import { checkDateAvailability } from '@/lib/googleSheets';
import { BookingFormData, Order } from '@/lib/types';
import { saveOrder, generateOrderId } from '@/lib/orderStore';

type Step = 1 | 'full';

function PemesananContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const preSelectedPackage = searchParams.get('package') || '';

    const [currentStep, setCurrentStep] = useState<Step>(1);

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
        else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.whatsapp.replace(/\s/g, ''))) newErrors.whatsapp = 'Format WA tidak valid';
        if (!formData.weddingDate) {
            newErrors.weddingDate = 'Tanggal pernikahan harus dipilih';
        } else {
            const selectedDate = new Date(formData.weddingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) newErrors.weddingDate = 'Tanggal tidak boleh di masa lalu';
        }
        if (!formData.selectedPackage) newErrors.selectedPackage = 'Paket harus dipilih';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Check double booking
        setIsCheckingDate(true);
        try {
            const { available } = await checkDateAvailability(formData.weddingDate);
            if (!available) {
                setCurrentStep('full');
                setIsCheckingDate(false);
                return;
            }
        } catch { /* proceed on error */ }
        setIsCheckingDate(false);

        setIsSubmitting(true);
        try {
            const orderId = generateOrderId();
            const pkg = PACKAGES.find(p => p.id === formData.selectedPackage);

            // POST to backend API to create Xendit Transaction & Add to Sheet
            const response = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    fullName: formData.fullName,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    weddingDate: formData.weddingDate,
                    selectedPackage: formData.selectedPackage,
                    packageName: pkg?.name || formData.selectedPackage,
                    packagePrice: pkg?.price || 0,
                    notes: formData.notes
                })
            });

            const result = await response.json();

            if (result.success && result.xenditId && result.qrString) {
                const newOrder: Order = {
                    orderId,
                    fullName: formData.fullName,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    weddingDate: formData.weddingDate,
                    selectedPackage: formData.selectedPackage,
                    packageName: pkg?.name || formData.selectedPackage,
                    packagePrice: result.amount || pkg?.price || 0,
                    notes: formData.notes,
                    paymentMethod: 'qris',
                    paymentStatus: 'pending',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    expiredAt: result.expiresAt
                };
                
                saveOrder(newOrder); // Legacy/fallback local preservation
                
                // Pindah langsung ke halaman pembayaran QRIS dinamis via link rute khusus
                router.push(`/pembayaran/${orderId}`);
            } else {
                alert('❌ ' + (result.message || 'Gagal generate pembayaran. Coba lagi.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Terjadi kesalahan server saat generate tagihan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedPackageData = PACKAGES.find(p => p.id === formData.selectedPackage);

    return (
        <div className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">

                    {/* ==================== JADWAL FULL ==================== */}
                    {currentStep === 'full' && (
                        <div className="max-w-xl mx-auto text-center">
                            <div className="bg-white rounded-3xl shadow-xl p-12 border border-amber-100">
                                <FaExclamationTriangle className="text-7xl text-amber-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                    ⚠️ JADWAL FULL BOOKING
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Tanggal <span className="font-bold text-indigo-600">{formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span> sudah penuh. Silakan pilih hari lain.
                                </p>
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all"
                                >
                                    Pilih Tanggal Lain
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== NORMAL STEPS ==================== */}
                    {currentStep === 1 && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                                    Mulai Pesanan
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-indigo-50">
                                        <form onSubmit={handleSubmitForm} className="space-y-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    <FaUser className="inline mr-2 text-indigo-500" /> Nama Pasangan *
                                                </label>
                                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                                    placeholder="Cth: Romeo & Juliet"
                                                    className={`w-full px-5 py-4 bg-gray-50 rounded-xl border outline-none transition-colors focus:border-indigo-500 focus:bg-white ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`} />
                                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaEnvelope className="inline mr-2 text-indigo-500" /> Email *
                                                    </label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                                        placeholder="email@contoh.com"
                                                        className={`w-full px-5 py-4 bg-gray-50 rounded-xl border outline-none transition-colors focus:border-indigo-500 focus:bg-white ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaWhatsapp className="inline mr-2 text-indigo-500" /> WhatsApp *
                                                    </label>
                                                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                                                        placeholder="0812xxxxxxxxx"
                                                        className={`w-full px-5 py-4 bg-gray-50 rounded-xl border outline-none transition-colors focus:border-indigo-500 focus:bg-white ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'}`} />
                                                    {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                                                    <p className="text-xs text-gray-400 mt-1">Gunakan nomor ini nanti untuk melacak pesanan.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaCalendar className="inline mr-2 text-indigo-500" /> Tgl Pernikahan *
                                                    </label>
                                                    <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange}
                                                        className={`w-full px-5 py-4 bg-gray-50 rounded-xl border outline-none transition-colors focus:border-indigo-500 focus:bg-white ${errors.weddingDate ? 'border-red-500' : 'border-gray-200'}`} />
                                                    {errors.weddingDate && <p className="text-red-500 text-sm mt-1">{errors.weddingDate}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        <FaClipboardList className="inline mr-2 text-indigo-500" /> Pilih Paket *
                                                    </label>
                                                    <select name="selectedPackage" value={formData.selectedPackage} onChange={handleChange}
                                                        className={`w-full px-5 py-4 bg-gray-50 rounded-xl border outline-none transition-colors focus:border-indigo-500 focus:bg-white ${errors.selectedPackage ? 'border-red-500' : 'border-gray-200'}`}>
                                                        <option value="">-- Pilih Paket --</option>
                                                        {PACKAGES.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name} - {formatCurrency(pkg.price)}</option>)}
                                                    </select>
                                                    {errors.selectedPackage && <p className="text-red-500 text-sm mt-1">{errors.selectedPackage}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Catatan (opsional)</label>
                                                <textarea name="notes" value={formData.notes} onChange={handleChange}
                                                    rows={3} placeholder="Info lokasi acara, dresscode, dll..."
                                                    className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 outline-none transition-colors resize-none focus:border-indigo-500 focus:bg-white" />
                                            </div>

                                            <button type="submit" disabled={isSubmitting || isCheckingDate}
                                                className="w-full bg-indigo-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                                {isCheckingDate ? '⏳ Memeriksa Kuota...' : isSubmitting ? '⏳ Membuat Tagihan QRIS...' : 'Selesaikan Booking & Bayar →'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24 border border-indigo-50">
                                        <h3 className="font-bold text-gray-800 mb-6 text-lg border-b pb-4">Ringkasan Pesanan</h3>
                                        {selectedPackageData ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-indigo-600 font-bold text-xl">{selectedPackageData.name}</p>
                                                    <p className="text-gray-500 text-sm">{selectedPackageData.duration}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-xl">
                                                    <p className="text-3xl font-black text-gray-900">{formatCurrency(selectedPackageData.price)}</p>
                                                </div>
                                                <ul className="text-sm text-gray-600 space-y-2 mt-4">
                                                    {selectedPackageData.deliverables.map((d, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-indigo-500 mr-2">✓</span> {d}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-center py-10">Pilih paket untuk melihat detail</p>
                                        )}
                                    </div>
                                </div>
                            </div>
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Memuat...</p>
                </div>
            </div>
        }>
            <PemesananContent />
        </Suspense>
    );
}
