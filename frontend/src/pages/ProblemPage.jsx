import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from "../utils/axiosClient";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Play, Send, ChevronDown, CheckCircle2, XCircle, Clock, Database } from "lucide-react";
import { toast } from "react-hot-toast";

// Keeping existing component imports commented as per original file
// import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from './components/ChatAi';
// import Editorial from '../components/Editorial';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase');
  const editorRef = useRef(null);
  const { problemId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const startCodeObj = response.data?.startCode?.find(sc => sc.language === langMap[selectedLanguage]);
        const initialCode = startCodeObj ? startCodeObj.initialCode : '';
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const startCodeObj = problem.startCode?.find(sc => sc.language === langMap[selectedLanguage]);
      if (startCodeObj) {
        setCode(startCodeObj.initialCode);
      }
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveConsoleTab('result');
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      if (response.data?.success) {
        toast.success("Code executed successfully");
      } else {
        toast.error("Execution failed / Wrong Answer");
      }
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Internal server error' });
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveConsoleTab('submission');
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      if (response.data?.accepted) {
        toast.success("Solution accepted!");
      } else {
        toast.error("Submission rejected");
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, error: 'Submission failed' });
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10';
      case 'medium': return 'text-amber-400 bg-amber-400/10';
      case 'hard': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      {/* Sticky Navbar */}
      <nav className="h-14 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-400 hover:text-white transition-colors"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="font-bold text-xl text-white tracking-wide">Code/Arena</div>
          <div className="h-6 w-[1px] bg-gray-700"></div>
          <div className="text-sm font-medium text-gray-200 truncate max-w-[200px] md:max-w-md">
            {problem?.title || "Loading Problem..."}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleRun}
            disabled={loading}
          >
            <Play size={16} className="text-green-400 fill-green-400" />
            <span>Run</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSubmitCode}
            disabled={loading}
          >
            <Send size={16} />
            <span>Submit</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup direction="horizontal" className="h-full rounded-lg overflow-hidden border border-gray-800 bg-[#1a1a1a]">
          
          {/* Left Panel - Problem Description */}
          <Panel defaultSize={45} minSize={30}>
            <div className="h-full flex flex-col bg-[#1a1a1a]">
              {/* Tabs */}
              <div className="flex bg-[#262626] p-1 gap-1 border-b border-gray-800 shrink-0">
                {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLeftTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                      activeLeftTab === tab 
                        ? 'bg-[#333333] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#333333]/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                {problem && (
                  <>
                    {activeLeftTab === 'description' && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-3">
                          <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                            </span>
                            {problem.tags && (
                              <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-medium">
                                {problem.tags}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                            {problem.description}
                          </div>
                        </div>

                        {problem.visibleTestCases?.length > 0 && (
                          <div className="space-y-4 pt-4 border-t border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Examples</h3>
                            <div className="space-y-4">
                              {problem.visibleTestCases.map((example, index) => (
                                <div key={index} className="bg-[#262626] rounded-lg p-4 border border-gray-800">
                                  <h4 className="font-semibold text-white mb-3 text-sm">Example {index + 1}:</h4>
                                  <div className="space-y-2 text-sm font-mono">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-gray-500 text-xs">Input</span>
                                      <span className="text-gray-200">{example.input}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-gray-500 text-xs">Output</span>
                                      <span className="text-gray-200">{example.output}</span>
                                    </div>
                                    {example.explanation && (
                                      <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-700">
                                        <span className="text-gray-500 text-xs font-sans">Explanation</span>
                                        <span className="text-gray-300 font-sans text-xs">{example.explanation}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeLeftTab === 'editorial' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-white mb-4">Editorial</h2>
                        <div className="p-4 bg-[#262626] rounded-lg border border-gray-800 text-center text-gray-400">
                          {/* <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/> */}
                          <p>Editorial component is currently unavailable.</p>
                        </div>
                      </div>
                    )}

                    {activeLeftTab === 'solutions' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-white mb-4">Reference Solutions</h2>
                        <div className="space-y-4">
                          {problem.referenceSolution?.map((solution, index) => (
                            <div key={index} className="border border-gray-800 rounded-lg overflow-hidden bg-[#262626]">
                              <div className="bg-[#333] px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="font-semibold text-sm text-gray-200">{solution?.language}</h3>
                              </div>
                              <div className="p-4 overflow-x-auto">
                                <pre className="text-xs font-mono text-gray-300">
                                  <code>{solution?.completeCode}</code>
                                </pre>
                              </div>
                            </div>
                          )) || (
                            <div className="p-8 text-center text-gray-500 bg-[#262626] rounded-lg border border-gray-800">
                              <p>Solutions will be available after you solve the problem.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeLeftTab === 'submissions' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-white mb-4">My Submissions</h2>
                        <div className="p-4 bg-[#262626] rounded-lg border border-gray-800 text-center text-gray-400">
                           {/* <SubmissionHistory problemId={problemId} /> */}
                           <p>Submissions history is currently unavailable.</p>
                        </div>
                      </div>
                    )}

                    {activeLeftTab === 'chatAI' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-white mb-4">Chat with AI</h2>
                        <ChatAi problem={problem} userCode={code} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Panel>

          {/* Horizontal Resize Handle */}
          <PanelResizeHandle className="w-1.5 bg-[#0a0a0a] hover:bg-blue-500/50 transition-colors flex items-center justify-center cursor-col-resize group z-10">
             <div className="w-1 h-8 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
          </PanelResizeHandle>

          {/* Right Panel - Editor & Console */}
          <Panel defaultSize={55} minSize={30}>
            <PanelGroup direction="vertical">
              
              {/* Top - Editor */}
              <Panel defaultSize={65} minSize={30}>
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  {/* Editor Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#262626] border-b border-gray-800 shrink-0">
                    <div className="relative">
                      <select 
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        className="appearance-none bg-[#333] hover:bg-[#444] text-xs font-medium text-gray-200 py-1.5 pl-3 pr-8 rounded border border-gray-700 focus:outline-none focus:border-gray-500 transition-colors cursor-pointer"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Monaco Editor Container */}
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineHeight: 24,
                        fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                        padding: { top: 16 },
                      }}
                    />
                  </div>
                </div>
              </Panel>

              {/* Vertical Resize Handle */}
              <PanelResizeHandle className="h-1.5 bg-[#0a0a0a] hover:bg-blue-500/50 transition-colors flex items-center justify-center cursor-row-resize group z-10">
                <div className="h-1 w-8 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
              </PanelResizeHandle>

              {/* Bottom - Console */}
              <Panel defaultSize={35} minSize={20}>
                <div className="h-full flex flex-col bg-[#1a1a1a]">
                  {/* Console Tabs */}
                  <div className="flex bg-[#262626] p-1 gap-1 border-b border-gray-800 shrink-0">
                    <button
                      onClick={() => setActiveConsoleTab('testcase')}
                      className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${
                        activeConsoleTab === 'testcase' 
                          ? 'bg-[#333333] text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#333333]/50'
                      }`}
                    >
                      Testcases
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('result')}
                      className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${
                        activeConsoleTab === 'result' 
                          ? 'bg-[#333333] text-green-400 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#333333]/50'
                      }`}
                    >
                      Run Result
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('submission')}
                      className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${
                        activeConsoleTab === 'submission' 
                          ? 'bg-[#333333] text-blue-400 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#333333]/50'
                      }`}
                    >
                      Submission
                    </button>
                  </div>

                  {/* Console Content */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    
                    {/* Testcase Tab */}
                    {activeConsoleTab === 'testcase' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {problem?.visibleTestCases?.map((tc, idx) => (
                          <div key={idx} className="bg-[#262626] rounded-md p-3 border border-gray-800 font-mono text-sm">
                            <div className="text-gray-500 text-xs mb-1">Testcase {idx + 1}</div>
                            <div className="text-gray-300 break-all">{tc.input}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Run Result Tab */}
                    {activeConsoleTab === 'result' && (
                      <div className="animate-in fade-in duration-200">
                        {!runResult && !loading && (
                          <div className="text-gray-500 text-sm italic">Run code to see results here.</div>
                        )}
                        {loading && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Evaluating...</span>
                          </div>
                        )}
                        {runResult && !loading && (
                          <div className="space-y-4">
                            <div className={`flex items-center gap-2 text-lg font-bold ${runResult.success ? 'text-green-500' : 'text-red-500'}`}>
                              {runResult.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                              {runResult.success ? 'Accepted' : 'Wrong Answer / Error'}
                            </div>
                            
                            {runResult.success && (
                              <div className="flex gap-4 text-xs font-medium text-gray-400 bg-[#262626] p-3 rounded-lg border border-gray-800 inline-flex">
                                <div className="flex items-center gap-1"><Clock size={14} className="text-gray-500"/> {runResult.runtime || '0.00'} sec</div>
                                <div className="flex items-center gap-1"><Database size={14} className="text-gray-500"/> {runResult.memory || '0.0'} KB</div>
                              </div>
                            )}

                            <div className="space-y-3 mt-4">
                              {runResult.testCases?.map((tc, i) => (
                                <div key={i} className="bg-[#262626] rounded-lg p-3 border border-gray-800 font-mono text-sm space-y-2">
                                  <div className={`font-semibold ${tc.status_id === 3 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-gray-500 text-xs">Input</span>
                                    <span className="text-gray-300 bg-[#1a1a1a] p-2 rounded">{tc.stdin}</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-gray-500 text-xs">Output</span>
                                    {tc.stdout && <span className="text-gray-300 bg-[#1a1a1a] p-2 rounded">{tc.stdout}</span>}
                                  </div>
                                  {(tc.stderr || tc.compile_output || tc.message) && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-red-500 text-xs">Error / Compile Output</span>
                                      <span className="text-red-400 bg-[#1a1a1a] p-2 rounded whitespace-pre-wrap">{tc.stderr || tc.compile_output || tc.message}</span>
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="text-gray-500 text-xs">Expected</span>
                                    <span className="text-gray-300 bg-[#1a1a1a] p-2 rounded">{tc.expected_output}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Result Tab */}
                    {activeConsoleTab === 'submission' && (
                      <div className="animate-in fade-in duration-200">
                        {!submitResult && !loading && (
                          <div className="text-gray-500 text-sm italic">Submit code to see evaluation here.</div>
                        )}
                        {loading && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting to judge...</span>
                          </div>
                        )}
                        {submitResult && !loading && (
                          <div className="space-y-4">
                            {submitResult.accepted ? (
                              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Success Header */}
                                <div className="bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                  
                                  <CheckCircle2 size={48} className="text-emerald-400 mb-3 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                  <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 tracking-tight">
                                    Accepted
                                  </h3>
                                  <p className="text-emerald-400/80 mt-1 font-medium text-sm">
                                    Solution passed all {submitResult.totalTestCases} test cases!
                                  </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-[#262626] border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                      <Clock size={16} className="text-blue-400" />
                                      <span className="text-sm font-medium">Runtime</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-2xl font-bold text-white font-mono">{submitResult.runtime || '0.00'}</span>
                                      <span className="text-sm text-gray-500">sec</span>
                                    </div>
                                    <div className="mt-2 text-xs text-emerald-400 font-medium bg-emerald-400/10 inline-block px-2 py-1 rounded w-fit">
                                      Optimal Speed
                                    </div>
                                  </div>

                                  <div className="bg-[#262626] border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                      <Database size={16} className="text-purple-400" />
                                      <span className="text-sm font-medium">Memory</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-2xl font-bold text-white font-mono">{submitResult.memory || '0.0'}</span>
                                      <span className="text-sm text-gray-500">KB</span>
                                    </div>
                                    <div className="mt-2 text-xs text-emerald-400 font-medium bg-emerald-400/10 inline-block px-2 py-1 rounded w-fit">
                                      Highly Efficient
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-[#262626] border border-gray-800 rounded-xl p-4">
                                  <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Submission Details</h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-500">Language</span>
                                      <span className="text-gray-200 font-medium bg-[#333] px-2 py-0.5 rounded">{langMap[selectedLanguage] || selectedLanguage}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-500">Submitted</span>
                                      <span className="text-gray-200">{new Date().toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-2xl font-bold text-red-500">
                                  <XCircle size={24} />
                                  {submitResult.error && submitResult.error !== "null" ? 'Error' : 'Rejected'}
                                </div>

                                <div className="bg-[#262626] p-4 rounded-lg border border-red-500/30 space-y-3">
                                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                    <span className="text-gray-400">Test Cases Passed</span>
                                    <span className="font-mono text-red-400 text-lg">
                                      {submitResult.passedTestCases}/{submitResult.totalTestCases}
                                    </span>
                                  </div>
                                  {submitResult.error && submitResult.error !== "null" && (
                                    <div className="pt-2">
                                      <span className="text-gray-400 block mb-2 text-sm flex items-center gap-2">
                                        <XCircle size={14} className="text-red-400"/> Error Output
                                      </span>
                                      <pre className="bg-[#1a1a1a] p-3 rounded-md text-red-400 text-xs font-mono overflow-x-auto border border-red-500/20">
                                        {submitResult.error}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
      `}</style>
    </div>
  );
};

export default ProblemPage;
