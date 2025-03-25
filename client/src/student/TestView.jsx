import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import CodeEditor from './CodeEditor';

const TestView = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyesDetected, setEyesDetected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [fileLanguages, setFileLanguages] = useState({}); // Track language for each file upload
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const questions = [
    {
      type: 'mcq',
      text: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
    },
    {
      type: 'essay',
      text: 'Describe the impact of climate change in 200 words.',
    },
    {
      type: 'coding',
      text: 'Write a Python function to reverse a string.',
      language: 'python',
    },
    {
      type: 'assignment',
      text: 'Upload your project proposal.',
      allowedTypes: ['application/pdf', 'application/msword', 'text/plain'],
    },
    {
      type: 'assignment',
      text: 'Upload your code file.',
      allowedTypes: [
        'text/x-python', 'application/javascript', 'text/x-c++src', 'text/x-java',
        'text/x-csharp', 'text/x-go', 'text/x-ruby', 'text/x-php', 'text/x-rustsrc',
        'text/x-swift', 'text/x-kotlin', 'text/x-scala', 'text/x-perl', 'text/x-rsrc',
        'text/x-sql', 'text/x-sh', 'text/html', 'text/css', 'application/json',
        'application/x-yaml', 'text/markdown', 'text/x-dart', 'text/x-lua',
        'text/x-powershell', 'text/x-vbscript', 'application/xml'
      ],
    },
  ];

  const languageFileTypes = {
    python: ['text/x-python', '.py'],
    javascript: ['application/javascript', '.js'],
    typescript: ['text/typescript', '.ts'],
    java: ['text/x-java', '.java'],
    cpp: ['text/x-c++src', '.cpp', '.cxx', '.cc'],
    csharp: ['text/x-csharp', '.cs'],
    go: ['text/x-go', '.go'],
    ruby: ['text/x-ruby', '.rb'],
    php: ['text/x-php', '.php'],
    rust: ['text/x-rustsrc', '.rs'],
    swift: ['text/x-swift', '.swift'],
    kotlin: ['text/x-kotlin', '.kt'],
    scala: ['text/x-scala', '.scala'],
    perl: ['text/x-perl', '.pl'],
    r: ['text/x-rsrc', '.r'],
    sql: ['text/x-sql', '.sql'],
    shell: ['text/x-sh', '.sh'],
    html: ['text/html', '.html'],
    css: ['text/css', '.css'],
    json: ['application/json', '.json'],
    yaml: ['application/x-yaml', '.yaml', '.yml'],
    markdown: ['text/markdown', '.md'],
    dart: ['text/x-dart', '.dart'],
    lua: ['text/x-lua', '.lua'],
    powershell: ['text/x-powershell', '.ps1'],
    vb: ['text/x-vbscript', '.vb'],
    xml: ['application/xml', '.xml'],
    pdf: ['application/pdf', '.pdf'],
    doc: ['application/msword', '.doc', '.docx'],
    txt: ['text/plain', '.txt'],
  };

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    const loadFaceApiAndStart = async () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js';
      script.onload = () => startVideo();
      document.body.appendChild(script);
    };
    
    loadFaceApiAndStart();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      await window.faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await window.faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      }
      
      detectFaceAndEyes();
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const detectFaceAndEyes = async () => {
    if (!videoRef.current) return;

    const detection = await window.faceapi.detectSingleFace(
      videoRef.current,
      new window.faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();

    setFaceDetected(!!detection);
    
    if (detection) {
      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      setEyesDetected(leftEye.length > 0 && rightEye.length > 0);
    } else {
      setEyesDetected(false);
    }

    if (!testSubmitted) {
      setTimeout(detectFaceAndEyes, 500);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isFullScreen && !testSubmitted) {
        if (warnings < 2) {
          setWarnings(prev => prev + 1);
          toast.warn(`Warning ${warnings + 1} of 3: Stay in full screen mode`);
          setTimeout(() => document.documentElement.requestFullscreen(), 100);
        } else {
          setWarnings(3);
          setTestSubmitted(true);
          toast.error("Test submitted due to repeated full screen exits");
          if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [isFullScreen, warnings, testSubmitted]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleFileChange = (questionIndex, event) => {
    const file = event.target.files[0];
    const question = questions[questionIndex];
    const selectedLanguage = fileLanguages[questionIndex] || 'unknown';

    if (file) {
      const fileType = file.type || 'unknown';
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      const validTypes = question.allowedTypes;
      const langTypes = languageFileTypes[selectedLanguage] || [];

      const isValid = validTypes.some(type => 
        type === fileType || langTypes.includes(type) || langTypes.includes(fileExt)
      );

      if (isValid) {
        setFiles(prev => ({ ...prev, [questionIndex]: file }));
      } else {
        toast.error(`Invalid file type for ${selectedLanguage}. Allowed: ${validTypes.join(', ')}`);
      }
    }
  };

  const handleFileLanguageChange = (questionIndex, language) => {
    setFileLanguages(prev => ({ ...prev, [questionIndex]: language }));
  };

  const handleSlateChange = (questionIndex, value) => {
    const content = JSON.stringify(value);
    handleAnswerChange(questionIndex, content);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      editor.history = { undos: [], redos: [] };
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      editor.history = { undos: [], redos: [] };
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div>
            <p className="text-gray-700 text-lg mb-2">{question.text}</p>
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="block mb-2">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() => handleAnswerChange(index, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
      case 'essay':
        const initialValue = answers[index] ? JSON.parse(answers[index]) : [{ type: 'paragraph', children: [{ text: '' }] }];
        return (
          <div>
            <p className="text-gray-700 text-lg mb-2">{question.text}</p>
            <Slate editor={editor} initialValue={initialValue} onChange={(value) => handleSlateChange(index, value)}>
              <Editable
                className="border rounded p-2 min-h-[200px]"
                placeholder="Write your essay here..."
              />
            </Slate>
          </div>
        );
      // case 'coding':
      //   return (
      //     <CodeEditor
      //       question={question}
      //       onAnswerChange={(value) => handleAnswerChange(index, value)}
      //     />
      //   );
      case 'assignment':
        const fileLangOptions = Object.keys(languageFileTypes);
        return (
          <div>
            <p className="text-gray-700 text-lg mb-2">{question.text}</p>
            <div className="flex items-center mb-2">
              <select
                value={fileLanguages[index] || ''}
                onChange={(e) => handleFileLanguageChange(index, e.target.value)}
                className="border rounded p-1 mr-2 w-40"
              >
                <option value="">Select Language/Type</option>
                {fileLangOptions.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="file"
                onChange={(e) => handleFileChange(index, e)}
                className="mb-2"
              />
            </div>
            {files[index] && (
              <p className="text-green-600">Uploaded: {files[index].name} ({fileLanguages[index] || 'unknown'})</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (testSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600">Test Submitted</h2>
          <p className="mt-2">Your test has been automatically submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-16 bg-gray-800 text-white flex flex-col items-center py-4">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center cursor-pointer mb-2 rounded ${
              currentQuestion === index ? 'bg-gray-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="flex-1 p-6 relative">
        <div className="absolute top-4 left-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              className="w-32 h-32 rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <div className={`text-xs font-bold p-1 rounded ${
                faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                Face: {faceDetected ? '✓' : '✗'}
              </div>
              <div className={`text-xs font-bold p-1 rounded mt-1 ${
                eyesDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                Eyes: {eyesDetected ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-40">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Test in Progress</h1>
          <div className="bg-white p-4 rounded-lg shadow">
            {renderQuestion(questions[currentQuestion], currentQuestion)}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              Next
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