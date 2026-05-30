// jsonwebtoken → jwa → buffer-equal-constant-time expects SlowBuffer (removed in Node 21+)
const buffer = require('buffer');
if (!buffer.SlowBuffer) {
	buffer.SlowBuffer = buffer.Buffer;
}

const express = require('express')
const app = express();
const http = require('http');

// packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { initializeSocket } = require('./utils/socketHandler');

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');


// middleware 
app.use(express.json()); // to parse json body
app.use(cookieParser());
const allowedOrigins = [
	process.env.CLIENT_URL,
	'http://localhost:5173',
	'http://127.0.0.1:5173',
    'https://axiora-app-two.vercel.app',
    'https://axiora-bccwudws4-hariom1729s-projects.vercel.app'
].filter(Boolean);

app.use(
	cors({
		origin(origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				console.warn('CORS blocked origin:', origin);
				callback(null, false);
			}
		},
		credentials: true,
	})
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp'
    })
)


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`);
    const rzpKey = process.env.RAZORPAY_KEY?.trim();
    if (rzpKey) {
        console.log(`Razorpay Key ID loaded: ${rzpKey.slice(0, 12)}...`);
    } else {
        console.warn('Razorpay Key ID missing — payments will fail');
    }
});

// connections
connectDB();
cloudinaryConnect();

const contestRoutes = require('./routes/contestRoutes');
const problemRoutes = require('./routes/problemRoutes');

// mount route
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/contest', contestRoutes);
app.use('/api/v1/problem', problemRoutes);




// Default Route
app.get('/', (req, res) => {
    // console.log('Your server is up and running..!');
    res.send(`<div>
    This is Default Route  
    <p>Everything is OK</p>
    </div>`);
})