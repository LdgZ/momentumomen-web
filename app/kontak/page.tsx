'use client';

import Link from 'next/link';
import { FaInstagram, FaTiktok, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { formatWhatsAppLink } from '@/lib/config';

export default function KontakPage() {
    const contactInfo = [
        {
            icon: <FaWhatsapp className="text-4xl" />,
            title: 'WhatsApp',
            value: '085607329021',
            link: formatWhatsAppLink('Halo momentumomen, saya ingin bertanya tentang layanan wedding content creator'),
            color: 'text-green-600'
        },
        {
            icon: <FaEnvelope className="text-4xl" />,
            title: 'Email',
            value: 'momentumomen@gmail.com',
            link: 'mailto:momentumomen@gmail.com',
            color: 'text-rose-600'
        },
        {
            icon: <FaInstagram className="text-4xl" />,
            title: 'Instagram',
            value: '@momentumomen',
            link: 'https://instagram.com/momentumomen',
            color: 'text-pink-600'
        },
        {
            icon: <FaTiktok className="text-4xl" />,
            title: 'TikTok',
            value: '@momentumomen',
            link: 'https://tiktok.com/@momentumomen',
            color: 'text-gray-800'
        },
    ];

    return (
        <div className="py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-white min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            Hubungi Kami
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Punya pertanyaan? Ingin konsultasi? Kami siap membantu Anda merencanakan dokumentasi pernikahan yang sempurna.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Informasi Kontak
                                </h2>

                                <div className="space-y-6">
                                    {contactInfo.map((item, index) => (
                                        <a
                                            key={index}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-rose-50 transition-all duration-300 border-2 border-transparent hover:border-rose-200"
                                        >
                                            <div className={`${item.color}`}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                                <p className="text-gray-600">{item.value}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                {/* Business Hours */}
                                <div className="mt-8 p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FaClock className="text-rose-600" />
                                        Jam Operasional
                                    </h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex justify-between">
                                            <span>Senin – Minggu</span>
                                            <span className="font-semibold text-rose-600">09:00 – 21:00 WIB</span>
                                        </li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-2">
                                        * Respon WhatsApp sesuai jam operasional
                                    </p>
                                </div>

                                {/* Location */}
                                <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-rose-50 rounded-xl">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-rose-600" />
                                        Lokasi
                                    </h3>
                                    <p className="text-gray-700 font-medium">
                                        Perum Kademangan Indah No.44
                                    </p>
                                    <p className="text-gray-700">
                                        Bondowoso, Jawa Timur
                                    </p>
                                    <a
                                        href="https://maps.google.com/?q=Perum+Kademangan+Indah+Bondowoso"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-3 text-rose-600 hover:text-rose-800 text-sm font-semibold underline"
                                    >
                                        Buka di Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact Form */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Kirim Pesan Cepat
                                </h2>

                                <form className="space-y-5">
                                    <div>
                                        <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                                            Nama Lengkap *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="Nama Anda"
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="contactEmail" className="block text-gray-700 font-semibold mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            placeholder="email@contoh.com"
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
                                            Subjek *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            placeholder="Pertanyaan tentang paket, harga, dll"
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                                            Pesan *
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            placeholder="Tulis pesan Anda di sini..."
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 outline-none transition-colors resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const name = (document.getElementById('name') as HTMLInputElement).value;
                                            const email = (document.getElementById('contactEmail') as HTMLInputElement).value;
                                            const subject = (document.getElementById('subject') as HTMLInputElement).value;
                                            const message = (document.getElementById('message') as HTMLTextAreaElement).value;

                                            if (!name || !email || !subject || !message) {
                                                alert('Mohon isi semua field!');
                                                return;
                                            }

                                            const whatsappMessage = `Halo momentumomen,\n\nNama: ${name}\nEmail: ${email}\nSubjek: ${subject}\n\nPesan:\n${message}`;
                                            window.open(formatWhatsAppLink(whatsappMessage), '_blank');
                                        }}
                                        className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-full text-lg font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <FaWhatsapp className="text-2xl" />
                                        Kirim via WhatsApp
                                    </button>

                                    <p className="text-sm text-gray-500 text-center">
                                        Atau langsung hubungi kami via WhatsApp untuk respon lebih cepat
                                    </p>
                                </form>
                            </div>

                            {/* Social Media CTA */}
                            <div className="mt-8 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 text-white text-center">
                                <h3 className="text-2xl font-bold mb-4">Ikuti Kami di Sosial Media</h3>
                                <p className="mb-6">
                                    Lihat portfolio terbaru dan inspirasi pernikahan di akun sosial media kami
                                </p>
                                <div className="flex justify-center gap-6">
                                    <a
                                        href="https://instagram.com/momentumomen"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white text-pink-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl hover:bg-gray-100 transition-all transform hover:scale-110"
                                    >
                                        <FaInstagram />
                                    </a>
                                    <a
                                        href="https://tiktok.com/@momentumomen"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white text-gray-800 w-14 h-14 rounded-full flex items-center justify-center text-2xl hover:bg-gray-100 transition-all transform hover:scale-110"
                                    >
                                        <FaTiktok />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Direct Booking CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Siap untuk Booking?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Jangan ragu untuk langsung melakukan pemesanan jika Anda sudah yakin dengan paket yang cocok
                            </p>
                            <Link
                                href="/pemesanan"
                                className="inline-block bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                Pesan Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
