import React from 'react';
import { TrueFalseQuestion, useAssessmentStore } from '../../store/assessmentStore';

interface Props {
  question: TrueFalseQuestion;
}

const TrueFalseQuestionComponent: React.FC<Props> = ({ question }) => {
  const { answers, setAnswer } = useAssessmentStore();
  const currentAnswer = answers[question.id];

  return (
    <div className="flex flex-col h-full bg-richblack-900 text-richblack-25 p-6 md:p-10 rounded-xl border border-richblack-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full">
      <div className="mb-8 border-b border-richblack-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        <div className="prose prose-invert max-w-none text-richblack-300" dangerouslySetInnerHTML={{ __html: question.statement }} />
      </div>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <button
          onClick={() => setAnswer(question.id, 'True')}
          className={`py-8 rounded-xl text-xl font-bold transition-all duration-300 border-2 ${
            currentAnswer === 'True'
              ? 'bg-caribbeangreen-600/20 border-caribbeangreen-400 text-caribbeangreen-300 shadow-[0_0_20px_rgba(5,167,130,0.2)]'
              : 'bg-richblack-950 border-richblack-800 text-richblack-100 hover:bg-richblack-800 hover:border-richblack-600'
          }`}
        >
          True
        </button>
        <button
          onClick={() => setAnswer(question.id, 'False')}
          className={`py-8 rounded-xl text-xl font-bold transition-all duration-300 border-2 ${
            currentAnswer === 'False'
              ? 'bg-pink-600/20 border-pink-400 text-pink-300 shadow-[0_0_20px_rgba(239,71,111,0.2)]'
              : 'bg-richblack-950 border-richblack-800 text-richblack-100 hover:bg-richblack-800 hover:border-richblack-600'
          }`}
        >
          False
        </button>
      </div>
    </div>
  );
};

export default TrueFalseQuestionComponent;
