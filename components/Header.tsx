'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaBars, FaTimes, FaCamera } from 'react-icons/fa';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Beranda', href: '/' },
        { name: 'Paket', href: '/paket' },
        { name: 'Portofolio', href: '/portofolio' },
        { name: 'Kontak', href: '/kontak' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-rose-600">
                        <FaCamera className="text-3xl" />
                        <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                            momentumomen
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex items-center gap-8">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="/pemesanan"
                                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
                            >
                                Pesan Sekarang
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-2xl text-gray-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
                        <ul className="flex flex-col gap-4">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="block text-gray-700 hover:text-rose-600 transition-colors font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/pemesanan"
                                    className="block bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-2 rounded-full text-center hover:shadow-lg transition-all duration-300 font-semibold"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pesan Sekarang
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
