import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json();
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1024,
      height: 1440,
      deviceScaleFactor: 2
    });

    await page.setContent(html, { 
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000 
    });
    
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf'
      }
    });
  } catch (err) {
    // Type-safe error handling
    const error = err as Error;
    console.error('PDF generation error:', error);
    return NextResponse.json({ 
      error: 'PDF generation failed', 
      details: error.message 
    }, { status: 500 });
  }
} 