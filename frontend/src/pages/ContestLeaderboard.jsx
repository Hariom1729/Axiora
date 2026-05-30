import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { VscChevronLeft } from 'react-icons/vsc';
import { FaUserCheck, FaLaptopCode, FaGift, FaGem, FaTrophy } from 'react-icons/fa';

const ContestLeaderboard = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({ totalRegistered: 0, totalParticipated: 0 });
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

    const fetchLeaderboard = async () => {
        try {
            const response = await apiConnector("GET", `${contestEndpoints.GET_LEADERBOARD_API}${contestId}/leaderboard`);
            if (response?.data?.success) {
                setLeaderboard(response.data.data);
                setStats({
                    totalRegistered: response.data.totalRegistered || 0,
                    totalParticipated: response.data.totalParticipated || 0
                });
            }
        } catch (error) {
            console.error("Fetch Leaderboard Error:", error);
        }
        setLoading(false);
    };

    const fetchContest = async () => {
        try {
            const response = await apiConnector("GET", `${contestEndpoints.GET_CONTEST_DETAILS_API}${contestId}`);
            if (response?.data?.success) {
                setContest(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchContest();
        fetchLeaderboard();

        // Connect socket for real-time updates
        const socket = io(import.meta.env.VITE_APP_BASE_URL.replace('/api/v1', ''));
        socket.emit("join-contest", contestId);
        
        socket.on("leaderboardUpdate", () => {
            console.log("Real-time leaderboard refresh received");
            fetchLeaderboard();
        });

        return () => {
            socket.disconnect();
        };
    }, [contestId]);

    // Countdown Timer logic
    useEffect(() => {
        if (!contest) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(contest.endTime).getTime();

            if (now < end) {
                const distance = end - now;
                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center text-richblack-300 gap-4 mt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50"></div>
                <p>Retrieving standings room...</p>
            </div>
        );
    }

    // Top 3 Podium spots
    const topThree = leaderboard.slice(0, 3);
    const remainder = leaderboard.slice(3);

    return (
        <div className="w-11/12 max-w-6xl mx-auto text-white mt-24 mb-20 p-4 min-h-[calc(100vh-8rem)]">
            {/* Header Control */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-richblack-800 rounded-lg text-richblack-300 hover:text-white transition-colors"
                >
                    <VscChevronLeft size={24} />
                </button>
                <div>
                    <span className="text-xs text-yellow-50 font-bold uppercase tracking-wider font-mono">STANDINGS ARENA</span>
                    <h1 className="text-3xl font-extrabold text-white mt-1">Leaderboard</h1>
                </div>
            </div>

            {/* Top Stat Cards & Countdown Timer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {/* Stat 1: Total Registered */}
                <div className="bg-[#1C1D24] p-6 rounded-2xl border border-richblack-800/80 flex items-center justify-between shadow-lg">
                    <div>
                        <span className="text-3xl font-extrabold text-white font-mono">{stats.totalRegistered}</span>
                        <span className="block text-[10px] text-richblack-400 font-bold uppercase tracking-wider mt-1.5">Total Registered</span>
                    </div>
                    <div className="p-3.5 rounded-full bg-caribbeangreen-500/10 text-caribbeangreen-400">
                        <FaUserCheck size={20} />
                    </div>
                </div>

                {/* Stat 2: Total Participated */}
                <div className="bg-[#1C1D24] p-6 rounded-2xl border border-richblack-800/80 flex items-center justify-between shadow-lg">
                    <div>
                        <span className="text-3xl font-extrabold text-white font-mono">{stats.totalParticipated}</span>
                        <span className="block text-[10px] text-richblack-400 font-bold uppercase tracking-wider mt-1.5">Total Participated</span>
                    </div>
                    <div className="p-3.5 rounded-full bg-blue-500/10 text-[#12D8FA]">
                        <FaLaptopCode size={20} />
                    </div>
                </div>

                {/* Remaining Timer block */}
                <div className="bg-[#1C1D24] p-6 rounded-2xl border border-richblack-800/80 flex flex-col md:flex-row items-center justify-between md:col-span-2 gap-4 shadow-lg">
                    <div>
                        <span className="block text-[11px] text-[#FF5A5F] font-bold uppercase tracking-wider flex items-center gap-1">
                            Remaining time for completion 🔥
                        </span>
                        <span className="block text-[10px] text-richblack-500 font-semibold mt-1">
                            Only the first three positions will be awarded achievements.
                        </span>
                    </div>
                    {/* Timer visual block */}
                    <div className="flex gap-3 text-white font-mono shrink-0 select-none">
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold bg-[#262833] px-2.5 py-1 rounded-md border border-richblack-800">{timeLeft.days}</span>
                            <span className="text-[8px] text-richblack-400 font-bold uppercase mt-1">Days</span>
                        </div>
                        <span className="text-xl font-bold mt-1 text-richblack-600">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold bg-[#262833] px-2.5 py-1 rounded-md border border-richblack-800">{timeLeft.hours}</span>
                            <span className="text-[8px] text-richblack-400 font-bold uppercase mt-1">Hrs</span>
                        </div>
                        <span className="text-xl font-bold mt-1 text-richblack-600">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold bg-[#262833] px-2.5 py-1 rounded-md border border-richblack-800">{timeLeft.minutes}</span>
                            <span className="text-[8px] text-richblack-400 font-bold uppercase mt-1">Min</span>
                        </div>
                        <span className="text-xl font-bold mt-1 text-richblack-600">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold bg-[#262833] px-2.5 py-1 rounded-md border border-richblack-800">{timeLeft.seconds}</span>
                            <span className="text-[8px] text-richblack-400 font-bold uppercase mt-1">Sec</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Podium Section (Top 3 Users Showcase) */}
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* 1st Place Card (Custom Yellow Golden Accent) */}
                    <div className="md:order-2 bg-[#1C1D24] p-6 rounded-2xl border-2 border-yellow-50/70 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 opacity-[0.03] rounded-full blur-2xl pointer-events-none" />
                        <div>
                            {/* Avatar Badge Rank Container */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="relative">
                                    <img 
                                        src={topThree[0].user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${topThree[0].user?.firstName}`} 
                                        alt="1st place avatar"
                                        className="w-16 h-16 rounded-full border-2 border-yellow-50"
                                    />
                                    <span className="absolute -bottom-1 -right-1 bg-yellow-50 text-black font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1C1D24]">
                                        1
                                    </span>
                                </div>
                                <div className="text-right">
                                    <FaTrophy className="text-yellow-50 animate-bounce ml-auto" size={32} />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white leading-snug">
                                {topThree[0].user?.firstName} {topThree[0].user?.lastName}
                            </h3>
                            <span className="text-xs text-richblack-400 font-mono">@{topThree[0].user?.email.split('@')[0]}</span>
                        </div>

                        {/* Stats & imaginary points */}
                        <div className="mt-6 border-t border-richblack-800/80 pt-4 flex flex-col gap-4">
                            <div className="grid grid-cols-3 text-center text-xs font-mono">
                                <div>
                                    <span className="block text-richblack-400 font-bold uppercase text-[9px]">Wins</span>
                                    <span className="text-sm font-bold text-white mt-0.5 block">{topThree[0].solvedProblems?.length || 0}</span>
                                </div>
                                <div>
                                    <span className="block text-richblack-400 font-bold uppercase text-[9px]">Attempts</span>
                                    <span className="text-sm font-bold text-white mt-0.5 block">
                                        {topThree[0].solvedProblems?.reduce((acc, curr) => acc + (curr.attempts || 1), 0) || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-richblack-400 font-bold uppercase text-[9px]">Points</span>
                                    <span className="text-sm font-bold text-yellow-50 mt-0.5 block">{topThree[0].score}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-start font-mono text-[10px]">
                                <span className="bg-[#262833] border border-richblack-800 px-2 py-1 rounded-md text-yellow-50 font-bold flex items-center gap-1">
                                    <FaGift size={10} />
                                    {(topThree[0].score * 10).toLocaleString()}
                                </span>
                                <span className="bg-[#262833] border border-richblack-800 px-2 py-1 rounded-md text-[#12D8FA] font-bold flex items-center gap-1">
                                    <FaGem size={10} />
                                    {((topThree[0].solvedProblems?.length || 0) * 5000 + 17500).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2nd Place Card */}
                    {topThree[1] && (
                        <div className="md:order-1 bg-[#1C1D24] p-6 rounded-2xl border border-richblack-800 flex flex-col justify-between shadow-lg">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="relative">
                                        <img 
                                            src={topThree[1].user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${topThree[1].user?.firstName}`} 
                                            alt="2nd place avatar"
                                            className="w-16 h-16 rounded-full border-2 border-caribbeangreen-400"
                                        />
                                        <span className="absolute -bottom-1 -right-1 bg-caribbeangreen-400 text-black font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1C1D24]">
                                            2
                                        </span>
                                    </div>
                                    <span className="text-richblack-400 text-sm font-bold font-mono">2nd Spot</span>
                                </div>

                                <h3 className="text-lg font-bold text-white leading-snug">
                                    {topThree[1].user?.firstName} {topThree[1].user?.lastName}
                                </h3>
                                <span className="text-xs text-richblack-400 font-mono">@{topThree[1].user?.email.split('@')[0]}</span>
                            </div>

                            <div className="mt-6 border-t border-richblack-800/80 pt-4 flex flex-col gap-4">
                                <div className="grid grid-cols-3 text-center text-xs font-mono">
                                    <div>
                                        <span className="block text-richblack-400 font-bold uppercase text-[9px]">Wins</span>
                                        <span className="text-sm font-bold text-white mt-0.5 block">{topThree[1].solvedProblems?.length || 0}</span>
                                    </div>
                                    <div>
                                        <span className="block text-richblack-400 font-bold uppercase text-[9px]">Attempts</span>
                                        <span className="text-sm font-bold text-white mt-0.5 block">
                                            {topThree[1].solvedProblems?.reduce((acc, curr) => acc + (curr.attempts || 1), 0) || 0}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-richblack-400 font-bold uppercase text-[9px]">Points</span>
                                        <span className="text-sm font-bold text-[#12D8FA] mt-0.5 block">{topThree[1].score}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-start font-mono text-[10px]">
                                    <span className="bg-[#262833] border border-richblack-800 px-2 py-1 rounded-md text-yellow-50 font-bold flex items-center gap-1">
                                        <FaGift size={10} />
                                        {(topThree[1].score * 10).toLocaleString()}
                                    </span>
                                    <span className="bg-[#262833] border border-richblack-800 px-2 py-1 rounded-md text-[#12D8FA] font-bold flex items-center gap-1">
                                        <FaGem size={10} />
                                        {((topThree[1].solvedProblems?.length || 0) * 5000 + 12000).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place Card */}
                    {topThree[2] && (
                        <div className="md:order-3 bg-[#1C1D24] p-6 rounded-2xl border border-richblack-800 flex flex-col justify-between shadow-lg">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="relative">
                                        <img 
                                            src={topThree[2].user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${topThree[2].user?.firstName}`} 
                                            alt="3rd place avatar"
                                            className="w-16 h-16 rounded-full border-2 border-pink-400"
                                        />
                                        <span className="absolute -bottom-1 -right-1 bg-pink-400 text-black font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1C1D24]">
                                            3
                                        </span>
                                    </div>
                                    <span className="text-richblack-400 text-sm font-bold font-mono">3rd Spot</span>
                                </div>

                                <h3 className="text-lg font-bold text-white leading-snug">
                                    {topThree[2].user?.firstName} {topThree[2].user?.lastName}
                                </h3>
                                <span className="text-xs text-richblack-400 font-mono">@{topThree[2].user?.email.split('@')[0]}</span>
                            </div>

                            <div className="mt-6 border-t border-richblack-800/80 pt-4 flex flex-col gap-4">
                                <div className="grid grid-cols-3 text-center text-xs font-mono">
                                    <div>
                                        <span className="block text-richblack-400 font-bold uppercase text-[9px]">Wins</span>
                                        <span className="text-sm font-bold text-white mt-0.5 block">{topThree[2].solvedProblems?.length || 0}</span>
                                    </div>
                                    <div>
                                        <span className="block text-richblack-400 font-bold uppercase text-[9px]">Attempts</span>
                                        <span className="text-sm font-bold text-white mt-0.5 block">
                                            {topThree[2].solvedProblems?.reduce((acc, curr) => acc + (curr.attempts || 1), 0) || 0}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-richblack-400 font-bold uppercase text-[9px]">Points</span>
                                        <span className="text-sm font-bold text-pink-300 mt-0.5 block">{topThree[2].score}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-start font-mono text-[10px]">
                                    <span className="bg-[#262833] border border-richblack-800 px-2 py-1 rounded-md text-yellow-50 font-bold flex items-center gap-1">
                                        <FaGift size={10} />
                                        {(topThree[2].score * 10).toLocaleString()}
                                    </span>
                                    <span className="bg-[#262833] border border-richblack-800 px-2 py-1 rounded-md text-[#12D8FA] font-bold flex items-center gap-1">
                                        <FaGem size={10} />
                                        {((topThree[2].solvedProblems?.length || 0) * 5000 + 8000).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Global Ranking Title */}
            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-white">Global Ranking</h2>
            </div>

            {/* Ranking Table Section */}
            {leaderboard.length === 0 ? (
                <div className="bg-[#1C1D24] p-8 rounded-2xl text-center border border-richblack-800/80 text-richblack-400">
                    No submissions have been evaluated yet. Submit a solution to appear on the leaderboard!
                </div>
            ) : (
                <div className="overflow-x-auto bg-[#1C1D24] rounded-2xl border border-richblack-800/80 shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-richblack-800 bg-richblack-900/40 text-richblack-400 text-xs font-bold uppercase tracking-wider font-mono">
                                <th className="p-4 pl-6">Rank</th>
                                <th className="p-4">User name</th>
                                <th className="p-4 text-center">Wins</th>
                                <th className="p-4 text-center">Score / Points</th>
                                <th className="p-4 text-right pr-6">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-richblack-800/40">
                            {(remainder.length > 0 ? remainder : leaderboard).map((entry, index) => {
                                const finalRank = remainder.length > 0 ? index + 4 : index + 1;
                                return (
                                    <motion.tr 
                                        key={entry._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-[#262833]/40 duration-150 text-sm font-sans"
                                    >
                                        <td className="p-4 pl-6 font-bold text-richblack-300 font-mono">
                                            #{finalRank}
                                        </td>
                                        <td className="p-4 flex items-center gap-3">
                                            <img 
                                                src={entry.user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${entry.user?.firstName}`} 
                                                alt="avatar" 
                                                className="w-9 h-9 rounded-full border border-richblack-700"
                                            />
                                            <div>
                                                <span className="font-bold text-white block leading-snug">{entry.user?.firstName} {entry.user?.lastName}</span>
                                                <span className="text-xs text-richblack-400 font-mono">@{entry.user?.email.split('@')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-bold font-mono text-white">
                                            {entry.solvedProblems?.length || 0}
                                        </td>
                                        <td className="p-4 text-center font-extrabold font-mono text-yellow-50">
                                            {entry.score}
                                        </td>
                                        <td className="p-4 text-right pr-6 text-xs text-richblack-400 font-mono">
                                            {new Date(entry.updatedAt).toLocaleTimeString()}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ContestLeaderboard;
