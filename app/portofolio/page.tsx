'use client';

import { useState } from 'react';
import { FaTimes, FaPlay, FaChevronLeft, FaChevronRight, FaExpand, FaHeart, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

type MediaItem = {
    id: number;
    type: 'photo' | 'video';
    title: string;
    category: string;
    src: string;
    thumbnail?: string;
};

// ===================================================================
// PANDUAN UNTUK MENAMBAH FOTO/VIDEO:
// 1. Letakkan file foto di folder: public/portfolio/photos/
// 2. Letakkan file video di folder: public/portfolio/videos/
// 3. Tambahkan entri baru di array portfolioItems di bawah ini
// Contoh foto:   { id: 10, type: 'photo', title: '...', category: 'Wedding', src: '/portfolio/photos/namafile.jpg' }
// Contoh video:  { id: 11, type: 'video', title: '...', category: 'Wedding', src: '/portfolio/videos/namafile.mp4', thumbnail: '/portfolio/photos/thumbnail.jpg' }
// ===================================================================
const portfolioItems: MediaItem[] = [
    // ===== FOTO (4 file dari public/portfolio/photos/) =====
    { id: 1, type: 'photo', title: 'Momen Pernikahan 1', category: 'Wedding', src: '/portfolio/photos/foto1.jpg' },
    { id: 2, type: 'photo', title: 'Momen Pernikahan 2', category: 'Wedding', src: '/portfolio/photos/foto2.jpg' },
    { id: 3, type: 'photo', title: 'Momen Pernikahan 3', category: 'Wedding', src: '/portfolio/photos/foto3.jpg' },
    { id: 4, type: 'photo', title: 'Momen Pernikahan 4', category: 'Wedding', src: '/portfolio/photos/foto4.jpg' },

    // ===== VIDEO (4 file dari public/portfolio/videos/) =====
    { id: 5, type: 'video', title: 'Wedding Video 1', category: 'Wedding', src: '/portfolio/videos/video1.mp4', thumbnail: '/portfolio/photos/foto1.jpg' },
    { id: 6, type: 'video', title: 'Wedding Video 2', category: 'Wedding', src: '/portfolio/videos/video2.mp4', thumbnail: '/portfolio/photos/foto2.jpg' },
    { id: 7, type: 'video', title: 'Wedding Video 3', category: 'Wedding', src: '/portfolio/videos/video3.mp4', thumbnail: '/portfolio/photos/foto3.jpg' },
    { id: 8, type: 'video', title: 'Wedding Video 4', category: 'Wedding', src: '/portfolio/videos/video4.mp4', thumbnail: '/portfolio/photos/foto4.jpg' },
];

type FilterType = 'Semua' | 'Foto' | 'Video';

export default function PortofolioPage() {
    const [filter, setFilter] = useState<FilterType>('Semua');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const filtered = portfolioItems.filter(item => {
        if (filter === 'Semua') return true;
        if (filter === 'Foto') return item.type === 'photo';
        if (filter === 'Video') return item.type === 'video';
        return true;
    });

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prevItem = () => setLightboxIndex(prev => (prev !== null ? (prev - 1 + filtered.length) % filtered.length : 0));
    const nextItem = () => setLightboxIndex(prev => (prev !== null ? (prev + 1) % filtered.length : 0));

    const currentItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

    return (
        <div className="py-16 bg-gradient-to-br from-gray-50 to-rose-50 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Portofolio Kami
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Hasil karya nyata dari setiap momen pernikahan yang kami abadikan dengan penuh cinta dan dedikasi.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-3 mb-10">
                    {(['Semua', 'Foto', 'Video'] as FilterType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${filter === tab
                                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-rose-400 hover:text-rose-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Portfolio Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <FaHeart className="text-6xl text-rose-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Segera hadir! Portfolio sedang dipersiapkan.</p>
                        <p className="text-gray-400 text-sm mt-2">Ikuti kami di Instagram & TikTok @momentumomen untuk melihat karya terbaru.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {filtered.map((item, index) => {
                                const bgStyle = item.type === 'photo'
                                    ? { backgroundImage: `url(${item.src})` }
                                    : item.thumbnail
                                        ? { backgroundImage: `url(${item.thumbnail})` }
                                        : { backgroundColor: '#1f2937' };

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => openLightbox(index)}
                                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                                        style={{
                                            ...bgStyle,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }}
                                    >
                                        {/* Play button for videos */}
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform" style={{ opacity: 0.9 }}>
                                                    <FaPlay className="text-rose-600 text-2xl ml-1" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover overlay */}
                                        <div
                                            className="absolute inset-0 transition-all duration-300 flex flex-col items-center justify-end p-4"
                                            style={{ backgroundColor: 'transparent' }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 text-center">
                                                <p className="text-white font-bold text-lg drop-shadow-lg">{item.title}</p>
                                                <p className="text-rose-200 text-sm">{item.category}</p>
                                                <FaExpand className="text-white mx-auto mt-2" />
                                            </div>
                                        </div>

                                        {/* Video badge */}
                                        {item.type === 'video' && (
                                            <span className="absolute top-3 right-3 text-white text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                                                VIDEO
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* CTA */}
                <div className="max-w-4xl mx-auto text-center mt-20">
                    <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-12 text-white shadow-2xl">
                        <h3 className="text-3xl font-bold mb-4">Ingin Hasil Seperti Ini untuk Pernikahan Anda?</h3>
                        <p className="text-lg mb-8 opacity-90">Jangan ragu! Booking sekarang dan abadikan momen spesial Anda bersama momentumomen.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/pemesanan" className="bg-white text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                                Pesan Sekarang
                            </Link>
                            <Link href="/paket" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-rose-600 transition-all transform hover:scale-105">
                                Lihat Paket
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && currentItem && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white text-4xl hover:text-rose-400 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                    >
                        <FaTimes />
                    </button>

                    {/* Prev */}
                    {filtered.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevItem(); }}
                            className="absolute left-4 text-white text-4xl hover:text-rose-400 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
                        >
                            <FaChevronLeft />
                        </button>
                    )}

                    {/* Media */}
                    <div
                        className="max-w-5xl max-h-screen w-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {currentItem.type === 'photo' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={currentItem.src}
                                alt={currentItem.title}
                                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
                            />
                        ) : (
                            <div className="relative w-full flex items-center justify-center">
                                <video
                                    key={currentItem.src}
                                    src={currentItem.src}
                                    controls
                                    autoPlay
                                    muted
                                    playsInline
                                    className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        const msg = target.nextElementSibling as HTMLElement;
                                        if (msg) msg.style.display = 'block';
                                    }}
                                />
                                <div className="hidden bg-zinc-900 p-10 rounded-2xl text-center border border-zinc-800">
                                    <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
                                    <p className="text-white font-bold">Video tidak dapat diputar</p>
                                    <p className="text-zinc-500 text-sm mt-2">Format file mungkin tidak didukung atau file sudah dipindahkan.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next */}
                    {filtered.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextItem(); }}
                            className="absolute right-4 text-white text-4xl hover:text-rose-400 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
                        >
                            <FaChevronRight />
                        </button>
                    )}

                    {/* Caption */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                        <p className="font-bold text-lg">{currentItem.title}</p>
                        <p className="text-rose-300 text-sm">{currentItem.category} • {lightboxIndex + 1} / {filtered.length}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
