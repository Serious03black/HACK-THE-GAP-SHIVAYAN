import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from './../../services/axiosInstance';
import * as tf from "@tensorflow/tfjs";
import { createDetector, SupportedModels } from "@tensorflow-models/face-detection";

const TestView = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answerStartTimes, setAnswerStartTimes] = useState({});
  const [detector, setDetector] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const examId = useParams().id;
  const navigate = useNavigate();

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.setBackend('webgl');
        await tf.ready();
        const model = SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = { runtime: "tfjs", modelType: "short", maxFaces: 10 };
        const faceDetector = await createDetector(model, detectorConfig);
        setDetector(faceDetector);
        toast.success("Face detection model loaded!");
      } catch (error) {
        console.error("Error loading face detection model:", error);
        toast.error("Failed to load face detection model.");
      } finally {
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const disableBrowserEvents = () => {
      const handleBeforeUnload = (e) => {
        if (!testSubmitted) {
          e.preventDefault();
          e.returnValue = "Are you sure you want to leave? Your test will be submitted.";
          if (warningCount < 3) {
            setWarningCount(prev => prev + 1);
            toast.warn(`Warning ${warningCount + 1} of 3: Do not attempt to reload or close`);
          } else {
            setTestSubmitted(true);
            toast.error("Test submitted: Too many violations (reload/close)");
            stopVideo();
            submitAndRedirect();
          }
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden && !testSubmitted) {
          if (warningCount < 3) {
            setWarningCount(prev => prev + 1);
            toast.warn(`Warning ${warningCount + 1} of 3: Do not switch tabs`);
            document.documentElement.requestFullscreen();
          } else {
            setTestSubmitted(true);
            toast.error("Test submitted: Too many violations (tab switch)");
            stopVideo();
            submitAndRedirect();
          }
        }
      };

      const handleContextMenu = (e) => {
        e.preventDefault();
        toast.warn("Right-click is disabled during the test.");
      };

      const handleKeyDown = (e) => {
        if (!testSubmitted) {
          const blockedKeys = [
            'Escape', 'F11', 'F5', // Added Escape, ensured F11
            'Ctrl+r', 'Ctrl+R', 'Ctrl+t', 'Ctrl+T', 
            'Ctrl+w', 'Ctrl+W', 'Ctrl+n', 'Ctrl+N', 
            'Alt+F4', 'Alt+Tab' // Added Alt+Tab for additional control
          ];
          const keyCombo = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
          if (blockedKeys.includes(keyCombo) || blockedKeys.includes(e.key)) {
            e.preventDefault();
            if (warningCount < 3) {
              setWarningCount(prev => prev + 1);
              toast.warn(`Warning ${warningCount + 1} of 3: Keyboard shortcut (${keyCombo || e.key}) is disabled`);
            } else {
              setTestSubmitted(true);
              toast.error(`Test submitted: Too many violations (keyboard shortcut: ${keyCombo || e.key})`);
              stopVideo();
              submitAndRedirect();
            }
          }
        }
      };

      const handleFullScreenChange = () => {
        if (!document.fullscreenElement && isFullScreen && !testSubmitted) {
          if (warningCount < 3) {
            setWarningCount(prev => prev + 1);
            toast.warn(`Warning ${warningCount + 1} of 3: Stay in full screen mode`);
            document.documentElement.requestFullscreen();
          } else {
            setTestSubmitted(true);
            toast.error("Test submitted: Too many violations (exited fullscreen)");
            stopVideo();
            submitAndRedirect();
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullScreenChange);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
      };
    };

    const cleanup = disableBrowserEvents();
    return () => cleanup && cleanup();
  }, [isFullScreen, warningCount, testSubmitted]);

  const fetchQuestions = async () => {
    try {
      const response = await axiosInstance.get(`/student/exam/getExamDetails/${examId}`);
      if (response.data.statusCode === 200) {
        let exam = response.data.data.exam[0];
        exam.questions = [...exam.questions];
        setExamDetails(exam);
        setTimeLeft(exam.examDuration * 60);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
      toast.error('Failed to load exam details');
    }
  };

  useEffect(() => {
    fetchQuestions();
    if (!isModelLoading && detector) {
      startVideo();
    }
  }, [isModelLoading, detector]);

  useEffect(() => {
    if (timeLeft === null || testSubmitted) return;

    if (timeLeft <= 0) {
      setTestSubmitted(true);
      toast.error("Time's up! Test submitted automatically.");
      stopVideo();
      submitAndRedirect();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testSubmitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVideo = async () => {
    if (isModelLoading || !detector) {
      toast.error("Face detection model not ready.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          detectFace();
        };
      }
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Camera access denied or unavailable');
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const submitAndRedirect = async () => {
    try {
      await axiosInstance.post(`/student/exam/submitExam/${examId}`);
      toast.success("Exam submitted! Redirecting in 3 seconds...");
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error("Exam submission failed, but redirecting anyway...");
    } finally {
      setTimeout(() => navigate('/student/myExams'), 3000);
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || testSubmitted || !detector) return;

    try {
      const video = videoRef.current;
      await new Promise((resolve) => {
        if (video.readyState >= 2) resolve(); // Ensure video is ready
        else video.onloadeddata = resolve;
      });

      const tensor = tf.browser.fromPixels(video);
      console.log("Tensor shape:", tensor.shape);
      const detections = await detector.estimateFaces(tensor, { flipHorizontal: false });
      console.log("Detected faces:", detections);
      tf.dispose(tensor);

      if (detections.length === 0) {
        setFaceDetected(false);
        if (warningCount < 3) {
          setWarningCount(prev => prev + 1);
          toast.warn(`Warning ${warningCount + 1} of 3: No face detected`);
        } else {
          setTestSubmitted(true);
          toast.error("Test submitted: No face detected");
          stopVideo();
          submitAndRedirect();
        }
      } else if (detections.length > 1) {
        setFaceDetected(false);
        if (warningCount < 3) {
          setWarningCount(prev => prev + 1);
          toast.warn(`Warning ${warningCount + 1} of 3: Multiple faces detected (${detections.length})`);
        } else {
          setTestSubmitted(true);
          toast.error(`Test submitted: Multiple faces detected (${detections.length})`);
          stopVideo();
          submitAndRedirect();
        }
      } else {
        setFaceDetected(true);
        // Do not reset warningCount to maintain cumulative warnings
      }

      if (!testSubmitted) {
        requestAnimationFrame(detectFace); // Continuous detection
      }
    } catch (error) {
      console.error("Face detection error:", error);
      toast.error("Failed to detect faces.");
    }
  };

  const handleAnswerChange = async (questionIndex, value) => {
    const question = examDetails.questions[questionIndex];
    const startTime = answerStartTimes[questionIndex] || Date.now();
    const answerDuration = Math.floor((Date.now() - startTime) / 1000);

    const answerObj = {
      examId: examDetails._id,
      questionId: question._id,
      answerText: typeof value === 'object' && !(value instanceof File) ? JSON.stringify(value) : value,
      answerDuration,
      answerMarks: question.questionMarks,
      isAnswered: true,
      answerTime: new Date().toISOString()
    };

    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === question._id);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = answerObj;
        return newAnswers;
      }
      return [...prev, answerObj];
    });

    try {
      if (question.questionType.toLowerCase() === 'mcq') {
        await axiosInstance.post('/student/exam/submitMCQAnswer/' + examId, answerObj);
        toast.success('MCQ answer submitted successfully');
      } else if (question.questionType.toLowerCase() === 'essay') {
        await axiosInstance.post('/student/exam/submitAnswer', answerObj);
        toast.success('Essay answer submitted successfully');
      } else if (question.questionType.toLowerCase() === 'coding' || question.questionType.toLowerCase() === 'oa') {
        await axiosInstance.post('/student/exam/submitAnswer', answerObj);
        toast.success('Coding answer submitted successfully');
      } else if (question.questionType.toLowerCase() === 'assignment' || question.questionType.toLowerCase() === 'assignment_oa') {
        const formData = new FormData();
        for (const [key, val] of Object.entries(answerObj)) {
          formData.append(key, val);
        }
        if (value instanceof File) {
          formData.append('file', value);
        }
        await axiosInstance.post('/student/exam/submitAnswer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Assignment submitted successfully');
      } else if (question.questionType.toLowerCase() === 'short_answer') {
        await axiosInstance.post('/student/exam/submitAnswer', answerObj);
        toast.success('Short answer submitted successfully');
      }
    } catch (error) {
      console.error(`Error submitting ${question.questionType} answer:`, error);
      toast.error(`Failed to submit ${question.questionType} answer`);
    }
  };

  const handleNext = () => {
    if (examDetails && currentQuestion < examDetails.questions.length - 1) {
      setAnswerStartTimes(prev => ({ ...prev, [currentQuestion]: Date.now() }));
      setCurrentQuestion(prev => prev + 1);
      editor.history = { undos: [], redos: [] };
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setAnswerStartTimes(prev => ({ ...prev, [currentQuestion]: Date.now() }));
      setCurrentQuestion(prev => prev - 1);
      editor.history = { undos: [], redos: [] };
    }
  };

  const getAnswerForQuestion = (questionId) => {
    return answers.find(a => a.questionId === questionId);
  };

  const isQuestionAnswered = (questionId) => {
    const answer = getAnswerForQuestion(questionId);
    return answer && answer.isAnswered && answer.answerText !== '';
  };

  const getQuestionTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'mcq': return 'bg-blue-700';
      case 'essay': return 'bg-yellow-700';
      case 'coding': return 'bg-purple-700';
      case 'oa': return 'bg-purple-600';
      case 'assignment': return 'bg-orange-700';
      case 'assignment_oa': return 'bg-orange-600';
      case 'short_answer': return 'bg-teal-700';
      default: return 'bg-gray-700';
    }
  };

  const renderQuestion = (question, index) => {
    const answer = getAnswerForQuestion(question._id);
    const answered = isQuestionAnswered(question._id);

    switch (question.questionType.toLowerCase()) {
      case 'mcq':
        return (
          <div className={`p-4 rounded-lg shadow ${answered ? 'bg-green-100' : 'bg-white'}`}>
            <p className="text-gray-800 text-lg mb-2">{question.questionTitle}</p>
            <p className="text-gray-600 mb-2">{question.questionDescription}</p>
            {question.questionOptions.map((option, optIndex) => (
              <label key={optIndex} className="block mb-2">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answer?.answerText === option}
                  onChange={() => handleAnswerChange(index, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
      case 'essay':
        const initialValue = answer?.answerText 
          ? JSON.parse(answer.answerText) 
          : [{ type: 'paragraph', children: [{ text: '' }] }];
        return (
          <div className={`p-4 rounded-lg shadow ${answered ? 'bg-green-100' : 'bg-white'}`}>
            <p className="text-gray-800 text-lg mb-2">{question.questionTitle}</p>
            <p className="text-gray-600 mb-2">{question.questionDescription}</p>
            <Slate 
              editor={editor} 
              initialValue={initialValue} 
              onChange={(value) => handleAnswerChange(index, value)}
            >
              <Editable
                className="border rounded p-2 min-h-[200px] bg-gray-50 text-gray-800"
                placeholder="Write your essay here..."
              />
            </Slate>
          </div>
        );
      case 'coding':
      case 'oa':
        return (
          <div className={`p-4 rounded-lg shadow ${answered ? 'bg-green-100' : 'bg-white'}`}>
            <p className="text-gray-800 text-lg mb-2">{question.questionTitle}</p>
            <p className="text-gray-600 mb-2">{question.questionDescription}</p>
            <textarea
              value={answer?.answerText || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full h-40 p-2 border rounded bg-gray-50 text-gray-800"
              placeholder="Write your code here..."
            />
          </div>
        );
      case 'assignment':
      case 'assignment_oa':
        return (
          <div className={`p-4 rounded-lg shadow ${answered ? 'bg-green-100' : 'bg-white'}`}>
            <p className="text-gray-800 text-lg mb-2">{question.questionTitle}</p>
            <p className="text-gray-600 mb-2">{question.questionDescription}</p>
            <input
              type="file"
              onChange={(e) => handleAnswerChange(index, e.target.files[0])}
              className="mb-2 text-gray-800"
            />
            {answer?.answerText instanceof File && (
              <p className="text-green-600">Uploaded: {answer.answerText.name}</p>
            )}
          </div>
        );
      case 'short_answer':
        return (
          <div className={`p-4 rounded-lg shadow ${answered ? 'bg-green-100' : 'bg-white'}`}>
            <p className="text-gray-800 text-lg mb-2">{question.questionTitle}</p>
            <p className="text-gray-600 mb-2">{question.questionDescription}</p>
            <input
              type="text"
              value={answer?.answerText || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 text-gray-800"
              placeholder="Type your short answer here..."
            />
          </div>
        );
      default:
        return (
          <div className={`p-4 rounded-lg shadow ${answered ? 'bg-green-100' : 'bg-white'}`}>
            <p className="text-gray-800 text-lg mb-2">{question.questionTitle}</p>
            <p className="text-gray-600 mb-2">{question.questionDescription}</p>
            <p className="text-red-700">Question type {question.questionType} not implemented yet</p>
          </div>
        );
    }
  };

  const groupQuestionsByType = () => {
    const groups = { mcq: [], essay: [], coding: [], oa: [], assignment: [], assignment_oa: [], short_answer: [] };
    examDetails.questions.forEach((q, index) => {
      const type = q.questionType.toLowerCase();
      if (type === 'mcq') groups.mcq.push({ ...q, index });
      else if (type === 'essay') groups.essay.push({ ...q, index });
      else if (type === 'coding') groups.coding.push({ ...q, index });
      else if (type === 'oa') groups.oa.push({ ...q, index });
      else if (type === 'assignment') groups.assignment.push({ ...q, index });
      else if (type === 'assignment_oa') groups.assignment_oa.push({ ...q, index });
      else if (type === 'short_answer') groups.short_answer.push({ ...q, index });
    });
    return groups;
  };

  const handleSubmitExam = async () => {
    try {
      const response = await axiosInstance.post(`/student/exam/submitExam/${examId}`);
      if (response.data.success) {
        setTestSubmitted(true);
        toast.success("Exam submitted successfully! Redirecting in 3 seconds...");
        stopVideo();
        setTimeout(() => navigate('/student/myExams'), 3000);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam');
    }
  };

  if (testSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-700">Test Submitted</h2>
          <p className="mt-2 text-gray-800">Your test has been submitted. Redirecting to My Exams in 3 seconds...</p>
        </div>
      </div>
    );
  }

  if (!examDetails || isModelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800">
            {isModelLoading ? 'Loading face detection model...' : 'Loading exam...'}
          </h2>
        </div>
      </div>
    );
  }

  const questionGroups = groupQuestionsByType();

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="bg-gray-800 shadow p-4 flex justify-between items-center fixed top-0 left-64 right-0 z-10">
        <h1 className="text-2xl font-bold text-white">{examDetails.examName}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              className="w-40 h-24 rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <div className={`text-xs font-bold p-1 rounded ${
                faceDetected ? 'bg-green-600 text-white' : 'bg-red-700 text-white'
              }`}>
                Face: {faceDetected ? '✓' : '✗'}
              </div>
            </div>
          </div>
          <div className="text-xl font-semibold text-white">
            Time Left: <span className={timeLeft <= 300 ? 'text-red-700' : 'text-green-600'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 pt-16">
        <div className="w-64 bg-gray-700 text-white flex flex-col py-4 fixed top-0 bottom-0 overflow-y-auto">
          <div className="px-4 mb-4">
            <h2 className="text-lg font-bold">Questions</h2>
          </div>
          {questionGroups.mcq.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-blue-300">MCQs</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.mcq.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questionGroups.essay.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-yellow-300">Essays</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.essay.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questionGroups.coding.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-purple-300">Coding</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.coding.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questionGroups.oa.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-purple-200">Coding OA</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.oa.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questionGroups.assignment.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-orange-300">Assignments</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.assignment.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questionGroups.assignment_oa.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-orange-200">Assignment OA</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.assignment_oa.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questionGroups.short_answer.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-sm font-semibold text-teal-300">Short Answers</h3>
              <div className="flex flex-wrap px-4 gap-2">
                {questionGroups.short_answer.map((q) => (
                  <div
                    key={q.index}
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                      currentQuestion === q.index
                        ? 'bg-gray-600 text-white'
                        : isQuestionAnswered(q._id)
                        ? 'bg-green-600 text-white'
                        : getQuestionTypeColor(q.questionType) + ' text-white'
                    }`}
                    onClick={() => setCurrentQuestion(q.index)}
                  >
                    {q.index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 mt-20 ml-64 relative pb-20">
          {renderQuestion(examDetails.questions[currentQuestion], currentQuestion)}
          <div className="fixed bottom-0 left-64 right-0 bg-white p-4 shadow-lg flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 disabled:bg-gray-400"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === examDetails.questions.length - 1}
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 disabled:bg-gray-400"
            >
              Next
            </button>
            <button
              onClick={handleSubmitExam}
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default TestView;