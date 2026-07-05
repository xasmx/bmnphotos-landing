# BMN Photos - Google Drive + Google Sheets Gallery

This version keeps the BMN Photos website on GitHub Pages, lets the photographer manage portfolio images through Google Drive and Google Sheets, and uses Google Apps Script to send contact-form emails.

## What changed

- The website still lives in GitHub Pages.
- Each gallery page loads its photos dynamically from a Google Apps Script JSON endpoint.
- The photographer can upload images to Google Drive and manage the gallery rows in Google Sheets.
- The sheet can accept either a full Google Drive share link or a bare Google Drive file ID.
- The contact form submits to Apps Script and sends an email to contact@bmnphotos.com. It does not save inquiries to the Sheet.

## Files included

```text
index.html
portfolio-events.html
portfolio-families.html
portfolio-portraits.html
portfolio-sports.html
portfolio-celebrations.html
portfolio-other.html
css/styles.css
js/site.js
js/gallery-config.js
js/contact-config.js
js/gallery.js
google-apps-script/Code.gs
google-apps-script/sample-gallery.csv
README.md
```

## Google Sheet setup

Create a Google Sheet with a tab named exactly:

```text
Gallery
```

Use these columns:

```text
category
sort_order
drive_url
drive_file_id
image_url
thumbnail_url
title
caption
alt_text
visible
size
```

You can import `google-apps-script/sample-gallery.csv` as a starting point.

## Recommended workflow for the photographer

1. Upload web-ready images to Google Drive.
2. Right-click each image in Drive and choose **Share**.
3. Set access to **Anyone with the link** and **Viewer**.
4. Copy the Drive share link.
5. Paste it into the `drive_url` column in the Google Sheet.
6. Fill in category, title, caption, alt text, sort order, visible, and optional size.
7. The website updates from the Sheet without a GitHub commit.

## Category values

Use one of these category values:

```text
events
families
portraits
sports
celebrations
other
```

Each portfolio page requests only its own category. Use `other` for examples that do not fit events, families, portraits, sports, or celebrations.

## Column details

### `category`
The portfolio page where the image should appear.

### `sort_order`
A number used for ordering. Use gaps like 10, 20, 30 so reordering later is easy.

### `drive_url`
Paste the full Google Drive share URL here, for example:

```text
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

### `drive_file_id`
Optional alternative to `drive_url`. You can paste just the Drive file ID here.

### `image_url`
Optional. Leave blank when using Google Drive. This is kept as a fallback if you later decide to use Cloudinary or another image host.

### `thumbnail_url`
Optional. Leave blank when using Google Drive. The script will generate a Drive thumbnail URL automatically.

### `title`
Short display title shown on the gallery card.

### `caption`
Optional caption shown under the title.

### `alt_text`
Important for accessibility and SEO. Describe the image plainly.

### `visible`
Use `TRUE` to show an image. Use `FALSE` to hide it without deleting the row.

### `size`
Optional layout hint:

```text
wide
tall
```

Leave blank for normal gallery cards.

## Apps Script setup

1. Open the Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the default code with the contents of `google-apps-script/Code.gs`.
4. Save the project.
5. Click **Deploy → New deployment**.
6. Choose **Web app**.
7. Set **Execute as** to **Me**.
8. Set **Who has access** to **Anyone**.
9. Deploy and copy the Web App URL.

## Website setup

Open:

```text
js/gallery-config.js
```

Replace:

```js
window.BMN_GALLERY_DATA_URL = 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

with your deployed Apps Script Web App URL.

## Important Google Drive notes

Google Drive can work well as a starter option, but it is not a dedicated image CDN. For best results:

- Upload resized web images instead of huge camera originals.
- Keep originals backed up separately.
- Make every displayed file **Anyone with the link can view**.
- If images load slowly or inconsistently later, consider moving the final public gallery images to Cloudinary while keeping Google Sheets as the gallery manager.

A good starting size for website gallery images is usually around 1600-2400px wide.


## Contact form setup

The included `google-apps-script/Code.gs` is based on the existing deployed gallery script and adds only a `doPost(e)` handler for contact-form submissions.

The contact form does **not** create an Inquiries tab and does **not** save form submissions to the spreadsheet. It only sends an email.

To enable the contact form:

1. Open your existing Apps Script project for the gallery.
2. Keep the existing `doGet(e)` gallery code.
3. Add the `CONTACT_EMAIL`, `doPost(e)`, and `parsePostData(e)` sections from `google-apps-script/Code.gs`, or replace the whole file with the included version if it still matches your deployed script.
4. Save the Apps Script project.
5. Deploy a new Web App version.
6. Copy the Web App URL.
7. Open `js/contact-config.js` and set:

```js
window.BMN_CONTACT_FORM_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

You may use the same Web App URL for both `js/gallery-config.js` and `js/contact-config.js` when the same Apps Script project contains both `doGet(e)` and `doPost(e)`.


## Contact form CORS note

The contact form submits to Google Apps Script with `fetch(..., { mode: 'no-cors' })`.
This is intentional: Apps Script Web Apps can receive the POST and send the email, but Chrome may block frontend JavaScript from reading the JSON response because Apps Script does not provide normal CORS response headers. Without `no-cors`, the form may show the fallback error message even when the Apps Script endpoint is reachable.

Because the response is opaque in `no-cors` mode, the site treats a completed network request as submitted. To debug actual Apps Script errors, use Apps Script → Executions and test the Web App deployment directly.
