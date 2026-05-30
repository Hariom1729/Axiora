import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';

const Contests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Upcoming': return 'bg-pink-100 text-pink-500';
            case 'Running': return 'bg-caribbeangreen-100 text-caribbeangreen-500';
            case 'Ended': return 'bg-richblack-400 text-richblack-50';
            default: return 'bg-yellow-100 text-yellow-500';
        }
    };

    return (
        <div className="w-11/12 max-w-maxContent mx-auto text-white mt-10 p-6 min-h-[calc(100vh-3.5rem)]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text">
                    Coding Contests
                </h1>
                <p className="text-richblack-300 text-lg">
                    Compete in real-time challenges, improve your coding skills, and climb the leaderboard.
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="text-richblack-300">Loading contests dynamically from database...</div>
                    ) : contests.length === 0 ? (
                        <div className="text-richblack-300">No contests available at the moment.</div>
                    ) : (
                        contests.map((contest) => (
                            <div key={contest._id} className="bg-richblack-800 p-6 rounded-xl border border-richblack-700 hover:border-yellow-50 transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyle(contest.status)}`}>
                                            {contest.status}
                                        </span>
                                        <span className="text-richblack-300 text-sm">{contest.type}</span>
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2">{contest.title}</h2>
                                    <p className="text-richblack-400 text-sm mb-6 line-clamp-2">{contest.description}</p>
                                </div>
                                <Link 
                                    to={`/contests/${contest._id}`}
                                    className="w-full text-center bg-yellow-50 text-black py-2 rounded-md font-semibold hover:bg-yellow-100 transition-all"
                                >
                                    {contest.status === 'Running' ? 'Enter Workspace' : 'View Details'}
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Contests;
