# Razorpay setup (your account + UPI)

Payments go to **whoever owns the API keys** in `.env`. Use keys from **your** Razorpay Dashboard only.

## 1. Create / use your Razorpay account

1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete **KYC** and add your **bank account** (Settings → Account & Settings → Bank account)
3. For real payments: switch to **Live mode** (toggle top-left). For testing: stay in **Test mode**

## 2. Get API keys

**Settings → API Keys → Generate Key**

| Key | Where to put it |
|-----|-----------------|
| **Key ID** (`rzp_test_...` or `rzp_live_...`) | `backend/.env` → `RAZORPAY_KEY` AND `frontend/.env` → `VITE_APP_RAZORPAY_KEY` |
| **Key Secret** | `backend/.env` → `RAZORPAY_SECRET` only (never in frontend) |

Restart **backend** and **frontend** after changing `.env`.

## 3. Enable UPI

1. Dashboard → **Settings → Payment methods**
2. Enable **UPI** (and Card / Netbanking if you want)
3. Save

The app checkout is configured to show UPI first; Razorpay will still hide methods you have not enabled on the dashboard.

## 4. Test vs Live

| Mode | Keys | Money |
|------|------|--------|
| Test | `rzp_test_...` | Fake — use [test cards/UPI](https://razorpay.com/docs/payments/payments/test-card-upi-details/) |
| Live | `rzp_live_...` | Real — credited to your linked bank (minus fees, per settlement cycle) |

**Test and Live keys must match** (both test or both live) in backend and frontend.

## 5. Verify payments work

1. Student buys a course → Razorpay popup opens
2. Pay with test UPI/card (test mode) or real UPI (live mode)
3. Check **Dashboard → Transactions** on Razorpay

## Security

- Do not commit `.env` to Git
- Do not share **Key Secret**
- If keys were exposed, **regenerate** them in the dashboard

## Checkout not opening?

1. **Same Key ID** in `backend/.env` (`RAZORPAY_KEY`) and `frontend/.env` (`VITE_APP_RAZORPAY_KEY`) — must match exactly.
2. **Test/Live match** — both `rzp_test_...` or both `rzp_live_...`.
3. Log in as **Student** (instructors cannot use `/payment/capturePayment`).
4. Restart **both** servers after changing `.env`.
5. Browser DevTools → **Network** → `capturePayment` — read the error message in the response.
6. Course price must be **at least ₹1**.
