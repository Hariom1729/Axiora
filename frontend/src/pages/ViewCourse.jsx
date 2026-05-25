import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

import { setCourseViewSidebar } from "../slices/sidebarSlice"




export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  // get Full Details Of Course
  useEffect(() => {
    ; (async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token)
      // console.log("Course Data here... ", courseData.courseDetails)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      dispatch(setEntireCourseData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length
      })
      dispatch(setTotalNoOfLectures(lectures))
    })()

  }, [])


  // handle sidebar for small devices
  const { courseViewSidebar } = useSelector(state => state.sidebar)
  const [screenSize, setScreenSize] = useState(undefined)

  // set curr screen Size
  useEffect(() => {
    const handleScreenSize = () => setScreenSize(window.innerWidth)

    window.addEventListener('resize', handleScreenSize);
    handleScreenSize();
    return () => window.removeEventListener('resize', handleScreenSize);
  })

  // close / open sidebar according screen size
  useEffect(() => {
    if (screenSize <= 640) {
      dispatch(setCourseViewSidebar(false))
    } else dispatch(setCourseViewSidebar(true))
  }, [screenSize])


  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)] bg-richblack-900">
        {/* Background Blob Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        {/* view course side bar */}
        <div className="relative z-10">
          {courseViewSidebar && <VideoDetailsSidebar setReviewModal={setReviewModal} />}
        </div>

        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto mt-14 relative z-10">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
      </div>


      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}
