
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import { setToken } from "./slices/authSlice";
import { setUser } from "./slices/profileSlice";
import { apiConnector } from "./services/apiConnector";
import { endpoints } from "./services/apis";

import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import VerifyEmail from "./pages/VerifyEmail"
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/common/animations/PageTransition";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/PageNotFound";
import CourseDetails from './pages/CourseDetails';
import Catalog from './pages/Catalog';
import Contests from './pages/Contests';
import ContestDetails from './pages/ContestDetails';
import ContestWorkspace from './pages/ContestWorkspace';
import ContestLeaderboard from './pages/ContestLeaderboard';
import ContestReport from './pages/ContestReport';
 
import Navbar from "./components/common/Navbar"

import OpenRoute from "./components/core/Auth/OpenRoute"
import ProtectedRoute from "./components/core/Auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings/Settings";
import MyCourses from './components/core/Dashboard/MyCourses';
import EditCourse from './components/core/Dashboard/EditCourse/EditCourse';
import Instructor from './components/core/Dashboard/Instructor';
import AddContest from './components/core/Dashboard/AddContest/AddContest';
import MyContests from './components/core/Dashboard/MyContests/MyContests';
import AddProblem from './components/core/Dashboard/AddProblem/AddProblem';


import Cart from "./components/core/Dashboard/Cart/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import AddCourse from "./components/core/Dashboard/AddCourse/AddCourse";

import ViewCourse from "./pages/ViewCourse";
import VideoDetails from './components/core/ViewCourse/VideoDetails';

import { ACCOUNT_TYPE } from './utils/constants';

import { HiArrowNarrowUp } from "react-icons/hi"

const { GET_ME_API } = endpoints;


function App() {

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

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


  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          const response = await apiConnector("GET", GET_ME_API, null, {
            Authorization: `Bearer ${idToken}`,
          })

          if (response.data.success) {
            dispatch(setToken(idToken))

            const userImage = response.data?.user?.image
              ? response.data.user.image
              : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

            dispatch(setUser({ ...response.data.user, image: userImage }))
            localStorage.setItem("token", JSON.stringify(idToken))
            localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }))
          }
        } catch (error) {
          console.log("AUTH STATE ERROR --> ", error)
        }
      } else {
        // No firebase user — clear state only if we were previously logged in
        if (token) {
          dispatch(setToken(null))
          dispatch(setUser(null))
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  const isWorkspace = location.pathname.startsWith('/contest-workspace');

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      {!isWorkspace && <Navbar />}

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
          <Route path="contests" element={<PageTransition><Contests /></PageTransition>} />
          <Route path="contests/:contestId" element={<PageTransition><ContestDetails /></PageTransition>} />
          <Route path="contest-workspace/:contestId" element={<PageTransition><ContestWorkspace /></PageTransition>} />
          <Route path="contests/:contestId/leaderboard" element={<PageTransition><ContestLeaderboard /></PageTransition>} />
          <Route path="contests/:contestId/report" element={<PageTransition><ContestReport /></PageTransition>} />

          <Route
            path="signup" element={
              <OpenRoute>
                <PageTransition><Signup /></PageTransition>
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
                <Route path="dashboard/add-contest" element={<AddContest />} />
                <Route path="dashboard/my-contests" element={<MyContests />} />
                <Route path="dashboard/my-contests/:contestId/add-problem" element={<AddProblem />} />
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
