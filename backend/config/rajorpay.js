const Rajorpay = require('razorpay');
require('dotenv').config();

let razorpayInstance = null;

Object.defineProperty(exports, 'instance', {
	get() {
		if (!razorpayInstance) {
			const key_id = process.env.RAZORPAY_KEY?.trim();
			const key_secret = process.env.RAZORPAY_SECRET?.trim();
			if (!key_id || !key_secret) {
				throw new Error(
					'Razorpay is not configured. Add RAZORPAY_KEY and RAZORPAY_SECRET to backend/.env'
				);
			}
			if (!key_id.startsWith('rzp_test_') && !key_id.startsWith('rzp_live_')) {
				throw new Error('RAZORPAY_KEY must start with rzp_test_ or rzp_live_');
			}
			razorpayInstance = new Rajorpay({ key_id, key_secret });
		}
		return razorpayInstance;
	}
});
