import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

// import CourseCard from "../components/Catalog/CourseCard"
// import CourseSlider from "../components/Catalog/CourseSlider"
import Footer from "../components/common/Footer"
import Course_Card from '../components/core/Catalog/Course_Card'
import Course_Slider from "../components/core/Catalog/Course_Slider"
import Loading from './../components/common/Loading';

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchCourseCategories } from './../services/operations/courseDetailsAPI';




function Catalog() {

    const { catalogName } = useParams()
    const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null)
    const [categoryId, setCategoryId] = useState("")
    const [loading, setLoading] = useState(false);

    // Fetch All Categories
    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetchCourseCategories();
                const category_id = res.filter(
                    (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
                )[0]._id
                setCategoryId(category_id)
            } catch (error) {
                console.log("Could not fetch Categories.", error)
            }
        })()
    }, [catalogName])


    useEffect(() => {
        if (categoryId) {
            ; (async () => {
                setLoading(true)
                try {
                    const res = await getCatalogPageData(categoryId)
                    setCatalogPageData(res)
                } catch (error) {
                    console.log(error)
                }
                setLoading(false)
            })()
        }
    }, [categoryId])

    // console.log('======================================= ', catalogPageData)
    // console.log('categoryId ==================================== ', categoryId)

    if (loading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <Loading />
            </div>
        )
    }
    if (!loading && !catalogPageData) {
        return (
            <div className="text-white text-4xl flex justify-center items-center mt-[20%]">
                No Courses found for selected Category
            </div>)
    }



    return (
        <div className="bg-richblack-900 min-h-screen">
            {/* Hero Section */}
            <div className="relative box-content bg-richblack-800 px-4 py-16 overflow-hidden">
                {/* Background blobls */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
                    <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
                    <p className="text-sm text-richblack-300 font-medium tracking-wide">
                        {`Home / Catalog / `}
                        <span className="text-yellow-50">
                            {catalogPageData?.selectedCategory?.name}
                        </span>
                    </p>
                    <p className="text-4xl md:text-5xl font-outfit font-bold text-richblack-5">
                        {catalogPageData?.selectedCategory?.name}
                    </p>
                    <p className="max-w-[870px] text-lg text-richblack-200 leading-relaxed">
                        {catalogPageData?.selectedCategory?.description}
                    </p>
                </div>
            </div>

            {/* Section 1 */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-16 lg:max-w-maxContent">
                <div className="text-3xl font-bold font-outfit text-richblack-5 mb-8">Courses to get you started</div>
                <div className="my-4 flex border-b border-b-richblack-700/50 text-sm font-medium">
                    <p
                        className={`px-4 py-3 transition-all duration-300 ${active === 1
                            ? "border-b-2 border-b-yellow-50 text-yellow-50 bg-richblack-800/40"
                            : "text-richblack-200 hover:text-richblack-50 hover:bg-richblack-800/20"
                            } cursor-pointer rounded-t-lg`}
                        onClick={() => setActive(1)}
                    >
                        Most Popular
                    </p>
                    <p
                        className={`px-4 py-3 transition-all duration-300 ${active === 2
                            ? "border-b-2 border-b-yellow-50 text-yellow-50 bg-richblack-800/40"
                            : "text-richblack-200 hover:text-richblack-50 hover:bg-richblack-800/20"
                            } cursor-pointer rounded-t-lg`}
                        onClick={() => setActive(2)}
                    >
                        New
                    </p>
                </div>
                <div className="mt-8">
                    <Course_Slider
                        Courses={catalogPageData?.selectedCategory?.courses}
                    />
                </div>
            </div>

            {/* Section 2 */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-16 lg:max-w-maxContent">
                <div className="text-3xl font-bold font-outfit text-richblack-5 mb-8">
                    Top courses in {catalogPageData?.differentCategory?.name}
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.differentCategory?.courses}
                    />
                </div>
            </div>

            {/* Section 3 */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-16 lg:max-w-maxContent">
                <div className="text-3xl font-bold font-outfit text-richblack-5 mb-8">Frequently Bought</div>
                <div className="py-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {catalogPageData?.mostSellingCourses
                            ?.slice(0, 4)
                            .map((course, i) => (
                                <Course_Card course={course} key={i} Height={"h-[300px]"} />
                            ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Catalog
