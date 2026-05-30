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
                    <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Live Now
                    </div>
                );
            case 'Upcoming':
                return (
                    <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-500/30 text-[#12D8FA] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        <FaRegCalendarAlt size={10} />
                        Upcoming
                    </div>
                );
            case 'Ended':
                return (
                    <div className="flex items-center gap-1.5 bg-[#090a0d] border border-richblack-700 text-richblack-400 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        Ended
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#111317] text-white font-sans antialiased p-6 md:p-12 select-none">
            
            {/* Skeuomorphic Style Injections */}
            <style dangerouslySetInnerHTML={{__html: `
                .metal-container {
                    background: linear-gradient(180deg, #1f2228 0%, #111316 100%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.6);
                }
                .metal-card {
                    background: linear-gradient(180deg, #1a1c21 0%, #0d0f11 100%);
                    border: 1.5px solid #2d3139;
                    box-shadow: inset 0 1px 0px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0,0,0,0.3);
                }
                .metal-card:hover {
                    border-color: #3f4450;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.03);
                }
                .glow-btn-primary {
                    background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%) !important;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 8px rgba(0,0,0,0.4);
                    color: #0d0f11 !important;
                }
                .glow-btn-primary:hover {
                    opacity: 0.95;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.8);
                }
                .glow-btn-secondary {
                    background: linear-gradient(180deg, #242830 0%, #13151b 100%);
                    border: 1px solid #3f4450;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 8px rgba(0,0,0,0.3);
                    color: #ffffff !important;
                }
                .glow-btn-secondary:hover {
                    background: linear-gradient(180deg, #2d323c 0%, #171920 100%);
                    border-color: #555c6c;
                }
            `}} />

            <div className="w-11/12 max-w-6xl mx-auto mt-24 mb-20">
                
                {/* Header Banner Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-2xl metal-container p-8 md:p-10 mb-10 flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2.5 text-yellow-50 font-bold tracking-widest text-[10px] uppercase font-mono">
                        <FaTrophy className="text-yellow-50" />
                        AXIORA CP SYSTEM
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Competitive Programming
                    </h1>
                    <p className="text-sm text-richblack-400 max-w-2xl leading-relaxed">
                        Join live assessments, tackle algorithmic challenges, earn ranking cards, and benchmark your progress against the community.
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex border-b border-[#23272e] mb-8 overflow-x-auto gap-2 pb-px scrollbar-none">
                    {['All', 'Running', 'Upcoming', 'Ended'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 font-semibold text-xs tracking-wider uppercase font-mono transition-all duration-300 border-b-2 relative whitespace-nowrap ${
                                activeTab === tab
                                    ? 'text-white border-white'
                                    : 'text-richblack-500 border-transparent hover:text-richblack-300'
                            }`}
                        >
                            {tab === 'All' ? 'All Arena' : tab}
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="activeTabGlow"
                                    className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Contest Cards Grid */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-richblack-400 gap-3 font-mono text-xs">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-300"></div>
                                <span>RESOLVING LIVE DATA STREAM...</span>
                            </div>
                        ) : filteredContests.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-richblack-500 bg-[#1C1D24]/10 rounded-2xl border border-dashed border-[#23272e] font-mono text-xs uppercase tracking-wider">
                                No active challenges listed in this terminal.
                            </div>
                        ) : (
                            filteredContests.map((contest) => {
                                const isLive = contest.status === 'Running';
                                return (
                                    <motion.div 
                                        key={contest._id}
                                        className="metal-card p-6 rounded-2xl flex flex-col justify-between shadow-lg relative group transition-all duration-300"
                                    >
                                        <div>
                                            {/* Card Status Header */}
                                            <div className="flex justify-between items-center mb-5">
                                                {getStatusBadge(contest.status)}
                                                <span className="text-richblack-400 text-[9px] font-bold font-mono uppercase bg-[#090a0d] border border-richblack-800 px-2 py-0.5 rounded">
                                                    {contest.type}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <h2 className="text-lg font-extrabold text-white mb-2 leading-snug group-hover:text-yellow-50 transition-colors">
                                                {contest.title}
                                            </h2>
                                            <p className="text-richblack-400 text-xs mb-6 line-clamp-2 leading-relaxed font-sans">
                                                {contest.description || "Solve algorithmic challenges dynamically evaluated."}
                                            </p>

                                            {/* Parameters */}
                                            <div className="flex items-center gap-5 text-[10px] text-richblack-400 mb-6 pt-4 border-t border-white/[0.04] font-mono font-bold uppercase">
                                                <div className="flex items-center gap-1.5">
                                                    <FaRegClock className="text-richblack-500" />
                                                    <span>{contest.duration} Min</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <FaCode className="text-richblack-500" />
                                                    <span>{contest.problems?.length || 0} Task{contest.problems?.length === 1 ? '' : 's'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Capsule button trigger */}
                                        <Link 
                                            to={`/contests/${contest._id}`}
                                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wider ${isLive ? 'glow-btn-primary' : 'glow-btn-secondary'}`}
                                        >
                                            {isLive ? 'Enter Workspace' : 'View Arena Details'}
                                            <FaChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Contests;
