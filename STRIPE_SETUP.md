# Stripe Payment Integration Setup Guide

## Overview

The Stripe payment integration has been successfully implemented with discount incentives:
- **Rent a Car**: 15% discount for immediate payment
- **Transfers**: 10% discount for immediate payment

## Setup Steps

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or log in
3. Navigate to **Developers > API Keys**
4. Copy your **Publishable key** and **Secret key**

### 2. Update Environment Variables

Open `.env.local` and replace the placeholder values:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL in production
```

### 3. Set Up Stripe Webhook

Webhooks allow Stripe to notify your application when payments succeed.

#### For Development (Local Testing):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

#### For Production:

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the **Signing secret** and add it to your production environment variables

### 4. Test the Integration

1. Start your development server: `yarn dev`
2. Search for a vehicle
3. Click "Book Now" on a vehicle
4. Fill in customer information
5. In Step 4, you'll see two payment options:
   - **Book Now, Pay Later**: No discount, pay at counter
   - **Pay Now & Save**: 15% discount for rentals, 10% for transfers
6. Select "Pay Now & Save" and complete the booking
7. You'll be redirected to Stripe checkout (test mode)
8. Use test card: `4242 4242 4242 4242` with any future expiration and any CVC
9. After successful payment, you'll be redirected to the success page

## How It Works

### User Flow:

1. **Select Payment Method**: Users choose between "Pay Later" or "Pay Now" in the booking modal
2. **Discount Applied**: If "Pay Now" is selected, discount is automatically calculated
3. **Stripe Checkout**: User is redirected to secure Stripe payment page
4. **Payment Processing**: Stripe processes the payment
5. **Webhook Notification**: Stripe sends a webhook to your server
6. **Booking Creation**: Webhook handler automatically creates the booking in your database
7. **Success Page**: User is redirected to a beautiful success page with booking confirmation

### Database Updates:

The Booking model has been updated with new payment fields:
- `paymentStatus`: pending | paid | failed | refunded
- `paymentMethod`: stripe | cash | bank_transfer | pay_later
- `stripeSessionId`: Stripe checkout session ID
- `stripePaymentIntentId`: Stripe payment intent ID
- `pricing.discount`: Discount amount
- `pricing.originalAmount`: Original price before discount

## File Structure

```
app/
├── api/
│   ├── checkout/
│   │   └── route.ts              # Creates Stripe checkout sessions
│   └── webhooks/
│       └── stripe/
│           └── route.ts          # Handles payment webhooks
├── payment/
│   ├── success/
│   │   └── page.tsx              # Success page after payment
│   └── cancel/
│       └── page.tsx              # Cancellation page
└── search/
    └── BookingModal.tsx          # Updated with payment options

models/
└── Booking.ts                    # Updated with payment fields

.env.local                        # Stripe configuration
```

## Important Notes

### Security

- Never expose your `STRIPE_SECRET_KEY` in client-side code
- Only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` should be accessible from the browser
- Always verify webhook signatures to prevent fraud
- Use HTTPS in production

### Testing

Use Stripe test cards: https://stripe.com/docs/testing

**Successful payments:**
- `4242 4242 4242 4242` - Visa
- `5555 5555 5555 4444` - Mastercard

**Declined payments:**
- `4000 0000 0000 0002` - Card declined

### Production Checklist

- [ ] Replace test API keys with live keys
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Set up production webhook endpoint
- [ ] Add `STRIPE_WEBHOOK_SECRET` to production environment
- [ ] Test full payment flow in production
- [ ] Monitor Stripe Dashboard for payments
- [ ] Set up email notifications (optional)

## Features Implemented

✅ Stripe Checkout integration
✅ Automatic discount calculation (15% rent, 10% transfer)
✅ Beautiful payment option UI with pricing comparison
✅ Secure webhook handling
✅ Automatic booking creation after payment
✅ Payment success page
✅ Payment cancellation page
✅ Database schema updates for payment tracking
✅ Loading states and error handling

## Support

For Stripe-related issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application issues:
- Check the Stripe Dashboard logs
- Review webhook event history
- Check your server logs for errors
