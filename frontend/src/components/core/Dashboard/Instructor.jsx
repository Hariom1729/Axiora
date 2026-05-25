import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"
import Img from './../../common/Img';



export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])


  // get Instructor Data
  useEffect(() => {
    ; (async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      // console.log('INSTRUCTOR_API_RESPONSE.....', instructorApiData)
      if (instructorApiData.length) setInstructorData(instructorApiData)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)

  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)


  // skeleton loading
  const skItem = () => {
    return (
      <div className="mt-5 w-full flex flex-col justify-between  rounded-xl ">
        <div className="flex border p-4 border-richblack-600 ">
          <div className="w-full">
            <p className="w-[100px] h-4 rounded-xl skeleton"></p>
            <div className="mt-3 flex gap-x-5">
              <p className="w-[200px] h-4 rounded-xl skeleton"></p>
              <p className="w-[100px] h-4 rounded-xl skeleton"></p>
            </div>

            <div className="flex justify-center items-center flex-col">
              <div className="w-[80%] h-24 rounded-xl mt-5 skeleton"></div>
              {/* circle */}
              <div className="w-60 h-60 rounded-full  mt-4 grid place-items-center skeleton"></div>
            </div>
          </div>
          {/* right column */}
          <div className="sm:flex hidden min-w-[250px] flex-col rounded-xl p-6 skeleton"></div>
        </div>

        {/* bottom row */}
        <div className="flex flex-col gap-y-6  mt-5">
          <div className="flex justify-between">
            <p className="text-lg font-bold text-richblack-5 pl-5">Your Courses</p>
            <Link to="/dashboard/my-courses">
              <p className="text-xs font-semibold text-yellow-50 hover:underline pr-5">View All</p>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row  gap-6 ">
            <p className=" h-[201px] w-full rounded-xl  skeleton"></p>
            <p className=" h-[201px] w-full rounded-xl  skeleton"></p>
            <p className=" h-[201px] w-full rounded-xl  skeleton"></p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-5 text-center sm:text-left">
          Hii {user?.firstName} 👋
        </h1>
        <p className="font-medium text-richblack-200 text-center sm:text-left">
          Let's start something new
        </p>
      </div>


      {loading ? (
        <div>
          {skItem()}
        </div>
      )
        :
        courses.length > 0 ? (
          <div>
            <div className="my-4 flex flex-col md:flex-row h-auto md:h-[450px] gap-6">
              {/* Render chart / graph */}
              {totalAmount > 0 || totalStudents > 0 ? (
                <div className="w-full md:w-2/3 h-full rounded-2xl bg-richblack-800/40 border border-richblack-700/50 backdrop-blur-md p-6 shadow-xl">
                    <InstructorChart courses={instructorData} />
                </div>
              ) : (
                <div className="flex-1 rounded-2xl bg-richblack-800/40 border border-richblack-700/50 backdrop-blur-md p-6 shadow-xl flex flex-col justify-center items-center">
                  <p className="text-lg font-bold text-richblack-5">Visualize</p>
                  <p className="mt-4 text-xl font-medium text-richblack-50">
                    Not Enough Data To Visualize
                  </p>
                </div>
              )}

              {/* left column */}
              {/* Total Statistics */}
              <div className="flex min-w-[250px] flex-col rounded-2xl bg-richblack-800/40 border border-richblack-700/50 backdrop-blur-md p-6 shadow-xl w-full md:w-1/3">
                <p className="text-xl font-bold text-richblack-5 mb-6 border-b border-richblack-700 pb-2">Statistics</p>
                <div className="space-y-6 flex-1 flex flex-col justify-around">
                  <div className="group">
                    <p className="text-sm font-medium text-richblack-200 uppercase tracking-wider mb-1">Total Courses</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 transition-transform group-hover:scale-105 origin-left">
                      {courses.length}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-richblack-200 uppercase tracking-wider mb-1">Total Students</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 transition-transform group-hover:scale-105 origin-left">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-richblack-200 uppercase tracking-wider mb-1">Total Income</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 transition-transform group-hover:scale-105 origin-left">
                      Rs. {totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Render 3 courses */}
            <div className="rounded-md bg-richblack-800 p-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-richblack-5">Your Courses</p>
                <Link to="/dashboard/my-courses">
                  <p className="text-xs font-semibold text-yellow-50 hover:underline">View All</p>
                </Link>
              </div>

              <div className="my-4 flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0 ">
                {courses.slice(0, 3).map((course) => (
                  <div key={course._id} className="sm:w-1/3 flex flex-col items-center justify-center">
                    <Img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-[201px] w-full rounded-2xl object-cover"
                    />

                    <div className="mt-3 w-full">
                      <p className="text-sm font-medium text-richblack-50">
                        {course.courseName}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-xs font-medium text-richblack-300">
                          {course.studentsEnrolled.length} students
                        </p>
                        <p className="text-xs font-medium text-richblack-300">
                          |
                        </p>
                        <p className="text-xs font-medium text-richblack-300">
                          Rs. {course.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-20 rounded-md bg-richblack-800 p-6 py-20">
            <p className="text-center text-2xl font-bold text-richblack-5">
              You have not created any courses yet
            </p>

            <Link to="/dashboard/add-course">
              <p className="mt-1 text-center text-lg font-semibold text-yellow-50">
                Create a course
              </p>
            </Link>
          </div>
        )}
    </div>
  )
}
