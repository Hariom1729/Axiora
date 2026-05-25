
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/common/animations/PageTransition";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/PageNotFound";
import CourseDetails from './pages/CourseDetails';
import Catalog from './pages/Catalog';
 
import Navbar from "./components/common/Navbar"

import OpenRoute from "./components/core/Auth/OpenRoute"
import ProtectedRoute from "./components/core/Auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings/Settings";
import MyCourses from './components/core/Dashboard/MyCourses';
import EditCourse from './components/core/Dashboard/EditCourse/EditCourse';
import Instructor from './components/core/Dashboard/Instructor';


import Cart from "./components/core/Dashboard/Cart/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import AddCourse from "./components/core/Dashboard/AddCourse/AddCourse";

import ViewCourse from "./pages/ViewCourse";
import VideoDetails from './components/core/ViewCourse/VideoDetails';

import { ACCOUNT_TYPE } from './utils/constants';

import { HiArrowNarrowUp } from "react-icons/hi"


function App() {

  const { user } = useSelector((state) => state.profile)

  // Scroll to the top of the page when the component mounts
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname])

  useEffect(() => {
    scrollTo(0, 0);
  }, [location])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  // Go upward arrow - show , unshow
  const [showArrow, setShowArrow] = useState(false)

  const handleArrow = () => {
    if (window.scrollY > 500) {
      setShowArrow(true)
    } else setShowArrow(false)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleArrow);
    return () => {
      window.removeEventListener('scroll', handleArrow);
    }
  }, [showArrow])


  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />

      {/* go upward arrow */}
      <button onClick={() => window.scrollTo(0, 0)}
        className={`bg-yellow-25 hover:bg-yellow-50 hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 duration-500 ease-in-out ${showArrow ? 'bottom-6' : '-bottom-24'} `} >
        <HiArrowNarrowUp />
      </button>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="catalog/:catalogName" element={<PageTransition><Catalog /></PageTransition>} />
          <Route path="courses/:courseId" element={<PageTransition><CourseDetails /></PageTransition>} />

          {/* Open Route - for Only Non Logged in User */}
          <Route
            path="signup" element={
              <OpenRoute>
                <PageTransition><Signup /></PageTransition>
              </OpenRoute>
            }
          />

          <Route
            path="login" element={
              <OpenRoute>
                <PageTransition><Login /></PageTransition>
              </OpenRoute>
            }
          />

          <Route
            path="forgot-password" element={
              <OpenRoute>
                <PageTransition><ForgotPassword /></PageTransition>
              </OpenRoute>
            }
          />

          <Route
            path="verify-email" element={
              <OpenRoute>
                <PageTransition><VerifyEmail /></PageTransition>
              </OpenRoute>
            }
          />

          <Route
            path="update-password/:id" element={
              <OpenRoute>
                <PageTransition><UpdatePassword /></PageTransition>
              </OpenRoute>
            }
          />




          {/* Protected Route - for Only Logged in User */}
          {/* Dashboard */}
          <Route element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
          >
            <Route path="dashboard/my-profile" element={<MyProfile />} />
            <Route path="dashboard/Settings" element={<Settings />} />

            {/* Route only for Students */}
            {/* cart , EnrolledCourses */}
            {user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="dashboard/cart" element={<Cart />} />
                <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
              </>
            )}

            {/* Route only for Instructors */}
            {/* add course , MyCourses, EditCourse*/}
            {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="dashboard/instructor" element={<Instructor />} />
                <Route path="dashboard/add-course" element={<AddCourse />} />
                <Route path="dashboard/my-courses" element={<MyCourses />} />
                <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              </>
            )}
          </Route>


          {/* For the watching course lectures */}
          <Route
            element={
              <ProtectedRoute>
                <PageTransition><ViewCourse /></PageTransition>
              </ProtectedRoute>
            }
          >
            {user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            )}
          </Route>




          {/* Page Not Found (404 Page ) */}
          <Route path="*" element={<PageTransition><PageNotFound /></PageTransition>} />

        </Routes>
      </AnimatePresence>

    </div>
  );
}

export default App;
