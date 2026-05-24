const mongoose = require('mongoose');
require('dotenv').config();
const { seedCategoriesIfEmpty } = require('../utils/seedCategories');
const { syncCoursesToCategories } = require('../utils/syncCourseCategories');


exports.connectDB = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(async () => {
            console.log('Database connected succcessfully');
            await seedCategoriesIfEmpty();
            await syncCoursesToCategories();
        })
        .catch(error => {
            console.log(`Error while connecting server with Database`);
            console.log(error);
            process.exit(1);
        })
};

