# Project Description 📝

LearnHub is a fully functional ed-tech platform that enables users to create, consume, and rate educational content. <br/>
The platform is built using the **MERN stack**, which includes ReactJS, NodeJS, MongoDB, and ExpressJS.

## LearnHub Aim 📚

<br/>
1️⃣ A seamless and interactive learning experience for students, making education more accessible and engaging.<br/>
2️⃣ A platform for instructors to showcase their expertise and connect with learners across the globe.<br/>

<br/>

## Installation & Setup 🚀

To get the project running locally on your machine, follow these steps:

### Prerequisites

- Node.js (v18 or higher)
- MongoDB installed locally or MongoDB Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/Hariom1729/LearnHub
cd LearnHub
```

### 2. Install Dependencies

You need to install dependencies for both the frontend and backend.

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd ../frontend
npm install
```

### 3. Environment Variables (API Keys Requirements) 🔑

Create a `.env` file in both `frontend` and `backend` directories and add the following keys:

**Backend (`backend/.env`):**

```env
PORT=5001
CLIENT_URL=http://localhost:5173
DATABASE_URL=mongodb://127.0.0.1:27017/learnhub
JWT_SECRET=your_jwt_secret

# Cloudinary Integration (for media uploads)
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=learnhub

# Mail (OTP generation & password reset)
MAIL_HOST=smtp.example.com
MAIL_USER=your_smtp_email
MAIL_PASS=your_smtp_password

# Razorpay (Payment gateway)
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret_key
```

**Frontend (`frontend/.env`):**

```env
VITE_APP_BASE_URL=http://localhost:5001/api/v1
VITE_APP_RAZORPAY_KEY=your_razorpay_key_id
```

### 4. Start the Application 🏃‍♂️

You will need to run the frontend and backend servers simultaneously.

**Start Backend Server:**

```bash
cd backend
npm run dev
```

**Start Frontend Server:**

```bash
cd frontend
npm run dev
```

<hr/>

## System Architecture 🏰

<br/>
☝ The LearnHub ed-tech platform consists of three main components:  <br/>
The front end, the back end, and the database. The platform follows a client-server architecture, with the front end serving as the client and the back end and database serving as the server.

🎨 Front-end <br/>
The front end of the platform is built using ReactJS, which is a popular JavaScript library for building user interfaces. ReactJS allows for the creation of dynamic and responsive user interfaces also **Loading Skeleton**, which are critical for providing an engaging learning experience to the students. The front end communicates with the back end using RESTful API calls.

⚙️ Back-end <br/>
The back end of the platform is built using NodeJS and ExpressJS, which are popular frameworks for building scalable and robust server-side applications. The back end provides APIs for the front end to consume, which include functionalities such as user authentication, course creation, and course consumption. The back end also handles the logic for processing and storing the course content and user data.

🛢️ Database <br/>
The database for the platform is built using MongoDB, which is a NoSQL database that provides a flexible and scalable data storage solution. MongoDB allows for the storage of unstructured and semi-structured data, which is useful for storing course content such as videos, images, and PDFs. The database stores the course content, user data, and other relevant information related to the platform.

## Architecture Diagram 🏗️

<br/>
<hr/>

#### The front end of LearnHub has all the necessary pages that an ed-tech platform should have. Some of these pages are:

For Students:

- **Homepage 🏠:** A brief introduction to the platform with links to the course list user details and a random background.
- **Course List 📚:** A list of all the courses available on the platform, along with their descriptions and ratings.
- **Wishlist 💡:** Displays all the courses that a student has added to their wishlist.
- **Cart Checkout 🛒 :** Allows the user to complete course purchases.
- **Course Content 🎓:** Presents the course content for a particular course, including videos and related material.
- **User Details 👤:** Provides details about the student's account, including their name, email, and other relevant information.
- **User Edit Details ✏️:** Allows students to edit their account details.

For Instructors:

- **Dashboard 📊:** Offers an overview of the instructor's courses, along with ratings and feedback for each course.
- **Insights 📈:** Provides detailed insights into the instructor's courses, including the number of views, clicks, and other relevant metrics.
- **Course Management Pages 🛠️:** Enables instructors to create, update, and delete courses, as well as manage course content and pricing.
- **View and Edit Profile Details 👀:** Allows instructors to view and edit their account details.

### Back-end ⚙️

The back-end of the platform is built using NodeJS and ExpressJS, providing APIs for the front-end to consume. These APIs include functionalities such as user authentication, course creation, and course consumption. The back-end also handles the logic for processing and storing the course content and user data.

#### Back-end Features

- **User Authentication and Authorization 🔐:** Students and instructors can sign up and log in to the platform using their email addresses and passwords. The platform also supports OTP (One-Time Password) verification and forgot password functionality for added security.
- **Course Management 🛠️:** Instructors can create, read, update, and delete courses, as well as manage course content and media. Students can view and rate courses.
- **Payment Integration 💳:** Students will purchase and enroll in courses by completing the checkout flow, followed by Razorpay integration for payment handling.
- **Cloud-based Media Management ☁️ :** StudyNotion uses Cloudinary, a cloud-based media management service, to store and manage all media content, including images, videos, and documents.
- **Markdown Formatting ✍️:** Course content in document format is stored in Markdown format, allowing for easier display and rendering on the front-end.

#### Data Models and Database Schema

The back-end of StudyNotion uses several data models and database schemas to manage data, including:

- **Student Schema 🧑‍🎓:** Includes fields such as name, email, password, and course details for each student.
- **Instructor Schema 👩‍🏫:** Includes fields such as name, email, password, and course details for each instructor.
- **Course Schema 📚:** Includes fields such as course name, description, instructor details, and media content.

### Database 🛢️

The database for the platform is built using MongoDB, a NoSQL database that provides a flexible and scalable data storage solution. MongoDB allows for the storage of unstructured and semi-structured data. The database stores the course content, user data, and other relevant information related to the platform.

<hr/>

## React Hooks 🎣

Utilized several React hooks for efficient state management and dynamic behavior:

- `useState`
- `useEffect`
- `useDispatch`
- `useParams`
- `useSelector`
- `useLocation`
- `useNavigate`
- `useRef`
- `useForm`
- `useDropzone`
- `Custom-Hook`

<br/>

## 📚 **React Library**:

- 🚀 **Lazy Loading**: Enhance performance by lazily loading images using the react-lazy-load-image library.
- 📊 **Chart.js:** Versatile charting library for creating interactive and visually appealing charts.
- 🎭**Framer Motion:** Animation library for React, providing smooth and expressive motion.
- 📁 **React Dropzone:** Drag-and-drop file uploader for React applications.
- 🍞 **React Hot Toast:** Elegant and customizable toast notifications for React applications.
- 🔢 **React OTP Input:** Input component for one-time password entry in React forms.
- 📊 **React Super Responsive Table:** Highly responsive and feature-rich table component for React.
- 🔄 **Swiper:** Modern touch slider for mobile and desktop browsers.
- 🖋️ **React Type Animation:** Simple and configurable typing animation component for React.
- 🎥 **Video React:** React-based video player for building rich multimedia experiences in web applications.

## API Design

The StudyNotion platform's API is designed following the REST architectural style. The
API is implemented using Node.js and Express.js. It uses JSON for data exchange and
follows standard HTTP request methods such as GET, POST, PUT, and DELETE.
Sample list of API endpoints and their functionalities:

1. /api/auth/signup (POST) - Create a new user (student or instructor) account.
2. /api/auth/login (POST) – Log in using existing credentials and generate a JWT
   token.
3. /api/auth/verify-otp (POST) - Verify the OTP sent to the user's registered email.
4. /api/auth/forgot-password (POST) - Send an email with a password reset link to
   the registered email.
5. /api/courses (GET) - Get a list of all available courses.
6. /api/courses/:id (GET) - Get details of a specific course by ID.
7. /api/courses (POST) - Create a new course.
8. /api/courses/:id (PUT) - Update an existing course by ID.
9. /api/courses/:id (DELETE) - Delete a course by ID.
10. /api/courses/:id/rate (POST) - Add a rating (out of 5) to a course.
    Sample API requests and responses:
11. GET /api/courses: Get all courses
    - Response: A list of all courses in the database
12. GET /api/courses/:id: Get a single course by ID
    - Response: The course with the specified ID
13. POST /api/courses: Create a new course
    - Request: The course details in the request body
    - Response: The newly created course
14. PUT /api/courses/:id: Update an existing course by ID
    - Request: The updated course details in the request body
    - Response: The updated course
15. DELETE /api/courses/:id: Delete a course by ID
    - Response: A success message indicating that the course has been deleted.
