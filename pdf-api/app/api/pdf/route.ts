import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import { ZodError } from 'zod';
import { parseContractBody } from '@/lib/schema';
import { renderContractHtml } from '@/lib/template';

const BODY_SIZE_LIMIT = 1024 * 1024; // 1MB

const headerTemplate = `
<div style="font-size: 10px; color: #666; width: 100%; padding: 0 8px; box-sizing: border-box;">
  <span>Pakethane Lojistik</span>
</div>
`;

const footerTemplate = `
<div style="font-size: 10px; color: #666; width: 100%; padding: 0 8px; box-sizing: border-box;">
  <span class="pageNumber"></span> / <span class="totalPages"></span>
</div>
`;

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
    const data = parseContractBody(body);
    const html = renderContractHtml(data);

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 15000,
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
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
      });

      await browser.close();

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="contract.pdf"',
        },
      });
    } catch (pdfError) {
      await browser.close();
      throw pdfError;
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: err.errors },
        { status: 400 }
      );
    }
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
