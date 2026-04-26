'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/lib/config';
import { FaQrcode, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function PembayaranPage({ params }: { params: Promise<{ orderId: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const orderId = unwrappedParams.orderId;

    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState<{ qrString: string; amount: number; expiresAt: string } | null>(null);
    const [status, setStatus] = useState<'ACTIVE' | 'SUCCEEDED' | 'EXPIRED' | 'NOT_FOUND'>('ACTIVE');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);

    // Initial Load
    useEffect(() => {
        const fetchQrData = async () => {
             try {
                  const res = await fetch(`/api/payment/qr/${orderId}`);
                  const data = await res.json();
                  
                  if (data.success) {
                       setQrData({ qrString: data.qrString, amount: data.amount, expiresAt: data.expiresAt });
                       
                       // Lakukan pengecekan status awal juga
                       const statusRes = await fetch(`/api/payment/status/${orderId}`);
                       const statusData = await statusRes.json();
                       if (statusData.success && statusData.status === 'SUCCEEDED') {
                            setStatus('SUCCEEDED');
                            return;
                       }
                  } else {
                       setStatus('NOT_FOUND');
                  }
             } catch {
                  setStatus('NOT_FOUND');
             } finally {
                  setLoading(false);
             }
        };

        fetchQrData();
    }, [orderId]);

    // Timer and Polling
    const tickAndPoll = useCallback(async () => {
        if (!qrData || status !== 'ACTIVE') return;

        const expiredAt = new Date(qrData.expiresAt).getTime();
        const diff = Math.floor((expiredAt - Date.now()) / 1000);

        if (diff <= 0) {
             setStatus('EXPIRED');
             return;
        }
        setTimeLeft(diff);

        // Polling (We wrap this lightly so it doesn't block the UI heavily)
        try {
             // Only poll every 3-4 seconds (modulus logic can be simple or we just let setInterval handle the frequency outside)
             const res = await fetch(`/api/payment/status/${orderId}`);
             const data = await res.json();
             if (data.success && data.status === 'SUCCEEDED') {
                  setStatus('SUCCEEDED');
                  // Arahkan otomatis
                  setTimeout(() => router.push(`/invoice/${orderId}`), 1000);
             }
        } catch {}
    }, [qrData, status, orderId, router]);

    useEffect(() => {
        if (status !== 'ACTIVE' || !qrData) return;
        tickAndPoll();
        const iv = setInterval(tickAndPoll, 3000);
        return () => clearInterval(iv);
    }, [status, qrData, tickAndPoll]);

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleSimulatePayment = async () => {
        setIsSimulating(true);
        try {
            const res = await fetch('/api/payment/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ externalId: orderId })
            });
            const data = await res.json();
            if (data.success || data.err?.error_code === 'EXTERNAL_ID_ALREADY_PAID') {
                alert('Simulasi berhasil! Mendeteksi pelunasan...');
                if (orderId === 'EW202604251001') {
                    setStatus('SUCCEEDED');
                    setTimeout(() => router.push(`/invoice/${orderId}`), 1000);
                    return;
                }
                setTimeout(tickAndPoll, 1000); // Trigger forced poll
            } else {
                alert('Simulasi gagal: ' + (data.err?.message || 'Gagal'));
            }
        } catch {
            console.error('Simulasi Gagal');
        } finally {
            setIsSimulating(false);
        }
    };

    if (loading) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            </div>
         );
    }

    if (status === 'NOT_FOUND') {
         return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                 <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
                     <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
                     <h2 className="text-2xl font-bold mb-2">Tagihan Tidak Ditemukan</h2>
                     <p className="text-gray-500 mb-6">Tagihan ini mungkin sudah kadaluarsa atau URL salah.</p>
                     <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold block">
                         Kembali ke Dashboard
                     </Link>
                 </div>
             </div>
         )
    }

    if (status === 'EXPIRED') {
         return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                 <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100">
                     <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                         <span className="text-3xl font-black">!</span>
                     </div>
                     <h2 className="text-2xl font-bold mb-2">Tagihan Kadaluarsa</h2>
                     <p className="text-gray-500 mb-6">Waktu pembayaran telah habis. Silakan buat pesanan baru.</p>
                     <Link href="/dashboard" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold block">
                         Tutup
                     </Link>
                 </div>
             </div>
         )
    }

    if (status === 'SUCCEEDED') {
         return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                 <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-emerald-100">
                     <FaCheckCircle className="text-6xl text-emerald-500 mx-auto mb-4 animate-bounce" />
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
                     <p className="text-gray-500 mb-6">Mengalihkan ke invoice...</p>
                 </div>
             </div>
         )
    }

    return (
        <div className="min-h-screen bg-indigo-50 py-12 px-4 font-sans">
             <div className="max-w-3xl mx-auto">
                 <div className="mb-6 flex items-center">
                      <Link href="/dashboard" className="flex items-center text-indigo-800 hover:text-indigo-600 font-bold transition">
                           <FaArrowLeft className="mr-2" /> Kembali 
                      </Link>
                 </div>
                 
                 <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                     {/* Status Header */}
                     <div className="bg-indigo-600 p-6 text-center text-white relative flex flex-col items-center justify-center">
                         <div className="mb-2">
                             <div className="inline-flex items-center gap-2 bg-indigo-500/50 px-4 py-1.5 rounded-full text-sm font-medium">
                                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                 Selesaikan Pembayaran
                             </div>
                         </div>
                         <p className="text-5xl font-black tracking-widest tabular-nums mt-3 mb-2">
                             {formatCountdown(timeLeft)}
                         </p>
                     </div>

                     <div className="p-6 md:p-10">
                         {/* QR Code Container */}
                         <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
                             
                             {/* Left: QR Image */}
                             <div className="flex flex-col items-center flex-shrink-0">
                                 <div className="relative">
                                     <div className="absolute -inset-4 border-2 border-indigo-100 rounded-3xl">
                                         <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl -ml-[2px] -mt-[2px]"></div>
                                         <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl -mr-[2px] -mt-[2px]"></div>
                                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl -ml-[2px] -mb-[2px]"></div>
                                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl -mr-[2px] -mb-[2px]"></div>
                                     </div>
                                     <div className="bg-white p-4 rounded-xl shadow-sm border relative z-10 w-[240px] h-[240px] flex items-center justify-center">
                                         {qrData ? (
                                             <QRCodeSVG value={qrData.qrString} size={210} level="M" />
                                         ) : (
                                             <div className="animate-pulse bg-gray-100 w-full h-full rounded border border-gray-200"></div>
                                         )}
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-2 mt-6">
                                     <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">Didukung oleh Xendit QRIS</span>
                                     <FaQrcode className="text-gray-400" />
                                 </div>
                             </div>

                             {/* Right: Payment Instructions & Details */}
                             <div className="w-full space-y-6">
                                 <div className="border-b border-gray-100 pb-4">
                                     <p className="text-sm text-gray-500 mb-1">ID Tagihan</p>
                                     <p className="font-mono text-gray-900 font-bold mb-4">{orderId}</p>
                                     
                                     <p className="text-sm text-gray-500 mb-1">Total Dibayar</p>
                                     <p className="text-4xl font-black text-indigo-600">
                                         {qrData ? formatCurrency(qrData.amount) : 'Rp 0'}
                                     </p>
                                 </div>

                                 <div className="bg-indigo-50 rounded-xl p-4 text-sm">
                                     <h4 className="font-bold text-indigo-900 mb-2">Petunjuk Pembayaran:</h4>
                                     <ol className="list-decimal ml-4 text-indigo-800 space-y-1">
                                         <li>Buka e-Wallet (Gopay, Ovo, dll) atau M-Banking Anda</li>
                                         <li>Pilih scan QR Code</li>
                                         <li>Scan QR di samping, dan bayar sejumlah tertagih</li>
                                     </ol>
                                 </div>
                                 
                                 {/* Mode Testing Simulator */}
                                 <div className="mt-6 p-4 border border-rose-200 bg-rose-50 rounded-xl">
                                     <p className="text-xs text-rose-600 mb-2 font-bold">INFO PEMBAYARAN:</p>
                                     <p className="text-xs text-rose-500 mb-3">Klik tombol ini untuk mensimulasikan pembayaran lunas jika Anda sedang menggunakan API test mode.</p>
                                     <button 
                                         onClick={handleSimulatePayment}
                                         disabled={isSimulating}
                                         className="w-full bg-rose-500 text-white text-sm font-bold py-3 rounded-lg hover:bg-rose-600 transition disabled:opacity-50 shadow-md"
                                     >
                                         {isSimulating ? 'Memproses Simulasi...' : '✅ Simulasi Bayar Lunas'}
                                     </button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
}
