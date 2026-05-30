import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { VscChevronLeft } from 'react-icons/vsc';
import { FaTrophy } from 'react-icons/fa';

const ContestLeaderboard = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const response = await apiConnector("GET", `${contestEndpoints.GET_LEADERBOARD_API}${contestId}/leaderboard`);
            if (response?.data?.success) {
                setLeaderboard(response.data.data);
            }
        } catch (error) {
            console.error("Fetch Leaderboard Error:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
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

    return (
        <div className="w-11/12 max-w-maxContent mx-auto text-white mt-10 p-6 min-h-[calc(100vh-3.5rem)]">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-richblack-800 rounded-lg text-richblack-300 hover:text-white"
                >
                    <VscChevronLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-200 text-transparent bg-clip-text flex items-center gap-2">
                    <FaTrophy className="text-yellow-50" /> Live Standings
                </h1>
            </div>

            {loading ? (
                <div className="text-richblack-300">Loading standings...</div>
            ) : leaderboard.length === 0 ? (
                <div className="bg-richblack-800 p-8 rounded-lg text-center border border-richblack-700 text-richblack-400">
                    No submissions have been evaluated yet. Submit a solution to appear on the leaderboard!
                </div>
            ) : (
                <div className="overflow-x-auto bg-richblack-800 rounded-xl border border-richblack-700">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-richblack-700 bg-richblack-900/50 text-richblack-300 text-sm font-semibold">
                                <th className="p-4 pl-6">Rank</th>
                                <th className="p-4">Participant</th>
                                <th className="p-4 text-center">Score</th>
                                <th className="p-4 text-center">Solved Count</th>
                                <th className="p-4 text-right pr-6">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-richblack-700/50">
                            {leaderboard.map((entry, index) => (
                                <motion.tr 
                                    key={entry._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-richblack-700/20 duration-150 text-sm"
                                >
                                    <td className="p-4 pl-6 font-bold text-yellow-50">
                                        #{index + 1}
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <img 
                                            src={entry.user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${entry.user?.firstName}`} 
                                            alt="avatar" 
                                            className="w-8 h-8 rounded-full border border-richblack-600"
                                        />
                                        <div>
                                            <span className="font-semibold block">{entry.user?.firstName} {entry.user?.lastName}</span>
                                            <span className="text-xs text-richblack-400">{entry.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-bold text-caribbeangreen-200">
                                        {entry.score}
                                    </td>
                                    <td className="p-4 text-center font-semibold">
                                        {entry.solvedProblems?.length || 0}
                                    </td>
                                    <td className="p-4 text-right pr-6 text-xs text-richblack-300">
                                        {new Date(entry.updatedAt).toLocaleTimeString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ContestLeaderboard;
