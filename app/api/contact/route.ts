import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, validators } from '@/lib/security';
import { csrfProtection } from '@/lib/csrf';
import { sendContactInquiry } from '@/lib/email';

/**
 * POST /api/contact
 * Public contact form — emails the fleet manager.
 */
export async function POST(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }

    // Max 3 messages per 10 minutes per client
    const rateLimitResponse = await rateLimit({
      windowMs: 10 * 60 * 1000,
      maxRequests: 3,
    })(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 200);
    const phone = String(body.phone || '').trim().slice(0, 30);
    const carModel = String(body.carModel || '').trim().slice(0, 100);
    const message = String(body.message || '').trim().slice(0, 2000);

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      );
    }
    if (!email || !validators.email(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required so we can reply' },
        { status: 400 }
      );
    }

    await sendContactInquiry({ name, email, phone, carModel, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please call us instead.' },
      { status: 500 }
    );
  }
}
