const Category = require('../models/category');

const DEFAULT_CATEGORIES = [
	{
		name: 'Web Development',
		description: 'HTML, CSS, JavaScript, React, and full-stack web courses',
	},
	{
		name: 'Data Science',
		description: 'Python, machine learning, and data analysis',
	},
	{
		name: 'Mobile Development',
		description: 'Android, iOS, and cross-platform mobile apps',
	},
	{
		name: 'DevOps & Cloud',
		description: 'Docker, Kubernetes, AWS, and CI/CD',
	},
	{
		name: 'Design',
		description: 'UI/UX, Figma, and graphic design',
	},
];

exports.seedCategoriesIfEmpty = async () => {
	try {
		const count = await Category.countDocuments();
		if (count > 0) {
			return;
		}

		await Category.insertMany(DEFAULT_CATEGORIES);
		console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
	} catch (error) {
		console.log('Error seeding default categories:', error.message);
	}
};
