import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import Img from './../../common/Img';



export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)

  // fetch all users enrolled courses
  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, [])

  // Loading Skeleton
  const sklItem = () => {
    return (
      <div className="flex border border-richblack-700 px-5 py-3 w-full">
        <div className="flex flex-1 gap-x-4 ">
          <div className='h-14 w-14 rounded-lg skeleton '></div>

          <div className="flex flex-col w-[40%] ">
            <p className="h-2 w-[50%] rounded-xl  skeleton"></p>
            <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
          </div>
        </div>

        <div className="flex flex-[0.4] flex-col ">
          <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
          <p className="h-2 w-[40%] rounded-xl skeleton mt-3"></p>
        </div>
      </div>
    )
  }

  // return if data is null
  if (enrolledCourses?.length == 0) {
    return (
      <p className="grid h-[50vh] w-full place-content-center text-center text-richblack-5 text-3xl">
        You have not enrolled in any course yet.
      </p>)
  }



  return (
    <>
      <div className="text-3xl text-richblack-5 font-outfit font-bold text-center sm:text-left mb-8">Enrolled Courses</div>
      {
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="hidden sm:flex rounded-t-2xl bg-richblack-800/60 border border-richblack-700/50 backdrop-blur-md">
            <p className="w-[45%] px-5 py-4 font-semibold text-richblack-200">Course Name</p>
            <p className="w-1/4 px-2 py-4 font-semibold text-richblack-200">Duration</p>
            <p className="flex-1 px-2 py-4 font-semibold text-richblack-200">Progress</p>
          </div>


          {/* loading Skeleton */}
          {!enrolledCourses && <div className="space-y-4 mt-4">
            {sklItem()}
            {sklItem()}
            {sklItem()}
          </div>}

          {/* Course Names */}
          <div className="flex flex-col gap-4 sm:gap-0 sm:block sm:border-x sm:border-richblack-700/50 bg-richblack-900/40 backdrop-blur-md rounded-b-2xl">
            {
              enrolledCourses?.map((course, i, arr) => (
                <div
                  className={`flex flex-col sm:flex-row sm:items-center sm:border-b border-richblack-700/50 hover:bg-richblack-800/40 transition-colors duration-200 bg-richblack-800/30 sm:bg-transparent rounded-2xl sm:rounded-none overflow-hidden group`}
                  key={i}
                >
                  <div
                    className="flex sm:w-[45%] cursor-pointer items-center gap-4 px-5 py-4"
                    onClick={() => {
                      navigate(
                        `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                      )
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl h-16 w-16 min-w-[64px]">
                      <Img
                        src={course.thumbnail}
                        alt="course_img"
                        className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-richblack-5 group-hover:text-blue-300 transition-colors">{course.courseName}</p>
                      <p className="text-xs text-richblack-300 hidden md:block">
                        {course.courseDescription.length > 50
                          ? `${course.courseDescription.slice(0, 50)}...`
                          : course.courseDescription}
                      </p>
                    </div>
                  </div>

                  {/* only for smaller devices */}
                  {/* duration -  progress */}
                  <div className='sm:hidden flex justify-between items-center px-5 py-3 bg-richblack-800/50'>
                    <div className="text-sm font-medium text-richblack-200">{course?.totalDuration}</div>

                    <div className="flex flex-col gap-1 w-1/2">
                      <p className="text-xs font-medium text-richblack-100">Progress: {course.progressPercentage || 0}%</p>
                      <ProgressBar
                        completed={course.progressPercentage || 0}
                        height="6px"
                        isLabelVisible={false}
                        bgColor="linear-gradient(to right, #3b82f6, #ec4899)"
                        baseBgColor="#2c333f"
                      />
                    </div>
                  </div>

                  {/* only for larger devices */}
                  {/* duration -  progress */}
                  <div className="hidden w-1/4 sm:flex px-2 py-4 text-sm font-medium text-richblack-200">{course?.totalDuration}</div>
                  <div className="hidden sm:flex flex-1 flex-col gap-2 px-2 py-4 justify-center pr-8">
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xs font-semibold text-richblack-200">Progress</p>
                      <p className="text-xs font-bold text-blue-300">{course.progressPercentage || 0}%</p>
                    </div>
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="6px"
                      isLabelVisible={false}
                      bgColor="linear-gradient(to right, #3b82f6, #ec4899)"
                      baseBgColor="#2c333f"
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      }
    </>
  )
}