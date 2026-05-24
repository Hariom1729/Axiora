const Course = require('../models/course');
const Category = require('../models/category');

/** Ensures each course id is listed on its category (fixes legacy createCourse bug). */
exports.syncCoursesToCategories = async () => {
	try {
		const courses = await Course.find({}).select('_id category status');
		for (const course of courses) {
			if (!course.category) continue;
			await Category.findByIdAndUpdate(course.category, {
				$addToSet: { courses: course._id },
			});
		}
	} catch (error) {
		console.log('Error syncing courses to categories:', error.message);
	}
};
