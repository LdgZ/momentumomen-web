import Link from 'next/link';
import { FaCamera, FaVideo, FaClock, FaHeart, FaStar, FaCheckCircle } from 'react-icons/fa';
import { PACKAGES, formatCurrency, formatWhatsAppLink } from '@/lib/config';

export default function Home() {
  const services = [
    {
      icon: <FaCamera className="text-5xl text-rose-600" />,
      title: 'Fotografi Profesional',
      description: 'Dokumentasi lengkap dengan kamera profesional dan hasil berkualitas tinggi'
    },
    {
      icon: <FaVideo className="text-5xl text-rose-600" />,
      title: 'Videografi Cinematic',
      description: 'Video cinematic dengan editing premium dan storytelling yang menarik'
    },
    {
      icon: <FaClock className="text-5xl text-rose-600" />,
      title: 'Delivery Cepat',
      description: 'Hasil foto & video dikirim via Google Drive dalam 14-30 hari'
    },
  ];

  const testimonials = [
    {
      name: 'Rina & Doni',
      text: 'Hasilnya luar biasa! Semua momen penting terabadikan dengan sempurna. Terima kasih momentumomen!',
      rating: 5
    },
    {
      name: 'Sarah & Ahmad',
      text: 'Profesional, ramah, dan hasil video cinematic-nya bikin kami terharu. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Abadikan Momen Spesial Pernikahan Anda
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Kami adalah wedding content creator profesional yang siap mengabadikan setiap momen berharga
              pernikahan Anda dengan hasil foto & video berkualitas tinggi yang akan Anda kenang selamanya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/pemesanan"
                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Pesan Sekarang
              </Link>
              <Link
                href="/portofolio"
                className="border-2 border-rose-600 text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-rose-50 transition-all duration-300"
              >
                Lihat Portofolio
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <FaHeart className="text-6xl text-rose-300" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <FaHeart className="text-6xl text-pink-300" />
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Layanan Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan layanan lengkap untuk dokumentasi pernikahan Anda dengan standar profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-rose-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-rose-100"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Paket Layanan
            </h2>
            <p className="text-lg text-gray-600">
              Pilih paket yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ${pkg.id === 'standard' ? 'ring-4 ring-rose-500 scale-105' : ''
                  }`}
              >
                {pkg.id === 'standard' && (
                  <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center py-2 font-semibold">
                    PALING POPULER
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-rose-600 mb-4">
                    {formatCurrency(pkg.price)}
                  </p>
                  <p className="text-gray-600 mb-6">{pkg.duration}</p>

                  <ul className="space-y-3 mb-8">
                    {pkg.deliverables.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <FaCheckCircle className="text-rose-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/pemesanan?package=${pkg.id}`}
                    className="block w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-full text-center font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Pilih Paket
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/paket"
              className="text-rose-600 font-semibold hover:text-rose-700 text-lg"
            >
              Lihat Detail Semua Paket →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Apa Kata Mereka
            </h2>
            <p className="text-lg text-gray-600">
              Testimoni dari klien yang puas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="text-gray-800 font-semibold">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Mengabadikan Momen Spesial Anda?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Hubungi kami sekarang untuk konsultasi gratis dan pesan paket yang sesuai dengan kebutuhan Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pemesanan"
              className="bg-white text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Pesan Sekarang
            </Link>
            <a
              href={formatWhatsAppLink('Halo momentumomen, saya ingin konsultasi tentang paket wedding content creator')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            >
              Chat via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
