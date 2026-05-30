import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaChevronLeft, FaRegCalendarAlt, FaRegClock, FaClipboardList, FaFileSignature, FaShieldAlt } from 'react-icons/fa';

const ContestDetails = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [contest, setContest] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ label: '', value: '' });

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
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({
                    label: 'CONTEST BEGINS IN',
                    value: `${days}d ${hours}h ${minutes}m ${seconds}s`
                });
            } else if (now >= start && now <= end) {
                const distance = end - now;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({
                    label: 'CONTEST IS ACTIVE! ENDS IN',
                    value: `${days}d ${hours}h ${minutes}m ${seconds}s`
                });
            } else {
                setTimeLeft({
                    label: 'STATUS',
                    value: 'Contest Has Ended'
                });
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center text-richblack-300 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50"></div>
                <p>Loading Arena parameters...</p>
            </div>
        );
    }

    if (!contest) {
        return <div className="text-white text-center mt-20">Contest parameters not found in database</div>;
    }

    const isRunning = contest.status === 'Running';
    const isUpcoming = contest.status === 'Upcoming';
    const isEnded = contest.status === 'Ended';

    return (
        <div className="w-11/12 max-w-4xl mx-auto text-white mt-24 mb-20 p-4 min-h-[calc(100vh-8rem)]">
            {/* Back to Contests link */}
            <button 
                onClick={() => navigate('/contests')}
                className="flex items-center gap-2 text-richblack-400 hover:text-yellow-50 font-semibold mb-6 transition-colors duration-200"
            >
                <FaChevronLeft size={12} /> Back to Arena list
            </button>

            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex flex-col gap-8 py-4"
            >

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-richblack-800">
                    <div>
                        <span className="bg-[#b58900]/10 border border-[#b58900]/40 text-yellow-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                            {contest.type}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-richblack-5 mt-3">{contest.title}</h1>
                        <p className="text-richblack-300 text-base md:text-lg mt-2 leading-relaxed">{contest.description}</p>
                    </div>
                </div>

                {/* Countdown Timer Display Card */}
                <div className="relative overflow-hidden bg-gradient-to-r from-richblack-900 to-richblack-950 p-6 rounded-2xl border border-richblack-800 shadow-inner flex flex-col items-center justify-center text-center gap-1.5">
                    <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#12D8FA] uppercase font-mono">
                        {timeLeft.label}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider font-mono text-white select-none drop-shadow-[0_0_12px_rgba(18,216,250,0.2)]">
                        {timeLeft.value}
                    </h2>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                    <div className="bg-richblack-900/60 p-4 rounded-xl border border-richblack-800 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-900/20 text-[#12D8FA]">
                            <FaRegCalendarAlt size={20} />
                        </div>
                        <div>
                            <span className="block text-[10px] text-richblack-400 font-bold uppercase">Start Time</span>
                            <span className="text-sm font-semibold text-richblack-5">{new Date(contest.startTime).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-richblack-900/60 p-4 rounded-xl border border-richblack-800 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-pink-900/20 text-pink-300">
                            <FaRegCalendarAlt size={20} />
                        </div>
                        <div>
                            <span className="block text-[10px] text-richblack-400 font-bold uppercase">End Time</span>
                            <span className="text-sm font-semibold text-richblack-5">{new Date(contest.endTime).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-richblack-900/60 p-4 rounded-xl border border-richblack-800 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-900/20 text-yellow-100">
                            <FaRegClock size={20} />
                        </div>
                        <div>
                            <span className="block text-[10px] text-richblack-400 font-bold uppercase">Duration</span>
                            <span className="text-sm font-semibold text-richblack-5">{contest.duration} Minutes</span>
                        </div>
                    </div>
                </div>

                {/* Rules Details Section */}
                {contest.rules && (
                    <div className="bg-richblack-900/30 p-6 rounded-2xl border border-richblack-800/80">
                        <div className="flex items-center gap-2 mb-4 text-richblack-100 font-bold text-lg border-b border-richblack-800 pb-2">
                            <FaClipboardList className="text-[#A6FFCB]" />
                            <span>Rules & Regulations</span>
                        </div>
                        <p className="text-richblack-300 text-sm leading-relaxed whitespace-pre-line font-sans font-medium">
                            {contest.rules}
                        </p>
                    </div>
                )}

                {/* Anti-cheat Notice Badge */}
                <div className="flex items-start gap-3 bg-red-950/20 border border-red-900/40 p-4 rounded-xl text-xs text-red-300">
                    <FaShieldAlt className="mt-0.5 text-red-400 shrink-0" size={16} />
                    <div>
                        <span className="font-bold block uppercase tracking-wider mb-0.5">Axiora Guard Active</span>
                        This contest implements window focus tracking, submission anti-cheat protocols, and tab change monitoring. Attempting to switch tabs or minimize the workspace will trigger a warning.
                    </div>
                </div>

                {/* Action Trigger Button */}
                <div className="pt-4 mt-2">
                    {isCompleted ? (
                        <button
                            onClick={() => navigate(`/contests/${contestId}/report`)}
                            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-black hover:shadow-[0_4px_20px_rgba(255,214,10,0.25)] transition-all duration-300 text-center text-base"
                        >
                            View & Download Performance Certificate
                        </button>
                    ) : !isRegistered && !isEnded ? (
                        <button
                            onClick={handleRegister}
                            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-black hover:shadow-[0_4px_20px_rgba(255,214,10,0.25)] transition-all duration-300 text-center text-base"
                        >
                            Register for Contest
                        </button>
                    ) : isRegistered ? (
                        isUpcoming ? (
                            <button
                                disabled
                                className="w-full py-4 rounded-xl font-bold bg-richblack-800 text-richblack-500 border border-richblack-700 cursor-not-allowed text-center text-base"
                            >
                                Registered (Waiting for Contest start)
                            </button>
                        ) : isRunning ? (
                            <button
                                onClick={() => navigate(`/contest-workspace/${contestId}`)}
                                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-caribbeangreen-400 to-caribbeangreen-500 hover:from-caribbeangreen-300 hover:to-caribbeangreen-400 text-black hover:shadow-[0_4px_20px_rgba(1,248,155,0.25)] transition-all duration-300 text-center text-base"
                            >
                                Enter Contest Workspace
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/contests/${contestId}/report`)}
                                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-black hover:shadow-[0_4px_20px_rgba(255,214,10,0.25)] transition-all duration-300 text-center text-base"
                            >
                                View & Download Performance Certificate
                            </button>
                        )
                    ) : (
                        <button
                            disabled
                            className="w-full py-4 rounded-xl font-bold bg-richblack-800 text-richblack-500 border border-richblack-700 cursor-not-allowed text-center text-base"
                        >
                            Contest Closed
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ContestDetails;
