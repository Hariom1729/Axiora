import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiConnector } from '../../../../services/apiConnector';
import { contestEndpoints } from '../../../../services/apis';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const AddContest = () => {
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rules: '',
        startTime: '',
        endTime: '',
        duration: '',
        type: 'Coding',
        bannerUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert local datetime strings to UTC ISO strings for the backend
            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString()
            };

            const response = await apiConnector("POST", contestEndpoints.CREATE_CONTEST_API, payload, {
                Authorization: `Bearer ${token}`,
            });
            if (response?.data?.success) {
                toast.success("Contest Created Successfully!");
                navigate('/dashboard/my-contests');
            } else {
                toast.error(response?.data?.message || "Failed to create contest");
            }
        } catch (error) {
            console.error("Create Contest API Error:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="text-white p-6 max-w-3xl mx-auto bg-richblack-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-50 to-yellow-200 text-transparent bg-clip-text">
                Create New Contest
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                <div className="flex flex-col gap-2">
                    <label className="text-richblack-100 text-sm font-semibold">Contest Title*</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                        placeholder="Enter contest title"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-richblack-100 text-sm font-semibold">Description*</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                        placeholder="Enter contest description"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-richblack-100 text-sm font-semibold">Rules</label>
                    <textarea
                        name="rules"
                        value={formData.rules}
                        onChange={handleChange}
                        rows="3"
                        className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                        placeholder="Enter guidelines and rules (optional)"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-richblack-100 text-sm font-semibold">Start Date & Time*</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50 text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-richblack-100 text-sm font-semibold">End Date & Time*</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50 text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-richblack-100 text-sm font-semibold">Duration (in minutes)*</label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            min="1"
                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                            placeholder="e.g. 120"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-richblack-100 text-sm font-semibold">Contest Type*</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                        >
                            <option value="Coding">Coding Assessment</option>
                            <option value="MCQ">MCQ Test</option>
                            <option value="Mixed">Mixed Challenge</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-50 text-black font-semibold py-3 rounded-lg hover:bg-yellow-100 transition-all duration-200"
                >
                    {loading ? 'Creating...' : 'Create & Publish Contest'}
                </button>
            </form>
        </div>
    );
};

export default AddContest;
