/** 
 * MOMENTUMOMEN - Smart Google Apps Script v2
 * Sistem database cerdas berbasis nama kolom.
 */

const SHEET_NAME = 'Bookings';
const HEADERS = [
  'ID', 'Full Name', 'Email', 'WhatsApp', 'Wedding Date', 'Package ID', 
  'Package Name', 'Package Price', 'Notes', 'Status', 'Payment Status', 
  'Payment Method', 'Payment Proof', 'Drive Link', 'Paid At', 'Created At'
];

// 1. Fungsi Inisialisasi / Reset (Jalankan ini sekali di editor Apps Script)
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (sheet) {
    sheet.clear(); // Bersihkan semua data
  } else {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Set Header dan Format
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
       .setBackground('#4f46e5').setFontColor('white').setFontWeight('bold');
  sheet.setFrozenRows(1);
  Logger.log('Database berhasil di-reset dan di-inisialisasi.');
}

// Helper: Mencari index kolom berdasarkan nama (Case-insensitive & Trim)
function getHeaderMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    if (h) map[String(h).toUpperCase().trim()] = i;
  });
  return map;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'createBooking') return createBooking(data.booking);
    if (action === 'updateStatus') return updateStatus(data.bookingId, data.status, data.paymentStatus);
    if (action === 'addDriveLink') return addDriveLink(data.bookingId, data.driveLink);

    throw new Error('Action not found');
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getBookings') return getBookings();
  return ContentService.createTextOutput('Service Active').setMimeType(ContentService.MimeType.TEXT);
}

// --- CORE FUNCTIONS ---

function createBooking(booking) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const map = getHeaderMap(sheet);
  const row = new Array(HEADERS.length).fill('');

  row[map['ID']] = booking.orderId;
  row[map['FULL NAME']] = booking.fullName;
  row[map['EMAIL']] = booking.email;
  row[map['WHATSAPP']] = String(booking.whatsapp); // Pastikan string
  row[map['WEDDING DATE']] = booking.weddingDate;
  row[map['PACKAGE ID']] = booking.selectedPackage;
  row[map['PACKAGE NAME']] = booking.packageName;
  row[map['PACKAGE PRICE']] = booking.packagePrice;
  row[map['NOTES']] = booking.notes || '';
  row[map['STATUS']] = 'pending';
  row[map['PAYMENT STATUS']] = 'pending';
  row[map['CREATED AT']] = new Date().toISOString();

  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

function getBookings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const map = getHeaderMap(sheet);
  const bookings = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    bookings.push({
      id: row[map['ID']],
      fullName: row[map['FULL NAME']],
      email: row[map['EMAIL']],
      whatsapp: String(row[map['WHATSAPP']]),
      weddingDate: row[map['WEDDING DATE']],
      packageId: row[map['PACKAGE ID']],
      packageName: row[map['PACKAGE NAME']],
      packagePrice: row[map['PACKAGE PRICE']],
      notes: row[map['NOTES']],
      status: row[map['STATUS']],
      paymentStatus: row[map['PAYMENT STATUS']],
      paymentMethod: row[map['PAYMENT METHOD']],
      paymentProof: row[map['PAYMENT PROOF']],
      driveLink: row[map['DRIVE LINK']],
      paidAt: row[map['PAID AT']],
      createdAt: row[map['CREATED AT']]
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, bookings: bookings }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function updateStatus(bookingId, status, paymentStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const map = getHeaderMap(sheet);

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][map['ID']]).trim();
    if (rowId === String(bookingId).trim()) {
      if (status) sheet.getRange(i + 1, map['STATUS'] + 1).setValue(status);
      if (paymentStatus) {
        sheet.getRange(i + 1, map['PAYMENT STATUS'] + 1).setValue(paymentStatus);
        if (paymentStatus === 'paid' || paymentStatus === 'Lunas') {
          sheet.getRange(i + 1, map['PAID AT'] + 1).setValue(new Date().toISOString());
        }
      }
      break;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

function addDriveLink(bookingId, driveLink) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const map = getHeaderMap(sheet);

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][map['ID']]).trim();
    if (rowId === String(bookingId).trim()) {
      sheet.getRange(i + 1, map['DRIVE LINK'] + 1).setValue(driveLink);
      break;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

function cleanupExpiredBookings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const map = getHeaderMap(sheet);
  const now = new Date();
  const LIMIT = 2 * 60 * 60 * 1000; // 2 Jam

  for (let i = data.length - 1; i >= 1; i--) {
    const pStatus = String(data[i][map['PAYMENT STATUS']]).toLowerCase();
    const createdAtStr = data[i][map['CREATED AT']];
    
    if (pStatus === 'pending' && createdAtStr) {
      const createdAt = new Date(createdAtStr);
      if (!isNaN(createdAt.getTime()) && (now - createdAt > LIMIT)) {
        sheet.deleteRow(i + 1);
      }
    }
  }
}
