import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../../../../services/apiConnector';
import { problemEndpoints } from '../../../../services/apis';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const AddProblem = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('Coding'); // Coding or MCQ

    const [commonData, setCommonData] = useState({
        title: '',
        difficulty: 'Easy',
        tags: '',
    });

    // Coding specific state
    const [codingData, setCodingData] = useState({
        statement: '',
        constraints: '',
        examples: '',
        functionName: '',
        returnType: 'int',
    });
    
    const [parameters, setParameters] = useState([{ name: '', type: 'int' }]);
    
    const [starterCode, setStarterCode] = useState({
        cpp: '',
        java: '',
        python: '',
        javascript: ''
    });

    const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', isPublic: false }]);

    // MCQ specific state
    const [mcqData, setMcqData] = useState({
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1
    });

    const handleCommonChange = (e) => {
        setCommonData({ ...commonData, [e.target.name]: e.target.value });
    };

    const handleCodingChange = (e) => {
        setCodingData({ ...codingData, [e.target.name]: e.target.value });
    };

    const handleStarterCodeChange = (language, value) => {
        setStarterCode({ ...starterCode, [language]: value });
    };

    // Parameter helpers
    const handleParameterChange = (index, field, value) => {
        const newParams = [...parameters];
        newParams[index][field] = value;
        setParameters(newParams);
    };

    const addParameter = () => {
        setParameters([...parameters, { name: '', type: 'int' }]);
    };

    const removeParameter = (index) => {
        if (parameters.length === 1) return;
        setParameters(parameters.filter((_, i) => i !== index));
    };

    // Test cases helper
    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', expectedOutput: '', isPublic: false }]);
    };

    const removeTestCase = (index) => {
        if (testCases.length === 1) return;
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    // MCQ helper
    const handleMcqOptionChange = (index, value) => {
        const newOptions = [...mcqData.options];
        newOptions[index] = value;
        setMcqData({ ...mcqData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let formattedTestCases = [...testCases];
        if (type === 'Coding') {
            try {
                formattedTestCases = testCases.map(tc => {
                    // Try to parse input and expectedOutput as JSON (for new generic engine)
                    let parsedInput = tc.input;
                    let parsedExpectedOutput = tc.expectedOutput;
                    try { parsedInput = JSON.parse(tc.input); } catch(e) {}
                    try { parsedExpectedOutput = JSON.parse(tc.expectedOutput); } catch(e) {}
                    
                    return {
                        ...tc,
                        input: parsedInput,
                        expectedOutput: parsedExpectedOutput
                    }
                });
            } catch (err) {
                toast.error("Invalid JSON format in test cases");
                setLoading(false);
                return;
            }
        }

        const payload = {
            contestId,
            title: commonData.title,
            type,
            difficulty: commonData.difficulty,
            tags: commonData.tags ? commonData.tags.split(',').map(tag => tag.trim()) : [],
            ...(type === 'Coding' ? {
                statement: codingData.statement,
                constraints: codingData.constraints,
                examples: codingData.examples,
                functionName: codingData.functionName,
                returnType: codingData.returnType,
                parameters: parameters,
                starterCode: starterCode,
                testCases: formattedTestCases
            } : {
                options: mcqData.options,
                correctAnswer: mcqData.correctAnswer,
                marks: Number(mcqData.marks),
                // Re-use statement field for MCQ question description
                statement: commonData.title 
            })
        };

        try {
            const response = await apiConnector("POST", problemEndpoints.CREATE_PROBLEM_API, payload, {
                Authorization: `Bearer ${token}`,
            });

            if (response?.data?.success) {
                toast.success("Question added successfully!");
                navigate('/dashboard/my-contests');
            } else {
                toast.error(response?.data?.message || "Failed to add question");
            }
        } catch (error) {
            console.error("Create Problem Error:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="text-white p-6 max-w-4xl mx-auto bg-richblack-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-50 to-yellow-200 text-transparent bg-clip-text">
                Add Question to Contest
            </h1>

            {/* Type selector */}
            <div className="flex gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setType('Coding')}
                    className={`px-6 py-2 rounded-lg font-semibold border transition-all ${type === 'Coding' ? 'bg-yellow-50 text-black border-yellow-50' : 'bg-transparent text-white border-richblack-700'}`}
                >
                    Coding Question
                </button>
                <button
                    type="button"
                    onClick={() => setType('MCQ')}
                    className={`px-6 py-2 rounded-lg font-semibold border transition-all ${type === 'MCQ' ? 'bg-yellow-50 text-black border-yellow-50' : 'bg-transparent text-white border-richblack-700'}`}
                >
                    MCQ Question
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                
                {/* Title / Question */}
                <div className="flex flex-col gap-2">
                    <label className="text-richblack-100 text-sm font-semibold">
                        {type === 'Coding' ? 'Problem Title*' : 'Question Statement*'}
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={commonData.title}
                        onChange={handleCommonChange}
                        required
                        className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                        placeholder={type === 'Coding' ? "e.g. Reverse a Linked List" : "e.g. What is the time complexity of QuickSort in the worst case?"}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-richblack-100 text-sm font-semibold">Difficulty*</label>
                        <select
                            name="difficulty"
                            value={commonData.difficulty}
                            onChange={handleCommonChange}
                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-richblack-100 text-sm font-semibold">Tags (Comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={commonData.tags}
                            onChange={handleCommonChange}
                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                            placeholder="e.g. dsa, arrays, sorting"
                        />
                    </div>
                </div>

                {/* Conditional Fields: Coding */}
                {type === 'Coding' && (
                    <>
                        <div className="flex flex-col gap-2">
                            <label className="text-richblack-100 text-sm font-semibold">Problem Statement*</label>
                            <textarea
                                name="statement"
                                value={codingData.statement}
                                onChange={handleCodingChange}
                                required
                                rows="6"
                                className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                placeholder="Describe the task and standard input/output format."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-richblack-100 text-sm font-semibold">Constraints*</label>
                                <textarea
                                    name="constraints"
                                    value={codingData.constraints}
                                    onChange={handleCodingChange}
                                    required
                                    rows="3"
                                    className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                    placeholder="e.g. 1 <= N <= 10^5"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-richblack-100 text-sm font-semibold">Examples (Input/Output details)*</label>
                                <textarea
                                    name="examples"
                                    value={codingData.examples}
                                    onChange={handleCodingChange}
                                    required
                                    rows="3"
                                    className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                    placeholder="Example 1: Input: 5, Output: 10"
                                />
                            </div>
                        </div>

                        {/* Execution Metadata Builder */}
                        <div className="space-y-4 pt-4 border-t border-richblack-700">
                            <h3 className="text-lg font-bold border-b border-richblack-700 pb-2">Execution Metadata*</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-richblack-100 text-sm font-semibold">Function Name*</label>
                                    <input
                                        type="text"
                                        name="functionName"
                                        value={codingData.functionName}
                                        onChange={handleCodingChange}
                                        required
                                        className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                        placeholder="e.g. twoSum"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-richblack-100 text-sm font-semibold">Return Type*</label>
                                    <input
                                        type="text"
                                        name="returnType"
                                        value={codingData.returnType}
                                        onChange={handleCodingChange}
                                        required
                                        className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                        placeholder="e.g. int, vector<int>, string"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-richblack-100 text-sm font-semibold">Parameters*</label>
                                {parameters.map((param, index) => (
                                    <div key={index} className="flex gap-4 items-center">
                                        <input
                                            type="text"
                                            value={param.name}
                                            onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                                            placeholder="Param Name (e.g. nums)"
                                            className="bg-richblack-700 p-2 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50 flex-1"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={param.type}
                                            onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                                            placeholder="Type (e.g. vector<int>)"
                                            className="bg-richblack-700 p-2 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50 flex-1"
                                            required
                                        />
                                        {parameters.length > 1 && (
                                            <button type="button" onClick={() => removeParameter(index)} className="text-pink-200">Remove</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addParameter} className="self-start text-yellow-50 text-sm mt-1">+ Add Parameter</button>
                            </div>

                            <div className="flex flex-col gap-4 mt-4">
                                <label className="text-richblack-100 text-sm font-semibold">Starter Code (Boilerplate)*</label>
                                {['cpp', 'java', 'python', 'javascript'].map((lang) => (
                                    <div key={lang}>
                                        <label className="text-xs text-richblack-300 capitalize mb-1 block">{lang}</label>
                                        <textarea
                                            value={starterCode[lang]}
                                            onChange={(e) => handleStarterCodeChange(lang, e.target.value)}
                                            className="w-full bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50 font-mono text-sm"
                                            rows="4"
                                            placeholder={`class Solution {\n...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test cases builder */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b border-richblack-700 pb-2">Test Cases*</h3>
                            {testCases.map((tc, index) => (
                                <div key={index} className="bg-richblack-700 p-4 rounded-lg border border-richblack-600 space-y-3 relative">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold">Test Case #{index + 1}</span>
                                        {testCases.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTestCase(index)}
                                                className="text-pink-200 text-xs hover:underline"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-richblack-300 block mb-1">Standard Input</label>
                                            <textarea
                                                value={tc.input}
                                                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                required
                                                rows="2"
                                                className="w-full bg-richblack-800 p-2 rounded text-sm outline-none border border-richblack-600 focus:border-yellow-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-richblack-300 block mb-1">Expected Output</label>
                                            <textarea
                                                value={tc.expectedOutput}
                                                onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                                                required
                                                rows="2"
                                                className="w-full bg-richblack-800 p-2 rounded text-sm outline-none border border-richblack-600 focus:border-yellow-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addTestCase}
                                className="bg-richblack-700 text-white px-4 py-2 rounded border border-richblack-600 text-sm hover:bg-richblack-600 transition-all"
                            >
                                + Add Test Case
                            </button>
                        </div>
                    </>
                )}

                {/* Conditional Fields: MCQ */}
                {type === 'MCQ' && (
                    <>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b border-richblack-700 pb-2">Options*</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mcqData.options.map((opt, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <label className="text-xs text-richblack-300">Option {String.fromCharCode(65 + index)}*</label>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleMcqOptionChange(index, e.target.value)}
                                            required
                                            className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-richblack-100 text-sm font-semibold">Correct Option Choice*</label>
                                <select
                                    value={mcqData.correctAnswer}
                                    onChange={(e) => setMcqData({ ...mcqData, correctAnswer: e.target.value })}
                                    required
                                    className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                >
                                    <option value="">Select correct option</option>
                                    {mcqData.options.map((opt, index) => (
                                        <option key={index} value={opt}>
                                            Option {String.fromCharCode(65 + index)} ({opt})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-richblack-100 text-sm font-semibold">Marks Weight*</label>
                                <input
                                    type="number"
                                    value={mcqData.marks}
                                    onChange={(e) => setMcqData({ ...mcqData, marks: e.target.value })}
                                    required
                                    min="1"
                                    className="bg-richblack-700 p-3 rounded-lg outline-none border border-richblack-600 focus:border-yellow-50"
                                />
                            </div>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-50 text-black font-semibold py-3 rounded-lg hover:bg-yellow-100 transition-all duration-200"
                >
                    {loading ? 'Adding...' : 'Add Question & Link to Contest'}
                </button>
            </form>
        </div>
    );
};

export default AddProblem;
