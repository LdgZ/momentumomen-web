'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { generateCalendarDates, getMonthName } from '@/lib/calendar';
import { getBookedDates } from '@/lib/googleSheets';
import { format } from 'date-fns';

export default function KalenderPage() {
    const currentDate = new Date();
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [calendarDates, setCalendarDates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookedDates();
    }, []);

    useEffect(() => {
        const dates = generateCalendarDates(currentYear, currentMonth, bookedDates);
        setCalendarDates(dates);
    }, [currentMonth, currentYear, bookedDates]);

    const fetchBookedDates = async () => {
        setIsLoading(true);
        try {
            const dates = await getBookedDates();
            setBookedDates(dates);
        } catch (error) {
            console.error('Error fetching booked dates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Get first day of month to align calendar
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const emptyDays = Array(firstDayOfMonth).fill(null);

    return (
        <div className="py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-white min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            Kalender Ketersediaan
                        </h1>
                        <p className="text-lg text-gray-600">
                            Cek jadwal ketersediaan kami untuk tanggal pernikahan Anda
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Keterangan:</h3>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-500 rounded-md"></div>
                                <span className="text-gray-700"><FaCheckCircle className="inline text-green-600 mr-1" /> Tersedia</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-red-500 rounded-md"></div>
                                <span className="text-gray-700"><FaTimesCircle className="inline text-red-600 mr-1" /> Sudah Dibooking</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-300 rounded-md"></div>
                                <span className="text-gray-700">Tanggal Lewat</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={goToPreviousMonth}
                                className="p-3 rounded-full hover:bg-rose-50 transition-colors text-rose-600"
                                aria-label="Previous month"
                            >
                                <FaChevronLeft className="text-2xl" />
                            </button>

                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                                {getMonthName(currentMonth)} {currentYear}
                            </h2>

                            <button
                                onClick={goToNextMonth}
                                className="p-3 rounded-full hover:bg-rose-50 transition-colors text-rose-600"
                                aria-label="Next month"
                            >
                                <FaChevronRight className="text-2xl" />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                                <p className="text-gray-600 mt-4">Memuat kalender...</p>
                            </div>
                        ) : (
                            <>
                                {/* Week Days */}
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {weekDays.map((day) => (
                                        <div key={day} className="text-center font-bold text-gray-600 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Empty cells for days before month starts */}
                                    {emptyDays.map((_, index) => (
                                        <div key={`empty-${index}`} className="aspect-square"></div>
                                    ))}

                                    {/* Calendar dates */}
                                    {calendarDates.map((dateObj, index) => {
                                        const dateNumber = format(dateObj.date, 'd');
                                        const isToday = format(dateObj.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                                        let bgColor = 'bg-gray-300 text-gray-500';
                                        let cursor = 'cursor-not-allowed';

                                        if (dateObj.isBooked) {
                                            bgColor = 'bg-red-500 text-white';
                                            cursor = 'cursor-not-allowed';
                                        } else if (dateObj.isAvailable) {
                                            bgColor = 'bg-green-500 text-white hover:bg-green-600';
                                            cursor = 'cursor-pointer';
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className={`aspect-square flex items-center justify-center rounded-lg ${bgColor} ${cursor} transition-all duration-200 transform hover:scale-105 font-semibold ${isToday ? 'ring-4 ring-rose-500' : ''
                                                    }`}
                                                title={
                                                    dateObj.isBooked
                                                        ? 'Sudah Dibooking'
                                                        : dateObj.isAvailable
                                                            ? 'Tersedia'
                                                            : 'Tanggal Lewat'
                                                }
                                            >
                                                {dateNumber}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Info Text */}
                        <div className="mt-8 text-center text-gray-600 bg-rose-50 p-4 rounded-lg">
                            <p className="text-sm">
                                Tanggal yang ditandai <span className="font-semibold text-green-600">hijau</span> tersedia untuk booking.
                                Silakan pilih tanggal yang sesuai saat mengisi formulir pemesanan.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <a
                            href="/pemesanan"
                            className="inline-block bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Lanjut ke Pemesanan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
