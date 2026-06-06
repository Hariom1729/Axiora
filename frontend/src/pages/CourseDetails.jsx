
import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
// import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import ConfirmationModal from "../components/common/ConfirmationModal"
import Footer from "../components/common/Footer"
import RatingStars from "../components/common/RatingStars"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { buyCourse } from "../services/operations/studentFeaturesAPI"

import GetAvgRating from "../utils/avgRating"
import { ACCOUNT_TYPE } from './../utils/constants';
import { addToCart } from "../slices/cartSlice"

import { GiReturnArrow } from 'react-icons/gi'
import { MdOutlineVerified } from 'react-icons/md'
import Img from './../components/common/Img';
import { RxCross2 } from 'react-icons/rx'
import toast from "react-hot-toast"




function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()


  // Getting courseId from url parameter
  const { courseId } = useParams()
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)

  const handlePlayPreview = (videoUrl, title) => {
    setPreviewVideo({ videoUrl, title })
  }

  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    const fectchCourseDetailsData = async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        // console.log("course details res: ", res)
        setResponse(res)
      } catch (error) {
        console.log("Could not fetch Course Details")
      }
    }
    fectchCourseDetailsData();
  }, [courseId])

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails.ratingAndReviews)
    setAvgReviewCount(count)
  }, [response])
  // console.log("avgReviewCount: ", avgReviewCount)

  // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {
    // console.log("called", id)
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    )
  }

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  // Loading skeleton
  if (paymentLoading || loading || !response) {
    return (
      <div className={`mt-24 p-5 flex flex-col justify-center gap-4  `}>
        <div className="flex flex-col sm:flex-col-reverse  gap-4 ">
          <p className="h-44 sm:h-24 sm:w-[60%] rounded-xl skeleton"></p>
          <p className="h-9 sm:w-[39%] rounded-xl skeleton"></p>
        </div>

        <p className="h-4 w-[55%] lg:w-[25%] rounded-xl skeleton"></p>
        <p className="h-4 w-[75%] lg:w-[30%] rounded-xl skeleton"></p>
        <p className="h-4 w-[35%] lg:w-[10%] rounded-xl skeleton"></p>

        {/* Floating Courses Card */}
        <div className="right-[1.5rem] top-[20%] hidden lg:block lg:absolute min-h-[450px] w-1/3 max-w-[410px] 
            translate-y-24 md:translate-y-0 rounded-xl skeleton">
        </div>

        <p className="mt-24 h-60 lg:w-[60%] rounded-xl skeleton"></p>
      </div>
    )
  }


  // extract course data
  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    tag
  } = response?.data?.courseDetails

  // Buy Course handler
  const handleBuyCourse = () => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors cannot purchase courses. Log in as a student.")
      return
    }
    if (token) {
      const coursesId = [courseId]
      buyCourse(token, coursesId, user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  // Add to cart Course handler
  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(response?.data.courseDetails))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }



  return (
    <div className="bg-richblack-900 min-h-screen">
      <div className={`relative w-full bg-richblack-800/20 overflow-hidden`}>
        {/* Background Blob Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative z-10">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-12 lg:mx-0 lg:justify-items-start lg:py-16 xl:max-w-[810px]">

            {/* Go back button */}
            <div className="mb-5 lg:mt-4 lg:mb-8 z-[100] group" onClick={() => navigate(-1)}>
              <GiReturnArrow className="w-10 h-10 text-yellow-50/80 group-hover:text-yellow-50 group-hover:scale-110 transition-all cursor-pointer drop-shadow-lg" />
            </div>

            {/* will appear only for small size */}
            <div className="relative block max-h-[30rem] lg:hidden mb-8 w-full">
              <Img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-video w-full rounded-2xl shadow-2xl object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-transparent to-transparent rounded-2xl"></div>
            </div>

            {/* Course data */}
            <div className={`mb-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}>
              <p className="text-4xl md:text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-richblack-200">{courseName}</p>
              <p className='text-richblack-200 leading-relaxed max-w-[90%]'>{courseDescription}</p>
              <div className="text-md flex flex-wrap items-center gap-3 bg-richblack-800/40 backdrop-blur-md px-4 py-2 rounded-full border border-richblack-700 w-fit mt-2">
                <span className="text-yellow-100 font-bold">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={20} />
                <span className="text-richblack-200">{`(${ratingAndReviews.length} reviews)`}</span>
                <span className="text-richblack-400">|</span>
                <span className="text-richblack-200">{`${studentsEnrolled.length} students enrolled`}</span>
              </div>
              <p className="capitalize text-richblack-100 mt-4"> Created By <span className="font-semibold text-blue-300 ml-1">{instructor.firstName} {instructor.lastName}</span></p>
              <div className="flex flex-wrap gap-5 text-base text-richblack-300">
                <p className="flex items-center gap-2">
                  <BiInfoCircle className="text-yellow-100"/> Created at {formatDate(createdAt)}
                </p>
                <p className="flex items-center gap-2"> <HiOutlineGlobeAlt className="text-blue-300"/> English</p>
              </div>
            </div>

            {/* will appear only for small size */}
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-700 py-6 lg:hidden mt-4">
              <p className="space-x-3 pb-2 text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-yellow-400">Rs. {price}</p>
              <button className="rounded-xl bg-yellow-50 hover:bg-yellow-100 py-3 px-8 font-semibold text-richblack-900 shadow-[0_0_20px_rgba(255,214,10,0.3)] transition-all" onClick={handleBuyCourse}>Buy Now</button>
              <button onClick={handleAddToCart} className="rounded-xl bg-richblack-800 border border-richblack-700 py-3 px-8 font-semibold hover:bg-richblack-700 transition-all">Add to Cart</button>
            </div>
          </div>

          {/* Floating Courses Card */}
          <div className="right-[1.5rem] top-[80px] mx-auto hidden lg:block lg:absolute min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 z-50">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px] pb-20 relative z-10">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* What will you learn section */}
          <div className="my-12 border border-richblack-700/50 bg-richblack-800/30 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl">
            <p className="text-3xl font-outfit font-bold mb-6">What you'll learn</p>
            <div className="mt-3 grid gap-3">
              {whatYouWillLearn && (
                whatYouWillLearn.split('\n').map((line, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mt-1 mr-4">
                        {index + 1}
                    </div>
                    <p className="text-richblack-100 leading-relaxed">{line}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col lg:flex-row gap-4">
            <p className="text-xl font-bold">Tags</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {
                tag && tag.map((item, ind) => (
                  <p key={ind} className="bg-yellow-50 p-[2px] text-black rounded-full text-center font-semibold" >
                    {item}
                  </p>
                ))
              }
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] mt-9">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>
                  <span>{response.data?.totalDuration} Total Time</span>
                </div>
                <button
                  className="text-yellow-25"
                  onClick={() => setIsActive([])}
                >
                  Collapse All Sections
                </button>
              </div>
            </div>

            {/* Course Details Accordion - section Subsection */}
            <div className="py-4 ">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                  handlePlayPreview={handlePlayPreview}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Author</p>
              <div className="flex items-center gap-4 py-4">
                <Img
                  src={instructor.image}
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="text-lg capitalize flex items-center gap-2 font-semibold">{`${instructor.firstName} ${instructor.lastName}`}
                    <span><MdOutlineVerified className='w-5 h-5 text-[#00BFFF]' /></span>
                  </p>
                  <p className="text-richblack-50">{instructor?.additionalDetails?.about}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      {previewVideo && (
        <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
          <div className="w-11/12 max-w-[800px] rounded-lg border border-richblack-400 bg-richblack-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xl font-semibold text-richblack-5 flex items-center gap-2">
                <span className="bg-yellow-50 text-black px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Free Preview</span>
                {previewVideo.title}
              </p>
              <button onClick={() => setPreviewVideo(null)} className="text-richblack-400 hover:text-richblack-5 transition-colors">
                <RxCross2 className="text-2xl" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
              <video 
                src={previewVideo.videoUrl} 
                controls 
                autoPlay 
                controlsList="nodownload"
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}

export default CourseDetails