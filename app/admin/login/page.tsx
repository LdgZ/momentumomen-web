'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Loader2 } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/admin');
                router.refresh();
            } else {
                setError(data.message || 'Password salah');
            }
        } catch {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-outfit">
            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
                        <Lock className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-zinc-400 text-sm">Masuk untuk mengelola data pesanan</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Password Admin
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            placeholder="••••••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Masuk Dashboard</span>
                                <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-500">
                        &copy; 2026 momentumomen. Secure Access Only.
                    </p>
                </div>
            </div>
        </div>
    );
}
