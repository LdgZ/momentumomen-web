// Calendar utility functions

import { CalendarDate } from './types';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    format,
    isBefore,
    startOfDay
} from 'date-fns';
import { id } from 'date-fns/locale';

export const generateCalendarDates = (
    year: number,
    month: number,
    bookedDates: string[]
): CalendarDate[] => {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(new Date(year, month));

    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    const today = startOfDay(new Date());

    return days.map(date => {
        const dateString = format(date, 'yyyy-MM-dd');
        const isBooked = bookedDates.includes(dateString);
        const isPast = isBefore(date, today);

        return {
            date,
            isBooked,
            isAvailable: !isBooked && !isPast
        };
    });
};

export const getMonthName = (month: number): string => {
    const date = new Date(2024, month, 1);
    return format(date, 'MMMM', { locale: id });
};

export const checkDateAvailability = (
    dateString: string,
    bookedDates: string[]
): boolean => {
    const date = new Date(dateString);
    const today = startOfDay(new Date());

    if (isBefore(date, today)) {
        return false;
    }

    return !bookedDates.includes(dateString);
};

export const formatDateIndonesian = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: id });
};
