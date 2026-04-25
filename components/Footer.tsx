import Link from 'next/link';
import { FaInstagram, FaTiktok, FaWhatsapp, FaEnvelope, FaHeart } from 'react-icons/fa';
import { WHATSAPP_NUMBER, formatWhatsAppLink } from '@/lib/config';

const Footer = () => {
    const quickLinks = [
        { name: 'Beranda', href: '/' },
        { name: 'Paket Layanan', href: '/paket' },
        { name: 'Portofolio', href: '/portofolio' },
        { name: 'Pemesanan', href: '/pemesanan' },
        { name: 'Dashboard Pelanggan', href: '/dashboard' },
        { name: 'Admin Area', href: '/admin' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const socialMedia = [
        {
            name: 'Instagram',
            icon: <FaInstagram />,
            href: 'https://instagram.com/momentumomen',
            color: 'hover:text-pink-600'
        },
        {
            name: 'TikTok',
            icon: <FaTiktok />,
            href: 'https://tiktok.com/@momentumomen',
            color: 'hover:text-black'
        },
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp />,
            href: formatWhatsAppLink('Halo momentumomen, saya ingin bertanya tentang layanan wedding content creator'),
            color: 'hover:text-green-600'
        },
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-rose-400">momentumomen</h3>
                        <p className="text-gray-300 mb-4">
                            Wedding Content Creator profesional yang siap mengabadikan momen spesial pernikahan Anda dengan hasil berkualitas tinggi.
                        </p>
                        <div className="flex items-center gap-2 text-gray-300">
                            <FaEnvelope />
                            <a href="mailto:momentumomen@gmail.com" className="hover:text-rose-400 transition-colors">
                                momentumomen@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 mt-2">
                            <FaWhatsapp className="text-green-400" />
                            <a href={formatWhatsAppLink('Halo momentumomen')} target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">
                                {WHATSAPP_NUMBER}
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-rose-400">Menu Cepat</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-300 hover:text-rose-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-rose-400">Ikuti Kami</h3>
                        <p className="text-gray-300 mb-2">Instagram: @momentumomen</p>
                        <p className="text-gray-300 mb-2">TikTok: @momentumomen</p>
                        <p className="text-gray-300 mb-4">Jam Operasional: 09:00 – 21:00 WIB</p>
                        <div className="flex gap-4">
                            {socialMedia.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-3xl text-gray-300 transition-all duration-300 transform hover:scale-110 ${social.color}`}
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
                    <p className="flex items-center justify-center gap-2">
                        © {new Date().getFullYear()} momentumomen. Made with <FaHeart className="text-rose-500" /> for your special day
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
