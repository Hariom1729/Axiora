import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { useDispatch } from 'react-redux';

import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import TimelineSection from '../components/core/HomePage/TimelineSection'
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ExploreMore from '../components/core/HomePage/ExploreMore'
import ReviewSlider from '../components/common/ReviewSlider'
import Course_Slider from '../components/core/Catalog/Course_Slider'

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchCourseCategories } from '../services/operations/courseDetailsAPI'

import { MdOutlineRateReview } from 'react-icons/md'
import { FaArrowRight } from "react-icons/fa"

import { motion } from 'framer-motion'
import { fadeIn, } from './../components/common/motionFrameVarients';

// background random images
import backgroundImg1 from '../assets/Images/random bg img/coding bg1.jpg'
import backgroundImg2 from '../assets/Images/random bg img/coding bg2.jpg'
import backgroundImg3 from '../assets/Images/random bg img/coding bg3.jpg'
import backgroundImg4 from '../assets/Images/random bg img/coding bg4.jpg'
import backgroundImg5 from '../assets/Images/random bg img/coding bg5.jpg'
import backgroundImg6 from '../assets/Images/random bg img/coding bg6.jpeg'
import backgroundImg7 from '../assets/Images/random bg img/coding bg7.jpg'
import backgroundImg8 from '../assets/Images/random bg img/coding bg8.jpeg'
import backgroundImg9 from '../assets/Images/random bg img/coding bg9.jpg'
import backgroundImg10 from '../assets/Images/random bg img/coding bg10.jpg'
import backgroundImg111 from '../assets/Images/random bg img/coding bg11.jpg'


const randomImges = [
    backgroundImg1,
    backgroundImg2,
    backgroundImg3,
    backgroundImg4,
    backgroundImg5,
    backgroundImg6,
    backgroundImg7,
    backgroundImg8,
    backgroundImg9,
    backgroundImg10,
    backgroundImg111,
];

// hardcoded



const Home = () => {

    // get background random images
    const [backgroundImg, setBackgroundImg] = useState(null);

    useEffect(() => {
        const bg = randomImges[Math.floor(Math.random() * randomImges.length)]
        setBackgroundImg(bg);
    }, [])

    // console.log('bg ==== ', backgroundImg)

    // get courses data
    const [CatalogPageData, setCatalogPageData] = useState(null);
    const [categoryID, setCategoryID] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const loadCategoryId = async () => {
            const categories = await fetchCourseCategories();
            if (categories?.length > 0) {
                setCategoryID(categories[0]._id);
            }
        };
        loadCategoryId();
    }, []);

    useEffect(() => {
        const fetchCatalogPageData = async () => {
            const result = await getCatalogPageData(categoryID, dispatch);
            setCatalogPageData(result);
        };
        if (categoryID) {
            fetchCatalogPageData();
        }
    }, [categoryID, dispatch])


    // console.log('================ CatalogPageData?.selectedCourses ================ ', CatalogPageData)


    return (
        <React.Fragment>
            {/* Background Blob Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* background random image */}
            <div className="absolute top-0 w-full h-[650px] -z-20">
                <div className="w-full h-full absolute top-0 left-0 opacity-[0.15] overflow-hidden mix-blend-overlay">
                    <img src={backgroundImg} alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute left-0 bottom-0 w-full h-full bg-gradient-to-t from-richblack-900 via-richblack-900/80 to-transparent"></div>
                </div>
            </div>

            <div className='relative z-10'>
                {/*Section1 Hero */}
                <div className='relative min-h-[650px] justify-center mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white pt-20 pb-10'>

                    <Link to={"/signup"}>
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className='z-0 group p-[1px] mx-auto rounded-full bg-gradient-to-r from-blue-500 to-pink-500 font-bold text-richblack-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]'>
                            <div className='flex flex-row items-center gap-2 rounded-full px-8 py-2 bg-richblack-900/90 backdrop-blur-sm transition-all duration-300 group-hover:bg-richblack-900/70 text-sm'>
                                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">Become an Instructor</p>
                                <FaArrowRight className="text-pink-400" />
                            </div>
                        </motion.div>
                    </Link>

                    <motion.div
                        variants={fadeIn('up', 0.2)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: true }}
                        className='text-center text-4xl lg:text-6xl font-bold font-outfit mt-10 tracking-tight'
                    >
                        Empower Your Future with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB]">Coding Skills</span>
                    </motion.div>

                    <motion.div
                        variants={fadeIn('up', 0.4)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: true }}
                        className='mt-6 w-[90%] md:w-[70%] text-center text-base lg:text-xl text-richblack-300 leading-relaxed'
                    >
                        With our online courses, learn at your own pace from anywhere. Get access to a wealth of resources, hands-on projects, and personalized feedback from industry experts.
                    </motion.div>


                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className='flex flex-row gap-6 mt-12'>
                        <Link to="/signup" className="rounded-xl bg-yellow-50 hover:bg-yellow-100 py-3 px-8 font-semibold text-richblack-900 shadow-[0_0_20px_rgba(255,214,10,0.3)] hover:shadow-[0_0_30px_rgba(255,214,10,0.5)] transition-all duration-300 transform hover:-translate-y-1">
                            Learn More
                        </Link>

                        <Link to="/login" className="rounded-xl bg-richblack-800/80 backdrop-blur-md border border-richblack-700 hover:bg-richblack-800 py-3 px-8 font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:border-richblack-500">
                            Book a Demo
                        </Link>
                    </motion.div>
                </div>

                {/* animated code */}
                <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between'>
                    {/* Code block 1 */}
                    <div className=''>
                        <CodeBlocks
                            position={"lg:flex-row"}
                            heading={
                                <div className='text-3xl lg:text-4xl font-semibold'>
                                    Unlock Your
                                    <HighlightText text={"coding potential "} />
                                    with our online courses
                                </div>
                            }
                            subheading={
                                "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
                            }
                            ctabtn1={
                                {
                                    btnText: "try it yourself",
                                    linkto: "/signup",
                                    active: true,
                                }
                            }
                            ctabtn2={
                                {
                                    btnText: "learn more",
                                    linkto: "/login",
                                    active: false,
                                }
                            }

                            codeblock={`<<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n</head>\n<body>\n<h1><ahref="/">Header</a>\n</h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</a><ahref="three/">Three</a>\n</nav>`}
                            codeColor={"text-yellow-25"}
                            backgroundGradient={"code-block1-grad"}
                        />
                    </div>


                    {/* Code block 2 */}
                    <div>
                        <CodeBlocks
                            position={"lg:flex-row-reverse"}
                            heading={
                                <div className="w-[100%] text-3xl lg:text-4xl font-semibold lg:w-[50%]">
                                    Start
                                    <HighlightText text={"coding in seconds"} />
                                </div>
                            }
                            subheading={
                                "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
                            }
                            ctabtn1={{
                                btnText: "Continue Lesson",
                                link: "/signup",
                                active: true,
                            }}
                            ctabtn2={{
                                btnText: "Learn More",
                                link: "/signup",
                                active: false,
                            }}
                            codeColor={"text-white"}
                            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
                            backgroundGradient={"code-block2-grad"}
                        />
                    </div>

                    {/* course slider */}
                    <div className='mx-auto box-content w-full max-w-maxContentTab px- py-12 lg:max-w-maxContent'>
                        <h2 className='text-white mb-6 text-2xl '>
                            Popular Picks for You 🏆
                        </h2>
                        <Course_Slider Courses={CatalogPageData?.selectedCategory?.courses} />
                    </div>
                    <div className=' mx-auto box-content w-full max-w-maxContentTab px- py-12 lg:max-w-maxContent'>
                        <h2 className='text-white mb-6 text-2xl '>
                            Top Enrollments Today 🔥
                        </h2>
                        <Course_Slider Courses={CatalogPageData?.mostSellingCourses} />
                    </div>


                    <ExploreMore />
                </div>

                {/*Section 2  */}
                <div className='bg-pure-greys-5 text-richblack-700 '>
                    <div className='homepage_bg h-[310px]'>
                        <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
                            <div className='h-[150px]'></div>
                            <div className='flex flex-row gap-7 text-white '>
                                <CTAButton active={true} linkto={"/signup"}>
                                    <div className='flex items-center gap-3' >
                                        Explore Full Catalog
                                        <FaArrowRight />
                                    </div>
                                </CTAButton>
                                <CTAButton active={false} linkto={"/signup"}>
                                    <div>
                                        Learn more
                                    </div>
                                </CTAButton>
                            </div>
                        </div>
                    </div>

                    <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
                        <div className='flex flex-col lg:flex-row gap-5 mb-10 mt-[95px]'>
                            <div className='text-3xl lg:text-4xl font-semibold w-full lg:w-[45%]'>
                                Get the Skills you need for a
                                <HighlightText text={"Job that is in demand"} />
                            </div>

                            <div className='flex flex-col gap-10 w-full lg:w-[40%] items-start'>
                                <div className='text-[16px]'>
                                    The modern Axiora is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                                </div>
                                <CTAButton active={true} linkto={"/signup"}>
                                    <div>
                                        Learn more
                                    </div>
                                </CTAButton>
                            </div>
                        </div>


                        {/* leadership */}
                        <TimelineSection />

                        <LearningLanguageSection />

                    </div>

                </div>


                {/*Section 3 */}
                <div className='mt-14 w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-8 first-letter bg-richblack-900 text-white'>
                    <InstructorSection />

                    {/* Reviws from Other Learner */}
                    <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
                        Reviews from other learners <MdOutlineRateReview className='text-yellow-25' />
                    </h1>
                    <ReviewSlider />
                </div>

                {/*Footer */}
                <Footer />
            </div >
        </React.Fragment>
    )
}

export default Home
