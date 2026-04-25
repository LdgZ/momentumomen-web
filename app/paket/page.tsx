import Link from 'next/link';
import { FaCheckCircle, FaClock, FaCamera, FaVideo, FaCloud } from 'react-icons/fa';
import { PACKAGES, formatCurrency } from '@/lib/config';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Paket Layanan — momentumomen',
    description: 'Pilih paket wedding content creator yang sesuai dengan kebutuhan Anda. Mulai dari paket basic hingga premium dengan drone coverage.',
};

export default function PaketPage() {
    return (
        <div className="py-16 bg-gradient-to-br from-gray-50 to-rose-50 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Paket Layanan Kami
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Pilih paket yang sesuai dengan kebutuhan dan budget pernikahan Anda.
                        Semua paket sudah termasuk hasil professional dan garansi kepuasan.
                    </p>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
                    {PACKAGES.map((pkg, index) => (
                        <div
                            key={pkg.id}
                            className={`bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 ${pkg.id === 'standard' ? 'ring-4 ring-rose-500 lg:scale-110 lg:z-10' : ''
                                }`}
                        >
                            {/* Popular Badge */}
                            {pkg.id === 'standard' && (
                                <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center py-3 font-bold text-lg">
                                    ⭐ PALING POPULER
                                </div>
                            )}

                            {/* Package Content */}
                            <div className="p-8">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                        {pkg.name}
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                                        <FaClock className="text-rose-600" />
                                        <span>{pkg.duration}</span>
                                    </div>
                                    <div className="text-4xl font-bold text-rose-600 mb-2">
                                        {formatCurrency(pkg.price)}
                                    </div>
                                    <p className="text-sm text-gray-500">Per Event</p>
                                </div>

                                {/* Deliverables */}
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FaCamera className="text-rose-600" />
                                        Hasil Yang Anda Dapatkan:
                                    </h3>
                                    <ul className="space-y-2">
                                        {pkg.deliverables.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Features */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FaVideo className="text-rose-600" />
                                        Fitur Layanan:
                                    </h3>
                                    <ul className="space-y-2">
                                        {pkg.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <FaCheckCircle className="text-rose-600 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href={`/pemesanan?package=${pkg.id}`}
                                    className={`block w-full py-4 rounded-full text-center font-bold text-lg transition-all duration-300 transform hover:scale-105 ${pkg.id === 'standard'
                                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gray-100 text-rose-600 hover:bg-rose-50 border-2 border-rose-600'
                                        }`}
                                >
                                    Pilih {pkg.name}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Yang Termasuk Dalam Semua Paket
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-600 text-xl mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Fotografer & Videografer Profesional</h4>
                                <p className="text-gray-600 text-sm">Tim berpengalaman dengan peralatan profesional</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-600 text-xl mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Editing Premium</h4>
                                <p className="text-gray-600 text-sm">Color grading dan retouching berkualitas tinggi</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaCloud className="text-green-600 text-xl mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Delivery via Google Drive</h4>
                                <p className="text-gray-600 text-sm">File original resolution & mudah diakses</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-600 text-xl mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Revisi & Support</h4>
                                <p className="text-gray-600 text-sm">Konsultasi pre-event & minor revision gratis</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ or Custom Package */}
                <div className="max-w-4xl mx-auto mt-12 text-center">
                    <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-4">
                            Butuh Paket Custom?
                        </h3>
                        <p className="mb-6 text-lg">
                            Setiap pernikahan itu unik. Hubungi kami untuk paket yang disesuaikan dengan kebutuhan spesifik Anda.
                        </p>
                        <Link
                            href="/kontak"
                            className="inline-block bg-white text-rose-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                        >
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
