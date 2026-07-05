const SHEET_NAME = 'Gallery';
const CONTACT_EMAIL = 'contact@bmnphotos.com';

function doGet(e) {
  const category = e && e.parameter && e.parameter.category
    ? String(e.parameter.category).trim().toLowerCase()
    : '';

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOutput({ images: [], error: `Missing sheet named ${SHEET_NAME}` });
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return jsonOutput({ images: [] });

  const headers = values[0].map(toKey);
  const images = values.slice(1)
    .map((row) => normalizeGalleryRow(rowToObject(headers, row)))
    .filter((image) => isVisible(image.visible))
    .filter((image) => !category || String(image.category || '').trim().toLowerCase() === category)
    .sort((a, b) => Number(a.sort_order || 999999) - Number(b.sort_order || 999999));

  return jsonOutput({ images });
}

function doPost(e) {
  try {
    const data = parsePostData(e);

    // Basic honeypot spam check. Real visitors will never fill this field.
    if (String(data.website || '').trim()) {
      return jsonOutput({ ok: true });
    }

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const sessionType = String(data.session_type || '').trim();
    const message = String(data.message || '').trim();

    if (!name || !email) {
      return jsonOutput({ ok: false, error: 'Name and email are required.' });
    }

    const subject = `BMN Photos Inquiry from ${name}`;
    const body = [
      'New BMN Photos inquiry',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Session Type: ${sessionType}`,
      '',
      'Message:',
      message || '(No message provided)',
      '',
      `Submitted: ${new Date().toLocaleString()}`
    ].join('\n');

    MailApp.sendEmail({
      to: CONTACT_EMAIL,
      subject,
      body,
      replyTo: email,
      name: 'BMN Photos Website'
    });

    return jsonOutput({ ok: true });
  } catch (error) {
    return jsonOutput({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parsePostData(e) {
  if (!e || !e.postData) return {};

  const type = String(e.postData.type || '').toLowerCase();
  const contents = e.postData.contents || '';

  if (type.indexOf('application/json') !== -1 && contents) {
    return JSON.parse(contents);
  }

  // Works with application/x-www-form-urlencoded submissions from URLSearchParams.
  return e.parameter || {};
}

function normalizeGalleryRow(image) {
  const driveId = image.drive_file_id || extractDriveFileId(image.drive_url || image.google_drive_url || image.image_url || image.src);

  if (driveId && !image.image_url && !image.src) {
    image.image_url = driveImageUrl(driveId, 2000);
  }

  if (driveId && !image.thumbnail_url && !image.thumbnail) {
    image.thumbnail_url = driveImageUrl(driveId, 1200);
  }

  image.drive_file_id = driveId || image.drive_file_id || '';
  return image;
}

function driveImageUrl(fileId, width) {
  // Requires the Drive file sharing permission to be "Anyone with the link can view".
  // The thumbnail endpoint is generally the most usable Drive URL format for <img> tags.
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${width || 1600}`;
}

function extractDriveFileId(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  // Already a bare Drive file ID.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(text) && !text.includes('/')) return text;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/thumbnail\?id=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1];
  }

  return '';
}

function rowToObject(headers, row) {
  const object = {};
  headers.forEach((header, index) => {
    if (header) object[header] = row[index];
  });
  return object;
}

function toKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function isVisible(value) {
  if (value === false) return false;
  const normalized = String(value || '').trim().toLowerCase();
  return normalized !== 'false' && normalized !== 'no' && normalized !== '0' && normalized !== 'hidden';
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
