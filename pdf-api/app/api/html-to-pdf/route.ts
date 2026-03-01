import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

const BODY_SIZE_LIMIT = 4 * 1024 * 1024; // 4MB (imzalı HTML base64 ile büyük olabilir)

/**
 * POST body: { html: string }
 * Doldurulmuş ve imzalı HTML'i A4 PDF olarak döner.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > BODY_SIZE_LIMIT) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const html = typeof body.html === 'string' ? body.html : '';

    if (!html) {
      return NextResponse.json(
        { error: 'Missing or invalid "html" in body' },
        { status: 400 }
      );
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 20000,
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '18mm',
          right: '18mm',
          bottom: '18mm',
          left: '18mm',
        },
      });

      await browser.close();

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="sozlesme.pdf"',
        },
      });
    } catch (pdfError) {
      await browser.close();
      throw pdfError;
    }
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message || 'PDF generation failed' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
