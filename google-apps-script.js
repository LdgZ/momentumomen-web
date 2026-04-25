/**
 * Google Apps Script untuk Elora Wedding
 * 
 * CARA SETUP:
 * 1. Buka Google Sheets baru
 * 2. Buat sheet dengan nama "Bookings" 
 * 3. Tambahkan header di row pertama:
 *    ID | Full Name | Email | WhatsApp | Wedding Date | Package ID | Package Name | Package Price | Notes | Status | Payment Status | Payment Method | Payment Proof | Drive Link | Paid At | Created At
 * 4. Buka Extensions > Apps Script
 * 5. Hapus kode default, paste kode ini
 * 6. Deploy > New deployment > Select type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Deploy dan copy URL Web App
 * 10. Paste URL tersebut ke file .env.local sebagai NEXT_PUBLIC_GOOGLE_SCRIPT_URL
 */

// Fungsi utama untuk handle HTTP requests
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        switch (action) {
            case 'addBooking':
                return addBooking(data.data);
            case 'updateStatus':
                return updateBookingStatus(data.bookingId, data.status, data.paymentStatus);
            case 'addDriveLink':
                return addDriveLink(data.bookingId, data.driveLink);
            default:
                return ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    message: 'Unknown action'
                })).setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle GET requests
function doGet(e) {
    try {
        const action = e.parameter.action;

        switch (action) {
            case 'getBookings':
                return getBookings();
            case 'getBookedDates':
                return getBookedDates();
            case 'getSlots':
                return getSlots(e.parameter.year, e.parameter.month);
            default:
                return ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    message: 'Unknown action'
                })).setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Add new booking
function addBooking(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    const bookingId = data.orderId || ('EW' + new Date().getTime());

    const row = [
        bookingId,
        data.fullName,
        data.email,
        data.whatsapp,
        data.weddingDate,
        data.selectedPackage,
        data.packageName || getPackageName(data.selectedPackage),
        data.packagePrice || getPackagePrice(data.selectedPackage),
        data.notes || '',
        data.status || 'pending',
        data.paymentStatus || 'pending',
        data.paymentMethod || 'qris',
        '', // paymentProof
        '', // driveLink
        '', // paidAt
        data.timestamp || new Date().toISOString()
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking berhasil ditambahkan',
        bookingId: bookingId
    })).setMimeType(ContentService.MimeType.JSON);
}

// Get all bookings
function getBookings() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();

    // Skip header row
    const bookings = data.slice(1).map(row => ({
        id: row[0],
        fullName: row[1],
        email: row[2],
        whatsapp: row[3],
        weddingDate: row[4],
        packageId: row[5],
        packageName: row[6],
        packagePrice: row[7],
        notes: row[8],
        status: row[9],
        paymentStatus: row[10],
        paymentMethod: row[11],
        paymentProof: row[12],
        driveLink: row[13],
        paidAt: row[14],
        createdAt: row[15]
    }));

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        bookings: bookings
    })).setMimeType(ContentService.MimeType.JSON);
}

// Get booked dates
function getBookedDates() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();

    // Get wedding dates where status is confirmed or completed
    const dates = data.slice(1)
        .filter(row => row[9] === 'confirmed' || row[9] === 'completed')
        .map(row => row[4]); // wedding date column

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        dates: dates
    })).setMimeType(ContentService.MimeType.JSON);
}

// Get slots count per day for a specific month
function getSlots(year, month) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();
    const slots = {};

    // Skip header row
    data.slice(1).forEach(row => {
        const orderStatus = row[9];
        const paymentStatus = row[10];
        
        // Only count active bookings
        if (orderStatus !== 'cancelled' && paymentStatus !== 'expired') {
            const weddingDateValue = row[4];
            if (weddingDateValue instanceof Date) {
                const dateStr = Utilities.formatDate(weddingDateValue, "GMT+7", "yyyy-MM-dd");
                const [y, m, d] = dateStr.split('-');
                if (parseInt(y) == year && parseInt(m) == month) {
                    slots[dateStr] = (slots[dateStr] || 0) + 1;
                }
            } else if (typeof weddingDateValue === 'string' && weddingDateValue.includes('-')) {
                const dateStr = weddingDateValue.split('T')[0];
                const [y, m, d] = dateStr.split('-');
                if (parseInt(y) == year && parseInt(m) == month) {
                    slots[dateStr] = (slots[dateStr] || 0) + 1;
                }
            }
        }
    });

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        slots: slots
    })).setMimeType(ContentService.MimeType.JSON);
}

// Update booking status
function updateBookingStatus(bookingId, status, paymentStatus) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === bookingId) {
            if (status) {
                sheet.getRange(i + 1, 10).setValue(status); // status column
            }
            if (paymentStatus) {
                sheet.getRange(i + 1, 11).setValue(paymentStatus); // payment status column
                if (paymentStatus === 'paid') {
                    sheet.getRange(i + 1, 15).setValue(new Date().toISOString()); // paidAt
                }
            }
            break;
        }
    }

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Status updated'
    })).setMimeType(ContentService.MimeType.JSON);
}

// Add Google Drive link
function addDriveLink(bookingId, driveLink) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === bookingId) {
            sheet.getRange(i + 1, 14).setValue(driveLink); // drive link column
            break;
        }
    }

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Drive link added'
    })).setMimeType(ContentService.MimeType.JSON);
}

// Helper: Get package name from ID
function getPackageName(packageId) {
    const packages = {
        'basic': 'Basic Package',
        'standard': 'Standard Package',
        'premium': 'Premium Package'
    };
    return packages[packageId] || packageId;
}

// Helper: Get package price from ID
function getPackagePrice(packageId) {
    const prices = {
        'basic': 1500000,
        'standard': 3000000,
        'premium': 5500000
    };
    return prices[packageId] || 0;
}
