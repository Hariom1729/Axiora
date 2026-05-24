require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { seedCategoriesIfEmpty } = require('../utils/seedCategories');

(async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URL);
		await seedCategoriesIfEmpty();
		const Category = require('../models/category');
		const categories = await Category.find({}, { name: 1 });
		console.log('Categories in database:', categories.map((c) => c.name).join(', ') || '(none)');
		process.exit(0);
	} catch (error) {
		console.error('Seed failed:', error.message);
		process.exit(1);
	}
})();
