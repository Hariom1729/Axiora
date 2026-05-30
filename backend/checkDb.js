const mongoose = require('mongoose');
require('dotenv').config();
const Contest = require('./models/Contest');

async function check() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected to DB.");
        const contests = await Contest.find({});
        console.log("Contests in DB:", contests);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        process.exit(0);
    }
}

check();
