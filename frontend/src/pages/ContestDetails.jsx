import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    FaChevronLeft, 
    FaShieldAlt, 
    FaCheck, 
    FaPlus, 
    FaMinus, 
    FaCalendarAlt, 
    FaClock, 
    FaUsers, 
    FaCode, 
    FaAward, 
    FaCheckCircle 
} from 'react-icons/fa';

const ContestDetails = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    
    const [contest, setContest] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRegistered: 0 });

    const [countdown, setCountdown] = useState({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        label: 'Starts in',
        active: false
    });

    const [openAccordion, setOpenAccordion] = useState(null);

    const fetchContestDetails = async () => {
        setLoading(true);
        try {
            const response = await apiConnector(
                "GET", 
                `${contestEndpoints.GET_CONTEST_DETAILS_API}${contestId}`,
                null,
                token ? { Authorization: `Bearer ${token}` } : null
            );
            if (response?.data?.success) {
                setContest(response.data.data);
                setIsRegistered(response.data.isRegistered);
                setIsCompleted(response.data.isCompleted || false);
                
                // Fetch registered count from leaderboard API helper
                try {
                    const lbRes = await apiConnector("GET", `${contestEndpoints.GET_LEADERBOARD_API}${contestId}/leaderboard`);
                    if (lbRes?.data?.success) {
                        setStats({ totalRegistered: lbRes.data.totalRegistered || 0 });
                    }
                } catch (err) {
                    console.error("Failed to load registration counts:", err);
                }
            }
        } catch (error) {
            console.error("Fetch Contest Details Error:", error);
            toast.error("Failed to load contest details");
        }
        setLoading(false);
    };

    const handleRegister = async () => {
        if (!token) {
            toast.error("Please login to register for contests");
            navigate('/login');
            return;
        }
        try {
            const response = await apiConnector(
                "POST",
                `${contestEndpoints.REGISTER_CONTEST_API}${contestId}`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response?.data?.success) {
                toast.success("Successfully registered!");
                setIsRegistered(true);
                fetchContestDetails();
            } else {
                toast.error(response?.data?.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration Error:", error);
            toast.error(error.response?.data?.message || "Failed to register");
        }
    };

    useEffect(() => {
        fetchContestDetails();
    }, [contestId]);

    // Countdown Timer logic
    useEffect(() => {
        if (!contest) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(contest.startTime).getTime();
            const end = new Date(contest.endTime).getTime();

            if (now < start) {
                const distance = start - now;
                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                setCountdown({ days, hours, minutes, seconds, label: 'CONTEST BEGINS IN', active: false });
            } else if (now >= start && now <= end) {
                const distance = end - now;
                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                setCountdown({ days, hours, minutes, seconds, label: 'CONTEST ACTIVE • ENDS IN', active: true });
            } else {
                setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00', label: 'CONTEST ENDED', active: false });
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center text-richblack-400 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
                <p className="font-mono text-xs tracking-wider">RESOLVING CONTEST PARAMETERS...</p>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white font-mono text-sm">
                CONTEST NOT FOUND IN REGISTER
            </div>
        );
    }

    const isRunning = contest.status === 'Running';
    const isUpcoming = contest.status === 'Upcoming';
    const isEnded = contest.status === 'Ended';

    // Accordion rules content definition
    const accordionData = [
        {
            title: "Allowed Languages",
            content: "JavaScript, Python, C++, Java, and Go are supported in the live workspace. Code compilation happens dynamically on the secure compiler environment."
        },
        {
            title: "Submission Limits",
            content: "Each participant is permitted up to 3 submission attempts per question to avoid brute-forcing solutions. Only the highest-scored choice is accounted for rankings."
        },
        {
            title: "Scoring System",
            content: "Scores are computed dynamically based on the accuracy of answers (1 point per correct answer/test-case pass). Ties are resolved automatically using solve-completion times."
        },
        {
            title: "Contest Rules",
            content: "Calculators and local notes are permitted. Plagiarism, sharing code snippets, or accessing external websites during the active assessment is strictly prohibited."
        }
    ];

    return (
        <div className="min-h-screen bg-[#030712] font-sans antialiased text-white selection:bg-cyan-500/30 selection:text-cyan-200">
            
            <div className="w-11/12 max-w-4xl mx-auto pt-28 pb-24">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/contests')}
                    className="group flex items-center gap-2 text-xs font-mono tracking-wider text-richblack-400 hover:text-white mb-8 transition-colors duration-200"
                >
                    <FaChevronLeft size={10} className="group-hover:-translate-x-0.5 transition-transform duration-200" /> 
                    BACK TO ARENA LIST
                </button>

                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-4 mb-8"
                >
                    {/* Contest Badge / Status Tag */}
                    <div className="flex items-center gap-3">
                        {isRunning ? (
                            <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Now
                            </span>
                        ) : isUpcoming ? (
                            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full">
                                Upcoming
                            </span>
                        ) : (
                            <span className="bg-richblack-800 border border-richblack-700 text-richblack-400 text-[10px] font-mono tracking-widest font-bold uppercase px-3 py-1 rounded-full">
                                Ended
                            </span>
                        )}
                        <span className="text-[10px] text-richblack-400 font-mono uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
                            {contest.type}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        {contest.title}
                    </h1>
                    <p className="text-base text-richblack-300 max-w-2xl leading-relaxed">
                        {contest.description || "Solve algorithmic problems and compete against participants worldwide."}
                    </p>
                </motion.div>

                {/* Primary Focal Countdown Timer */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-[#0B1220] border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.4)] mb-8"
                >
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#06b6d4] uppercase font-mono mb-4">
                        {countdown.label}
                    </span>

                    {/* Segmented Digit Countdown Grid */}
                    <div className="flex items-center gap-2 md:gap-4 font-mono select-none">
                        <div className="flex flex-col items-center">
                            <div className={`text-4xl md:text-5xl font-extrabold bg-[#030712] border border-white/[0.06] rounded-xl px-4 py-3.5 min-w-[65px] md:min-w-[75px] text-center shadow-[0_0_20px_rgba(6,182,212,0.06)] text-white ${countdown.active ? 'text-cyan-400' : ''}`}>
                                {countdown.days}
                            </div>
                            <span className="text-[9px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Days</span>
                        </div>
                        <span className="text-2xl md:text-3xl font-extrabold text-white/30 mb-5">:</span>
                        <div className="flex flex-col items-center">
                            <div className={`text-4xl md:text-5xl font-extrabold bg-[#030712] border border-white/[0.06] rounded-xl px-4 py-3.5 min-w-[65px] md:min-w-[75px] text-center shadow-[0_0_20px_rgba(6,182,212,0.06)] text-white ${countdown.active ? 'text-cyan-400' : ''}`}>
                                {countdown.hours}
                            </div>
                            <span className="text-[9px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Hours</span>
                        </div>
                        <span className="text-2xl md:text-3xl font-extrabold text-white/30 mb-5">:</span>
                        <div className="flex flex-col items-center">
                            <div className={`text-4xl md:text-5xl font-extrabold bg-[#030712] border border-white/[0.06] rounded-xl px-4 py-3.5 min-w-[65px] md:min-w-[75px] text-center shadow-[0_0_20px_rgba(6,182,212,0.06)] text-white ${countdown.active ? 'text-cyan-400' : ''}`}>
                                {countdown.minutes}
                            </div>
                            <span className="text-[9px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Minutes</span>
                        </div>
                        <span className="text-2xl md:text-3xl font-extrabold text-white/30 mb-5">:</span>
                        <div className="flex flex-col items-center">
                            <div className={`text-4xl md:text-5xl font-extrabold bg-[#030712] border border-white/[0.06] rounded-xl px-4 py-3.5 min-w-[65px] md:min-w-[75px] text-center shadow-[0_0_20px_rgba(6,182,212,0.06)] text-white ${countdown.active ? 'text-cyan-400' : ''}`}>
                                {countdown.seconds}
                            </div>
                            <span className="text-[9px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Seconds</span>
                        </div>
                    </div>
                </motion.div>

                {/* Primary & Secondary Action CTAs */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="flex flex-col sm:flex-row gap-3 mb-8 w-full"
                >
                    {isCompleted ? (
                        <button
                            onClick={() => navigate(`/contests/${contestId}/report`)}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 text-center text-sm uppercase tracking-wider"
                        >
                            View & Download Performance Certificate
                        </button>
                    ) : !isRegistered && !isEnded ? (
                        <button
                            onClick={handleRegister}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 text-center text-sm uppercase tracking-wider"
                        >
                            Register for Contest
                        </button>
                    ) : isRegistered ? (
                        isUpcoming ? (
                            <button
                                disabled
                                className="flex-1 py-3.5 rounded-xl font-bold bg-richblack-800 text-richblack-500 border border-white/[0.04] cursor-not-allowed text-center text-sm uppercase tracking-wider"
                            >
                                Registered (Waiting to Start)
                            </button>
                        ) : isRunning ? (
                            <button
                                onClick={() => navigate(`/contest-workspace/${contestId}`)}
                                className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300 text-center text-sm uppercase tracking-wider"
                            >
                                Enter Contest
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/contests/${contestId}/report`)}
                                className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 text-center text-sm uppercase tracking-wider"
                            >
                                View Performance Certificate
                            </button>
                        )
                    ) : (
                        <button
                            disabled
                            className="flex-1 py-3.5 rounded-xl font-bold bg-richblack-800 text-richblack-500 border border-white/[0.04] cursor-not-allowed text-center text-sm uppercase tracking-wider"
                        >
                            Contest Closed
                        </button>
                    )}

                    {/* Secondary Leaderboard CTA */}
                    <button
                        onClick={() => navigate(`/contests/${contestId}/leaderboard`)}
                        className="py-3.5 px-8 rounded-xl font-bold bg-transparent text-richblack-200 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-300 text-center text-sm font-mono tracking-wider uppercase"
                    >
                        View Leaderboard
                    </button>
                </motion.div>

                {/* Contest Meta Grid */}
                <motion.div 
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
                        }
                    }}
                    className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8"
                >
                    {/* Start Time */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="bg-[#0B1220] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-cyan-400">
                            <FaCalendarAlt size={11} />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-richblack-400">Start Time</span>
                        </div>
                        <span className="text-[11px] font-medium leading-normal text-white">{new Date(contest.startTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                    </motion.div>

                    {/* End Time */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="bg-[#0B1220] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-violet-400">
                            <FaCalendarAlt size={11} />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-richblack-400">End Time</span>
                        </div>
                        <span className="text-[11px] font-medium leading-normal text-white">{new Date(contest.endTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                    </motion.div>

                    {/* Duration */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="bg-[#0B1220] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-yellow-50">
                            <FaClock size={11} />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-richblack-400">Duration</span>
                        </div>
                        <span className="text-xs font-bold leading-normal text-white">{contest.duration} Min</span>
                    </motion.div>

                    {/* Participants */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="bg-[#0B1220] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-emerald-400">
                            <FaUsers size={11} />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-richblack-400">Participants</span>
                        </div>
                        <span className="text-xs font-bold leading-normal text-white">{stats.totalRegistered} Active</span>
                    </motion.div>

                    {/* Problems Count */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="bg-[#0B1220] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-cyan-400">
                            <FaCode size={11} />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-richblack-400">Problems</span>
                        </div>
                        <span className="text-xs font-bold leading-normal text-white">{contest.problems?.length || 0} Task{contest.problems?.length === 1 ? '' : 's'}</span>
                    </motion.div>

                    {/* Prize Pool */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="bg-[#0B1220] border border-white/[0.08] p-4 rounded-xl flex flex-col gap-1.5"
                    >
                        <div className="flex items-center gap-1.5 text-[#e5c158]">
                            <FaAward size={11} />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-richblack-400">Prize Pool</span>
                        </div>
                        <span className="text-xs font-bold leading-normal text-[#e5c158]">Badges & XP</span>
                    </motion.div>
                </motion.div>

                {/* Rules Section (Collapsible Accordion) */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className="bg-[#0B1220] border border-white/[0.08] rounded-2xl overflow-hidden mb-8"
                >
                    <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Guidelines</span>
                    </div>

                    <div className="divide-y divide-white/[0.06]">
                        {accordionData.map((item, idx) => {
                            const isOpen = openAccordion === idx;
                            return (
                                <div key={idx} className="w-full">
                                    <button
                                        onClick={() => toggleAccordion(idx)}
                                        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors focus:outline-none"
                                    >
                                        <span className="text-sm font-semibold text-richblack-100">{item.title}</span>
                                        {isOpen ? <FaMinus size={10} className="text-cyan-400" /> : <FaPlus size={10} className="text-richblack-500" />}
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 text-sm text-richblack-300 leading-relaxed font-sans font-medium">
                                                    {item.content}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Anti-Cheat Section (Security Panel Checklist) */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-[#0B1220] border border-white/[0.08] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#030712] border border-white/[0.08] text-[#FF5A5F] rounded-xl">
                            <FaShieldAlt size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <span className="block text-xs font-mono font-bold tracking-widest text-[#FF5A5F] uppercase">Protected Environment</span>
                            <span className="block text-xs text-richblack-400 mt-1 leading-relaxed max-w-md">
                                Axiora Guard validates secure compilation integrity. Attempting external window changes triggers automated flags.
                            </span>
                        </div>
                    </div>

                    {/* Features Checklist */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-mono text-richblack-300 border-t md:border-t-0 border-white/[0.06] pt-4 md:pt-0">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-cyan-400" />
                            <span>Focus Monitoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-cyan-400" />
                            <span>Fullscreen Lock</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-cyan-400" />
                            <span>Submit Protection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-cyan-400" />
                            <span>Session Tracking</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ContestDetails;
