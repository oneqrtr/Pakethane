# Pakethane PDF API

Next.js App Router API that converts HTML contract templates to A4 PDF using Playwright (Chromium).

## Usage

**Endpoint:** `POST /api/pdf`

**Request:** `Content-Type: application/json`

```json
{
  "adSoyad": "Ad Soyad",
  "email": "user@example.com",
  "tcKimlik": "",
  "cepNumarasi": "",
  "adres": "",
  "tarih": "2024-01-15",
  "signaturePng": "data:image/png;base64,..."
}
```

**Response:** `application/pdf` with header `Content-Disposition: inline; filename="contract.pdf"`

## Local development

```bash
npm install
npx playwright install chromium
npm run dev
```

API: `http://localhost:3001/api/pdf`

## Deployment

### Vercel

Playwright/Chromium **does not run** on Vercel serverless by default (binary size and runtime limits).

Options:

- **A) External PDF service:** Use a remote browser (e.g. [Browserless](https://browserless.io), [DocRaptor](https://docraptor.com)). In code, use `chromium.connect(wsEndpoint)` instead of `chromium.launch()` and point to the service URL.
- **B) Vercel + custom runtime:** No official Playwright support; would require custom Docker/runtime.
- **C) Deploy API elsewhere (recommended):** Use a VPS or Node host (see below).

### VPS / Node server

Runs without changes.

1. **Install dependencies**

   ```bash
   npm install
   npx playwright install chromium
   # or: npm install @playwright/browser-chromium
   ```

2. **Build and run**

   ```bash
   npm run build
   npm run start
   ```

3. **Headless:** Already using `headless: true`. On headless Linux servers, optional args can help:
   - `--no-sandbox`
   - `--disable-setuid-sandbox`
   - `--disable-dev-shm-usage` (if you see shared memory errors)

4. **Performance:** For high traffic, reuse a single browser instance instead of launching per request (e.g. global `browser = await chromium.launch()` and use `browser.newPage()` per request). Set timeouts and memory limits to avoid crashes.

## Integration with Pakethane frontend (Vite)

Set in `.env`:

```
VITE_PDF_API_URL=https://your-pdf-api.example.com
```

Then:

```ts
const res = await fetch(`${import.meta.env.VITE_PDF_API_URL}/api/pdf`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contractData),
});
const blob = await res.blob();
// Download or use blob
```

## Tech

- **Next.js 14** (App Router)
- **playwright-core** + Chromium
- **zod** for request validation
- HTML template with A4 CSS, 18mm margins, header/footer, signature image (base64)
