import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiConnector } from '../../../../services/apiConnector';
import { contestEndpoints } from '../../../../services/apis';
import { useSelector } from 'react-redux';
import { VscTrash } from 'react-icons/vsc';
import { toast } from 'react-hot-toast';

const MyContests = () => {
    const { token } = useSelector((state) => state.auth);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyContests = async () => {
        setLoading(true);
        try {
            // Get all contests (since in basic CRUD all contests are visible, 
            // but in future, could filter by instructor/tutor creator)
            const response = await apiConnector("GET", contestEndpoints.GET_ALL_CONTESTS_API, null, {
                Authorization: `Bearer ${token}`
            });
            if (response?.data?.success) {
                setContests(response.data.data);
            }
        } catch (error) {
            console.error("Fetch My Contests Error:", error);
        }
        setLoading(false);
    };

    const handleDelete = async (contestId) => {
        if (!window.confirm("Are you sure you want to delete this contest?")) return;
        try {
            const response = await apiConnector("DELETE", `${contestEndpoints.DELETE_CONTEST_API}${contestId}`, null, {
                Authorization: `Bearer ${token}`
            });
            if (response?.data?.success) {
                toast.success("Contest deleted successfully");
                fetchMyContests();
            } else {
                toast.error("Failed to delete contest");
            }
        } catch (error) {
            console.error("Delete Contest Error:", error);
            toast.error("Error deleting contest");
        }
    };

    useEffect(() => {
        fetchMyContests();
    }, []);

    return (
        <div className="text-white p-6 max-w-5xl mx-auto bg-richblack-900 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-200 text-transparent bg-clip-text">
                    My Contests
                </h1>
                <Link to="/dashboard/add-contest" className="bg-yellow-50 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-100 transition-all duration-200">
                    + Create Contest
                </Link>
            </div>

            {loading ? (
                <div className="text-richblack-300">Loading contests...</div>
            ) : contests.length === 0 ? (
                <div className="bg-richblack-800 p-8 rounded-lg text-center border border-richblack-700">
                    <p className="text-richblack-300 mb-4">No contests created yet.</p>
                    <Link to="/dashboard/add-contest" className="text-yellow-50 hover:underline">Create your first contest now</Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {contests.map((contest) => (
                        <div key={contest._id} className="bg-richblack-800 p-6 rounded-xl border border-richblack-700 flex justify-between items-center hover:border-yellow-25 duration-200">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{contest.title}</h2>
                                <p className="text-richblack-400 text-sm mb-1">Type: {contest.type}</p>
                                <p className="text-richblack-400 text-sm">
                                    Duration: {contest.duration} mins | Start: {new Date(contest.startTime).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <Link to={`/dashboard/my-contests/${contest._id}/add-problem`} className="bg-yellow-50 text-black px-3 py-1.5 rounded font-semibold text-sm hover:bg-yellow-100 transition-colors">
                                    + Add Question
                                </Link>
                                <button onClick={() => handleDelete(contest._id)} className="p-2 hover:bg-pink-900/30 rounded text-pink-200 transition-colors">
                                    <VscTrash size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyContests;
