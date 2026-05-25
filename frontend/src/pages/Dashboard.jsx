import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from "react-router-dom"
import Sidebar from '../components/core/Dashboard/Sidebar'
import Loading from '../components/common/Loading'

const Dashboard = () => {

    const { loading: authLoading } = useSelector((state) => state.auth);
    const { loading: profileLoading } = useSelector((state) => state.profile);


    if (profileLoading || authLoading) {
        return (
            <div className='mt-10'>
                <Loading />
            </div>
        )
    }
    // Scroll to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    return (
        <div className='relative flex min-h-[calc(100vh-3.5rem)] bg-richblack-900'>
            {/* Background Blob Effects for Dashboard */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <div className="z-10 h-full fixed top-14 left-0">
                <Sidebar />
            </div>

            <div className='h-[calc(100vh-3.5rem)] overflow-auto w-full sm:ml-[220px] relative z-10'>
                <div className='mx-auto w-11/12 max-w-[1000px] py-10 px-2 sm:px-6'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
