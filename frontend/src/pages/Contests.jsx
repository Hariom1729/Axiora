import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { FaTrophy, FaRegClock, FaCode, FaRegCalendarAlt, FaChevronRight } from 'react-icons/fa';

const Contests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await apiConnector("GET", contestEndpoints.GET_ALL_CONTESTS_API);
                if (response?.data?.success) {
                    setContests(response.data.data);
                }
            } catch (error) {
                console.error("Could not fetch contests:", error);
            }
            setLoading(false);
        };
        fetchContests();
    }, []);

    const filteredContests = contests.filter(contest => {
        if (activeTab === 'All') return true;
        return contest.status === activeTab;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Running':
                return (
                    <div className="flex items-center gap-1.5 bg-caribbeangreen-950/40 border border-caribbeangreen-400/30 text-caribbeangreen-300 px-3 py-1 rounded-full text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-caribbeangreen-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-caribbeangreen-500"></span>
                        </span>
                        Live Now
                    </div>
                );
            case 'Upcoming':
                return (
                    <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                        <FaRegCalendarAlt size={10} />
                        Upcoming
                    </div>
                );
            case 'Ended':
                return (
                    <div className="flex items-center gap-1.5 bg-richblack-800 border border-richblack-700 text-richblack-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Ended
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-11/12 max-w-maxContent mx-auto text-white mt-12 mb-20 p-4 min-h-[calc(100vh-8rem)]">
            {/* Header Banner Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-richblack-900 via-richblack-800 to-richblack-900 border border-richblack-800 p-8 md:p-12 mb-10 shadow-2xl flex flex-col gap-3"
            >
                {/* Background decorative glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#12D8FA] opacity-10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#A6FFCB] opacity-10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center gap-3 text-yellow-50 font-semibold tracking-wider text-xs uppercase">
                    <FaTrophy className="animate-bounce text-yellow-100" />
                    Axiora Arena
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text">
                    Competitive Programming
                </h1>
                <p className="text-richblack-300 text-base md:text-lg max-w-2xl leading-relaxed mt-1">
                    Join live assessments, tackle algorithmic challenges, earn ranking cards, and benchmark your progress against the community.
                </p>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex border-b border-richblack-800 mb-8 overflow-x-auto gap-2 pb-px scrollbar-none">
                {['All', 'Running', 'Upcoming', 'Ended'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 relative whitespace-nowrap ${
                            activeTab === tab
                                ? 'text-yellow-50 border-yellow-50'
                                : 'text-richblack-400 border-transparent hover:text-richblack-200'
                        }`}
                    >
                        {tab === 'All' ? 'All Arena' : tab}
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeTabGlow"
                                className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-yellow-50 shadow-[0_0_8px_rgba(255,214,10,0.8)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Contest Cards Grid */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-richblack-400 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-50"></div>
                            <span>Fetching live arena data...</span>
                        </div>
                    ) : filteredContests.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-richblack-400 bg-richblack-800/20 rounded-2xl border border-dashed border-richblack-800">
                            No contests available in this category. Check back soon!
                        </div>
                    ) : (
                        filteredContests.map((contest) => (
                            <motion.div 
                                key={contest._id}
                                whileHover={{ y: -6, scale: 1.01 }}
                                className="group relative bg-gradient-to-b from-richblack-800/80 to-richblack-900/90 p-6 rounded-2xl border border-richblack-800 hover:border-richblack-700 transition-all duration-300 flex flex-col justify-between shadow-lg overflow-hidden"
                            >
                                {/* Glowing top border on hover */}
                                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-50 to-[#b58900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div>
                                    {/* Badge Header */}
                                    <div className="flex justify-between items-center mb-5">
                                        {getStatusBadge(contest.status)}
                                        <span className="text-richblack-400 text-xs font-mono uppercase bg-richblack-800 px-2.5 py-0.5 rounded border border-richblack-700">
                                            {contest.type}
                                        </span>
                                    </div>

                                    {/* Contest Info */}
                                    <h2 className="text-xl font-bold group-hover:text-yellow-50 transition-colors duration-300 mb-2.5">
                                        {contest.title}
                                    </h2>
                                    <p className="text-richblack-400 text-sm mb-6 line-clamp-2 leading-relaxed font-sans">
                                        {contest.description}
                                    </p>

                                    {/* Metadata Footer */}
                                    <div className="flex items-center gap-5 text-xs text-richblack-300 mb-6 pt-4 border-t border-richblack-800/60 font-mono">
                                        <div className="flex items-center gap-1.5">
                                            <FaRegClock className="text-yellow-100" />
                                            <span>{contest.duration} Mins</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FaCode className="text-[#12D8FA]" />
                                            <span>{contest.problems?.length || 0} Challenge{contest.problems?.length === 1 ? '' : 's'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigate Button */}
                                <Link 
                                    to={`/contests/${contest._id}`}
                                    className="w-full flex items-center justify-center gap-2 bg-richblack-800 hover:bg-yellow-50 hover:text-black py-3 rounded-xl font-bold transition-all duration-300 border border-richblack-700 hover:border-transparent group-hover:shadow-[0_4px_16px_rgba(255,214,10,0.15)] text-sm"
                                >
                                    {contest.status === 'Running' ? 'Enter Workspace' : 'View Arena Details'}
                                    <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Contests;
