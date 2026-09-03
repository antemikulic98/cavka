import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password
  },
});

interface BookingEmailData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleName: string;
  vehicleType: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number;
  totalCost: number;
  originalAmount?: number;
  discount?: number;
  paymentStatus: string;
  paymentMethod: string;
}

// Generate HTML email template for customer
function generateCustomerEmailHTML(data: BookingEmailData): string {
  const pickupDateStr = new Date(data.pickupDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const returnDateStr = new Date(data.returnDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const discountText =
    data.discount && data.discount > 0
      ? `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>Original Amount:</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        €${data.originalAmount?.toFixed(2)}
      </td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #059669;">Discount (${Number(data.discount).toFixed(0)}%):</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669;">
        -€${((data.originalAmount || 0) - data.totalCost).toFixed(2)}
      </td>
    </tr>
  `
      : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #059669, #047857); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        <p style="color: #d1fae5; margin: 10px 0 0 0;">Thank you for choosing HIT Rent</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          Your booking has been confirmed! We're excited to provide you with our ${data.vehicleName}.
        </p>

        <div style="background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin-top: 0; font-size: 18px;">Booking Reference</h2>
          <p style="font-size: 24px; font-weight: bold; color: #047857; margin: 0; letter-spacing: 2px;">${data.bookingId}</p>
        </div>

        <h3 style="color: #047857; margin-top: 25px; margin-bottom: 15px;">Vehicle Details</h3>
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Vehicle:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.vehicleName}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Type:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.vehicleType === 'transfer' ? 'Transfer Service' : 'Rental Car'}
            </td>
          </tr>
        </table>

        <h3 style="color: #047857; margin-top: 25px; margin-bottom: 15px;">Rental Details</h3>
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Pickup Date:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${pickupDateStr}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Pickup Location:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.pickupLocation}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Return Date:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${returnDateStr}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Return Location:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.returnLocation}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>Rental Duration:</strong>
            </td>
            <td style="padding: 12px; text-align: right;">
              ${data.rentalDays} ${data.rentalDays === 1 ? 'day' : 'days'}
            </td>
          </tr>
        </table>

        <h3 style="color: #047857; margin-top: 25px; margin-bottom: 15px;">Payment Summary</h3>
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          ${discountText}
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Total Amount:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 18px; color: #047857;">
              <strong>€${data.totalCost.toFixed(2)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Payment Status:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="background: ${data.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7'}; color: ${data.paymentStatus === 'paid' ? '#047857' : '#b45309'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                ${data.paymentStatus}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>Payment Method:</strong>
            </td>
            <td style="padding: 12px; text-align: right; text-transform: capitalize;">
              ${data.paymentMethod.replace('_', ' ')}
            </td>
          </tr>
        </table>

        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">Important Reminders:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
            <li>Please arrive at least 15 minutes before your scheduled pickup time</li>
            <li>Bring a valid driver's license and credit card</li>
            <li>Keep this confirmation email for your records</li>
            ${data.paymentStatus === 'pending' ? '<li><strong>Payment will be required at pickup</strong></li>' : ''}
          </ul>
        </div>

        <p style="margin-top: 30px;">
          If you have any questions or need to modify your booking, please don't hesitate to contact us.
        </p>

        <p style="margin-top: 20px;">
          Best regards,<br>
          <strong style="color: #047857;">HIT Rent Team</strong>
        </p>
      </div>

      <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">
          HIT Rent | Email: booking@hit-rent.com | Phone: +385 91 722 4138
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">
          © ${new Date().getFullYear()} HIT Rent. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML email template for admin
function generateAdminEmailHTML(data: BookingEmailData): string {
  const pickupDateStr = new Date(data.pickupDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const returnDateStr = new Date(data.returnDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1f2937; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">New Booking Alert</h1>
        <p style="color: #9ca3af; margin: 10px 0 0 0;">A new booking has been created</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
        <div style="background: white; border: 2px solid #1f2937; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">Booking ID</h2>
          <p style="font-size: 20px; font-weight: bold; color: #374151; margin: 0; letter-spacing: 1px;">${data.bookingId}</p>
        </div>

        <h3 style="color: #1f2937; margin-top: 25px; margin-bottom: 15px;">Customer Information</h3>
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Name:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.customerName}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Email:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <a href="mailto:${data.customerEmail}" style="color: #059669;">${data.customerEmail}</a>
            </td>
          </tr>
          ${
            data.customerPhone
              ? `
          <tr>
            <td style="padding: 12px;">
              <strong>Phone:</strong>
            </td>
            <td style="padding: 12px; text-align: right;">
              <a href="tel:${data.customerPhone}" style="color: #059669;">${data.customerPhone}</a>
            </td>
          </tr>
          `
              : ''
          }
        </table>

        <h3 style="color: #1f2937; margin-top: 25px; margin-bottom: 15px;">Vehicle & Rental Details</h3>
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Vehicle:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.vehicleName}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Type:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${data.vehicleType === 'transfer' ? 'Transfer Service' : 'Rental Car'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Pickup:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${pickupDateStr}<br>${data.pickupLocation}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Return:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${returnDateStr}<br>${data.returnLocation}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>Duration:</strong>
            </td>
            <td style="padding: 12px; text-align: right;">
              ${data.rentalDays} ${data.rentalDays === 1 ? 'day' : 'days'}
            </td>
          </tr>
        </table>

        <h3 style="color: #1f2937; margin-top: 25px; margin-bottom: 15px;">Payment Information</h3>
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          ${
            data.discount && data.discount > 0
              ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Original Amount:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              €${data.originalAmount?.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Discount:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              ${Number(data.discount).toFixed(0)}% (-€${((data.originalAmount || 0) - data.totalCost).toFixed(2)})
            </td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Total Amount:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 18px;">
              <strong>€${data.totalCost.toFixed(2)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>Payment Status:</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="background: ${data.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7'}; color: ${data.paymentStatus === 'paid' ? '#047857' : '#b45309'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                ${data.paymentStatus}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>Payment Method:</strong>
            </td>
            <td style="padding: 12px; text-align: right; text-transform: capitalize;">
              ${data.paymentMethod.replace('_', ' ')}
            </td>
          </tr>
        </table>

        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #1e3a8a;">
            <strong>Action Required:</strong> Please review this booking in the admin dashboard and ensure the vehicle is prepared for pickup.
          </p>
        </div>
      </div>

      <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">
          HIT Rent Admin Notification System
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">
          This is an automated notification. Do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Send booking confirmation emails
export async function sendBookingConfirmation(
  bookingData: BookingEmailData
): Promise<void> {
  try {
    // Send email to customer
    await transporter.sendMail({
      from: `"HIT Rent" <${process.env.GMAIL_USER}>`,
      to: bookingData.customerEmail,
      subject: `Booking Confirmation - ${bookingData.vehicleName}`,
      html: generateCustomerEmailHTML(bookingData),
    });

    console.log('✅ Customer confirmation email sent to:', bookingData.customerEmail);

    // Send email to admin
    await transporter.sendMail({
      from: `"HIT Rent System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'booking@hit-rent.com',
      subject: `New Booking: ${bookingData.vehicleName} - ${bookingData.customerName}`,
      html: generateAdminEmailHTML(bookingData),
    });

    console.log('✅ Admin notification email sent to:', process.env.ADMIN_EMAIL || 'booking@hit-rent.com');
  } catch (error) {
    console.error('❌ Error sending booking confirmation emails:', error);
    throw error;
  }
}

interface ContactInquiryData {
  name: string;
  email: string;
  phone?: string;
  carModel?: string;
  message: string;
}

/**
 * Send a contact-form inquiry to the fleet manager
 */
export async function sendContactInquiry(
  data: ContactInquiryData
): Promise<void> {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  await transporter.sendMail({
    from: `"Hit Rent Website" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'booking@hit-rent.com',
    replyTo: data.email,
    subject: `New inquiry from ${data.name}${
      data.carModel ? ` — ${data.carModel}` : ''
    }`,
    html: `
      <h2>New website inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ''}
      ${data.carModel ? `<p><strong>Vehicle:</strong> ${escapeHtml(data.carModel)}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>
    `,
  });
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server verification failed:', error);
    return false;
  }
}
