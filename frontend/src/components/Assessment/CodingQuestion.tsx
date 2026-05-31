import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { CodingQuestion, useAssessmentStore } from '../../store/assessmentStore';
import toast from 'react-hot-toast';

interface Props {
  question: CodingQuestion;
}

const CodingQuestionComponent: React.FC<Props> = ({ question }) => {
  const { answers, setAnswer } = useAssessmentStore();
  const currentCode = answers[question.id]?.code || '';
  const currentLang = answers[question.id]?.language || 'cpp';

  const [language, setLanguage] = useState<string>(currentLang);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setAnswer(question.id, { code: value, language });
    }
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setAnswer(question.id, { code: currentCode, language: newLang });
  };

  const runCode = async () => {
    if (!currentCode) {
      toast.error("Please write some code before running.");
      return;
    }
    
    setIsRunning(true);
    setOutput('Compiling and running...');
    
    try {
      // Temporary mock execution logic for UI preview
      // In a real scenario, this would call your /api/v1/contest/run-code endpoint
      setTimeout(() => {
        setOutput(`[Mock Execution]\nLanguage: ${language}\n\nOutput:\nHello World!\n\nCompiled successfully in 45ms.`);
        setIsRunning(false);
        toast.success("Code executed successfully");
      }, 1500);
    } catch (error) {
      setOutput(`Error: Execution failed`);
      setIsRunning(false);
      toast.error("Execution failed");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 max-w-7xl mx-auto overflow-hidden text-richblack-25">
      {/* Left Panel: Problem Statement */}
      <div className="w-full lg:w-1/2 flex flex-col bg-richblack-900 border border-richblack-800 rounded-xl overflow-y-auto overflow-x-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{question.title}</h2>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-semibold">
              Medium
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none text-richblack-300 mb-8" dangerouslySetInnerHTML={{ __html: question.statement }} />
          
          {question.examples && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Examples:</h3>
              <pre className="bg-richblack-950 p-4 rounded-lg text-richblack-100 text-sm whitespace-pre-wrap border border-richblack-800">
                {question.examples}
              </pre>
            </div>
          )}

          {question.constraints && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Constraints:</h3>
              <div className="bg-richblack-950 p-4 rounded-lg text-richblack-100 text-sm border border-richblack-800">
                <ul className="list-disc pl-5 space-y-1">
                  {question.constraints.split('\n').map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Editor & Output */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] border border-richblack-800 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center p-3 border-b border-richblack-800 bg-richblack-900">
            <select 
              value={language}
              onChange={handleLangChange}
              className="bg-richblack-800 text-richblack-50 border border-richblack-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#EAFF20]"
            >
              <option value="cpp">C++</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>

            <button 
              onClick={runCode}
              disabled={isRunning}
              className="bg-caribbeangreen-200 text-richblack-900 font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-caribbeangreen-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isRunning ? 'Running...' : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'c++' ? 'cpp' : language}
              value={currentCode}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        {/* Output Console */}
        <div className="h-48 bg-richblack-900 border border-richblack-800 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex gap-4 border-b border-richblack-800 px-4 py-2 bg-richblack-950">
            <span className="text-sm font-semibold text-richblack-50 uppercase tracking-wider py-1 border-b-2 border-[#EAFF20]">Output</span>
            <span className="text-sm font-medium text-richblack-400 py-1">Custom Input</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-sm">
            {output ? (
              <pre className={output.includes('Error') ? 'text-pink-400' : 'text-caribbeangreen-300'}>{output}</pre>
            ) : (
              <div className="text-richblack-500 h-full flex items-center justify-center italic">Run your code to see the output here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingQuestionComponent;
