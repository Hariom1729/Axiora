/**
 * Verifies Razorpay API keys from backend/.env
 * Run: npm run razorpay:check
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const key_id = process.env.RAZORPAY_KEY?.trim();
const key_secret = process.env.RAZORPAY_SECRET?.trim();

if (!key_id || !key_secret) {
	console.error('Missing RAZORPAY_KEY or RAZORPAY_SECRET in backend/.env');
	process.exit(1);
}

const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id, key_secret });

(async () => {
	try {
		const order = await rzp.orders.create({
			amount: 100,
			currency: 'INR',
			receipt: `check_${Date.now()}`,
		});
		console.log('Razorpay keys are valid.');
		console.log('Key ID:', key_id);
		console.log('Test order id:', order.id);
		console.log('\nUse the SAME Key ID in frontend/.env as VITE_APP_RAZORPAY_KEY');
		process.exit(0);
	} catch (err) {
		console.error('Razorpay authentication FAILED.');
		console.error(err?.error?.description || err.message);
		console.error('\nFix:');
		console.error('1. Open https://dashboard.razorpay.com → Test mode → Settings → API Keys');
		console.error('2. Generate NEW keys (old keys may be revoked)');
		console.error('3. Put Key ID in backend RAZORPAY_KEY AND frontend VITE_APP_RAZORPAY_KEY');
		console.error('4. Put Key Secret ONLY in backend RAZORPAY_SECRET');
		console.error('5. Restart backend and frontend');
		process.exit(1);
	}
})();
