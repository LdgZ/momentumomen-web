'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLogin() {
    const [whatsapp, setWhatsapp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!whatsapp || whatsapp.length < 9) {
             setError('Nomor WA tidak valid');
             setLoading(false);
             return;
        }

        try {
            const res = await fetch('/api/customer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.message || 'Nomor tidak terdaftar. Pastikan Anda sudah membuat pesanan menggunakan nomor ini.');
            }
        } catch {
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
            <div className="absolute top-6 left-6">
                 <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                     <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
                 </Link>
            </div>
            
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-indigo-100/50">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 mb-6 text-indigo-500 rotate-3">
                        <Phone className="w-8 h-8 -rotate-3" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Login Pelanggan</h1>
                    <p className="text-gray-500 text-sm">Masuk untuk melihat pesanan, tagihan, dan file Anda.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nomor WhatsApp Terdaftar
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                +62
                            </span>
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '');
                                    if(val.startsWith('62')) val = val.substring(2);
                                    if(val.startsWith('0')) val = val.substring(1);
                                    setWhatsapp(val);
                                }}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                                placeholder="81234567890"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Ganti awalan 0 menjadi +62 (contoh: 812...)</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !whatsapp}
                        className="w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-indigo-200"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Lacak Pesanan Saya</span>
                                <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    
                    <div className="text-center mt-6">
                        <Link href="/pemesanan" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Belum punya pesanan? Daftar di sini.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
