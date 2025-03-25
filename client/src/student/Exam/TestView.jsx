import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { useParams } from 'react-router-dom';
import axiosInstance from './../../services/axiosInstance';

const TestView = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warnings, setWarnings] = useState({
    fullscreen: 0,
    tabSwitch: 0,
    face: 0,
    eyes: 0,
  });
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyesDetected, setEyesDetected] = useState(false);
  const [eyesLookingAway, setEyesLookingAway] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of answer objects
  const [examDetails, setExamDetails] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answerStartTimes, setAnswerStartTimes] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const examId = useParams().id;

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { id } = useParams();

  const fetchQuestions = async () => {
    try {
      const response = await axiosInstance.get(`/student/exam/getExamDetails/${id}`);
      if (response.data.statusCode === 200) {
        let exam = response.data.data.exam[0];
        exam.questions = [
          ...exam.questions,
          {
            _id: "67e1b18a85d997b8b6ce8f75",
            questionType: "Essay",
            questionTitle: "Describe your favorite algorithm",
            questionDescription: "Write a 200-word essay.",
            questionMarks: 5,
            questionLevel: "Medium",
          },
          {
            _id: "67e1b18a85d997b8b6ce8f76",
            questionType: "Coding",
            questionTitle: "Reverse a string",
            questionDescription: "Write a function in Python.",
            questionMarks: 10,
            questionLevel: "Hard",
          },
          {
            _id: "67e1b18a85d997b8b6ce8f77",
            questionType: "Assignment",
            questionTitle: "Upload your project",
            questionDescription: "Submit a PDF file.",
            questionMarks: 15,
            questionLevel: "Medium",
          },
        ];
        setExamDetails(exam);
        setTimeLeft(exam.examDuration * 60);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
      toast.error('Failed to load exam details');
    }
  };

  useEffect(() => {
    const loadFaceApiAndStart = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js';
        script.onload = async () => {
          await loadModels();
          startVideo();
        };
        script.onerror = () => toast.error('Failed to load face-api.js');
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading face-api.js:', error);
        toast.error('Error initializing face detection');
      }
    };

    fetchQuestions();
    loadFaceApiAndStart();
  }, []);

  const loadModels = async () => {
    try {
      await window.faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await window.faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      console.log('Face detection models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load face detection models');
    }
  };

  useEffect(() => {
    if (timeLeft === null || testSubmitted) return;

    if (timeLeft <= 0) {
      setTestSubmitted(true);
      toast.error("Time's up! Test submitted automatically.");
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video stream started');
          detectFaceAndEyes();
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

  const detectFaceAndEyes = async () => {
    if (!videoRef.current || testSubmitted || !window.faceapi) return;

    try {
      const detection = await window.faceapi.detectSingleFace(
        videoRef.current,
        new window.faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (!detection) {
        setFaceDetected(false);
        if (warnings.face < 3) {
          setWarnings(prev => ({ ...prev, face: prev.face + 1 }));
          toast.warn(`Warning ${warnings.face + 1} of 3: Face not detected`);
        } else {
          setTestSubmitted(true);
          toast.error("Test submitted: Face not detected after 3 warnings");
          if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        }
      } else {
        setFaceDetected(true);
        setWarnings(prev => ({ ...prev, face: 0 }));

        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const eyesPresent = leftEye.length > 0 && rightEye.length > 0;
        setEyesDetected(eyesPresent);

        if (eyesPresent) {
          const videoWidth = videoRef.current.videoWidth;
          const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
          const isLookingAway = eyeCenterX < videoWidth * 0.3 || eyeCenterX > videoWidth * 0.7;

          if (isLookingAway) {
            setEyesLookingAway(true);
            if (warnings.eyes < 3) {
              setWarnings(prev => ({ ...prev, eyes: prev.eyes + 1 }));
              toast.warn(`Warning ${warnings.eyes + 1} of 3: Eyes looking away from screen`);
            }
          } else {
            setEyesLookingAway(false);
            setWarnings(prev => ({ ...prev, eyes: 0 }));
          }
        } else if (warnings.eyes < 3) {
          setWarnings(prev => ({ ...prev, eyes: prev.eyes + 1 }));
          toast.warn(`Warning ${warnings.eyes + 1} of 3: Eyes not detected`);
        }
      }

      if (!testSubmitted) {
        setTimeout(detectFaceAndEyes, 500);
      }
    } catch (error) {
      console.error('Error in face/eye detection:', error);
      toast.error('Face/eye detection failed');
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isFullScreen && !testSubmitted) {
        const confirmExit = window.confirm(
          `Are you sure you want to exit fullscreen mode?\n- "Yes" will exit and submit the test after warnings.\n- "No" will keep you in fullscreen mode.`
        );

        if (confirmExit) {
          if (warnings.fullscreen < 3) {
            setWarnings(prev => ({ ...prev, fullscreen: prev.fullscreen + 1 }));
            toast.warn(`Warning ${warnings.fullscreen + 1} of 3: Stay in full screen mode`);
            setTimeout(() => document.documentElement.requestFullscreen(), 100);
          } else {
            setTestSubmitted(true);
            toast.error("Test submitted: Exited full screen after 3 warnings");
            if (videoRef.current?.srcObject) {
              videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
          }
        } else {
          setTimeout(() => document.documentElement.requestFullscreen(), 100);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !testSubmitted) {
        const confirmTabSwitch = window.confirm(
          `Are you sure you want to switch tabs?\n- "Yes" will count as a warning and may submit the test after 3 attempts.\n- "No" will keep you in the test.`
        );

        if (confirmTabSwitch) {
          if (warnings.tabSwitch < 3) {
            setWarnings(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
            toast.warn(`Warning ${warnings.tabSwitch + 1} of 3: Do not switch tabs`);
          } else {
            setTestSubmitted(true);
            toast.error("Test submitted: Tab switched after 3 warnings");
            if (videoRef.current?.srcObject) {
              videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
          }
        } else {
          toast.info("Please stay on the test tab to continue.");
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFullScreen, warnings, testSubmitted]);

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
        const response = await axiosInstance.post('/student/exam/submitMCQAnswer/' + examId, answerObj);

        console.log("response :",response);


        toast.success('MCQ answer submitted successfully');
      } else if (question.questionType.toLowerCase() === 'essay') {
        const response = await axiosInstance.post('/student/exam/submitAnswer', answerObj);
        toast.success('Essay answer submitted successfully');
      } else if (question.questionType.toLowerCase() === 'coding') {
        const response = await axiosInstance.post('/student/exam/submitAnswer', answerObj);
        toast.success('Coding answer submitted successfully');
      } else if (question.questionType.toLowerCase() === 'assignment') {
        const formData = new FormData();
        for (const [key, val] of Object.entries(answerObj)) {
          formData.append(key, val);
        }
        if (value instanceof File) {
          formData.append('file', value);
        }
        const response = await axiosInstance.post('/student/exam/submitAnswer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Assignment submitted successfully');
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
      case 'assignment': return 'bg-orange-700';
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
    const groups = { mcq: [], essay: [], coding: [], assignment: [] };
    examDetails.questions.forEach((q, index) => {
      const type = q.questionType.toLowerCase();
      if (type === 'mcq') groups.mcq.push({ ...q, index });
      else if (type === 'essay') groups.essay.push({ ...q, index });
      else if (type === 'coding') groups.coding.push({ ...q, index });
      else if (type === 'assignment') groups.assignment.push({ ...q, index });
    });
    return groups;
  };


  const handleSubmitExam = async () => {
    console.log("Submitting exam with answers:", answers);
    try {
      const response = await axiosInstance.post(`/student/exam/submitExam/${id}`, {
        answers, // Send the answers array
      });
      console.log("Response:", response.data);
      toast.success("Exam submitted successfully!");
      setTestSubmitted(true); // Mark test as submitted
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop()); // Stop camera
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error(error?.response?.data?.message || "Failed to submit exam");
    }
  };
  
  if (testSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-700">Test Submitted</h2>
          <p className="mt-2 text-gray-800">Your test has been automatically submitted.</p>
        </div>
      </div>
    );
  }

  if (!examDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  const questionGroups = groupQuestionsByType();

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
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
              <div className={`text-xs font-bold p-1 rounded mt-1 ${
                eyesDetected && !eyesLookingAway ? 'bg-green-600 text-white' : 'bg-red-700 text-white'
              }`}>
                Eyes: {eyesDetected && !eyesLookingAway ? '✓' : '✗'}
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
        {/* Wide Sidebar */}
        <div className="w-64 bg-gray-700 text-white flex flex-col py-4 fixed top-0 bottom-0 overflow-y-auto">
          <div className="px-4 mb-4">
            <h2 className="text-lg font-bold">Questions</h2>
          </div>
          {/* MCQ Section */}
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
          {/* Essay Section */}
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
          {/* Coding Section */}
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
          {/* Assignment Section */}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 mt-20 ml-64 relative pb-20">
          {/* Question Content */}
          {renderQuestion(examDetails.questions[currentQuestion], currentQuestion)}

          {/* Fixed Navigation Buttons */}
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
              disabled={currentQuestion === examDetails.questions.length - 1}
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 disabled:bg-gray-400"
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