'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isBefore, startOfDay, getDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

export default function KalenderPage() {
    const router = useRouter();
    const today = startOfDay(new Date());
    
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    
    const [slots, setSlots] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() + i);
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

    const fetchSlots = async (year: number, month: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/calendar/slots?year=${year}&month=${month}`);
            const data = await res.json();
            if (data.success) {
                setSlots(data.slots || {});
            } else {
                setSlots({});
            }
        } catch (error) {
            console.error('Error fetching calendar slots:', error);
            setSlots({});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleDateClick = (dateString: string, availableSlots: number, isPast: boolean) => {
        if (isPast || availableSlots === 0) return;
        router.push(`/pemesanan?package=&date=${dateString}`);
    };

    // Generate Calendar Grid Setup
    const firstDay = startOfMonth(new Date(currentYear, currentMonth - 1));
    const lastDay = endOfMonth(new Date(currentYear, currentMonth - 1));
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    // Day of week (0 = Sunday, 1 = Monday ...)
    const startingDayIndex = getDay(firstDay); 
    const emptyDays = Array(startingDayIndex).fill(null);
    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4 text-indigo-600">
                            <FaCalendarAlt className="text-3xl" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            Jadwal Ketersediaan
                        </h1>
                        <p className="text-lg text-gray-600">
                            Cek tanggal kosong dan booking slot untuk hari bahagia Anda. Maksimal 2 event per hari.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        {/* Sidebar: Legend & Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            
                            {/* Navigasi Dropdown */}
                            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-widest border-b pb-2">Pilih Waktu</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Bulan</label>
                                        <select 
                                            value={currentMonth}
                                            onChange={(e) => setCurrentMonth(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                        >
                                            {monthOptions.map(m => (
                                                <option key={m} value={m}>
                                                    {format(new Date(2024, m - 1, 1), 'MMMM', { locale: id })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Tahun</label>
                                        <select 
                                            value={currentYear}
                                            onChange={(e) => setCurrentYear(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                        >
                                            {yearOptions.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 sticky top-24">
                                <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-widest border-b pb-2">Keterangan Status</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-200">
                                            <FaCheckCircle className="text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Tersedia (2 Slot)</p>
                                            <p className="text-xs text-gray-500">Tanggal masih kosong</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
                                            <FaExclamationCircle className="text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Hampir Penuh (1 Slot)</p>
                                            <p className="text-xs text-gray-500">Sisa 1 kuota lagi</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-200">
                                            <FaTimesCircle className="text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Penuh (0 Slot)</p>
                                            <p className="text-xs text-gray-500">Tidak bisa dibooking</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Calendar View */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 min-h-[500px]">
                                
                                {/* Calendar Header Controls */}
                                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <FaChevronLeft />
                                    </button>

                                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                                        {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: id })}
                                    </h2>

                                    <button
                                        onClick={handleNextMonth}
                                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>

                                {/* Calendar Grid Header */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {weekDays.map((day, idx) => (
                                        <div key={day} className={`text-center font-bold text-sm py-2 rounded-lg ${idx === 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days Grid */}
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                        <p className="text-indigo-600 font-medium animate-pulse">Menyelaraskan jadwal...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                                        
                                        {emptyDays.map((_, index) => (
                                            <div key={`empty-${index}`} className="aspect-square bg-gray-50/50 rounded-2xl border border-dashed border-gray-200"></div>
                                        ))}

                                        {days.map((date, index) => {
                                            const dateString = format(date, 'yyyy-MM-dd');
                                            const dateNumber = format(date, 'd');
                                            const isPast = isBefore(date, today);
                                            
                                            // Maksimal slot perhari = 2.
                                            // Logic api: mnghasilkan number of booked slots.
                                            const bookedCount = slots[dateString] || 0;
                                            const availableSlots = Math.max(0, 2 - bookedCount);
                                            
                                            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                                            // Determine styles
                                            let bgClass = '';
                                            let cursorClass = isPast ? 'cursor-not-allowed opacity-50' : 'cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-xl transition-all duration-300';
                                            
                                            if (isPast) {
                                                bgClass = 'bg-gray-100 text-gray-400 border border-gray-200';
                                            } else if (availableSlots === 0) {
                                                bgClass = 'bg-red-50 border-red-200 text-red-600 line-through decoration-red-300 decoration-2 grayscale-[50%]';
                                                cursorClass = 'cursor-not-allowed opacity-75';
                                            } else if (availableSlots === 1) {
                                                bgClass = 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-amber-700';
                                            } else {
                                                bgClass = 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-700';
                                            }

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => handleDateClick(dateString, availableSlots, isPast)}
                                                    className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl border ${bgClass} ${cursorClass} ${isToday ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}`}
                                                >
                                                    <span className="text-xl sm:text-2xl font-black">{dateNumber}</span>
                                                    
                                                    {!isPast && availableSlots > 0 && (
                                                        <span className="absolute bottom-1 sm:bottom-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur px-2 py-0.5 rounded-full">
                                                            Sisa {availableSlots}
                                                        </span>
                                                    )}
                                                    {!isPast && availableSlots === 0 && (
                                                        <span className="absolute bottom-1 sm:bottom-2 text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest">
                                                            FULL
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                    
                </div>
            </div>
        </div>
    );
}
