import React from 'react';
import { MCQQuestion, useAssessmentStore } from '../../store/assessmentStore';

interface Props {
  question: MCQQuestion;
}

const MCQMultipleQuestion: React.FC<Props> = ({ question }) => {
  const { answers, setAnswer } = useAssessmentStore();
  const currentAnswers: string[] = answers[question.id] || [];

  const toggleOption = (option: string) => {
    if (currentAnswers.includes(option)) {
      setAnswer(question.id, currentAnswers.filter(a => a !== option));
    } else {
      setAnswer(question.id, [...currentAnswers, option]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-richblack-900 text-richblack-25 p-6 md:p-10 rounded-xl border border-richblack-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full">
      <div className="mb-8 border-b border-richblack-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        <div className="prose prose-invert max-w-none text-richblack-300" dangerouslySetInnerHTML={{ __html: question.statement }} />
        <p className="text-sm text-caribbeangreen-300 mt-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select all that apply
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {question.options.map((option, idx) => {
          const isSelected = currentAnswers.includes(option);
          return (
            <label 
              key={idx} 
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected 
                  ? 'bg-richblack-800 border-[#EAFF20]/50 shadow-[0_0_15px_rgba(234,255,32,0.1)]' 
                  : 'bg-richblack-950 border-richblack-800 hover:bg-richblack-800 hover:border-richblack-700'
              }`}
            >
              <div className={`relative flex items-center justify-center w-6 h-6 rounded border-2 transition-colors ${
                isSelected ? 'border-[#EAFF20] bg-[#EAFF20]' : 'border-richblack-600 bg-richblack-950'
              }`}>
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleOption(option)}
                  className="opacity-0 absolute w-full h-full cursor-pointer"
                />
                {isSelected && (
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-richblack-100'}`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default MCQMultipleQuestion;
