import React, { useEffect } from 'react';
import { useAssessmentStore, Question } from '../../store/assessmentStore';
import AssessmentLayout from './AssessmentLayout';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'coding',
    title: 'Two Sum',
    statement: '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
    examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
    marks: 10
  },
  {
    id: 'q2',
    type: 'mcq_single',
    title: 'Time Complexity',
    statement: '<p>What is the worst-case time complexity of QuickSort?</p>',
    options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
    marks: 2
  },
  {
    id: 'q2b',
    type: 'mcq_single',
    title: 'React State Management',
    statement: '<p>Which of the following hooks is used to manage state in a functional component?</p>',
    options: ['useEffect', 'useMemo', 'useState', 'useCallback'],
    marks: 2
  },
  {
    id: 'q3',
    type: 'mcq_multiple',
    title: 'Web Technologies',
    statement: '<p>Which of the following are considered Frontend frameworks/libraries?</p>',
    options: ['React', 'Express', 'Vue', 'Django'],
    marks: 4
  },
  {
    id: 'q4',
    type: 'true_false',
    title: 'React Fundamentals',
    statement: '<p>Hooks can be called conditionally inside a React component.</p>',
    marks: 1
  },
  {
    id: 'q5',
    type: 'short_answer',
    title: 'Database Concept',
    statement: '<p>What does ACID stand for in the context of database transactions?</p>',
    marks: 2
  },
  {
    id: 'q6',
    type: 'essay',
    title: 'System Design',
    statement: '<p>Design a URL shortening service like bit.ly. Discuss your approach to generating short URLs, handling high read throughput, and scaling the database.</p>',
    marks: 15
  }
];

export const MockAssessmentWrapper: React.FC = () => {
  const { setQuestions, questions } = useAssessmentStore();

  useEffect(() => {
    // Simulate API fetch
    setQuestions(mockQuestions);
  }, []);

  if (questions.length === 0) return null;

  return <AssessmentLayout />;
};

export default MockAssessmentWrapper;
