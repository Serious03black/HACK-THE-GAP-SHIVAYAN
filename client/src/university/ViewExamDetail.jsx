import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "./../services/axiosInstance";
import AssignExam from "./AssignExam";
import toast, { Toaster } from 'react-hot-toast';

const ViewExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        toast.loading('Fetching exam details...');
        const response = await axiosInstance.get(`/university/exam/getExamDashboard/${examId}`);
        if (response.status === 200) {
          setExamData(response.data.data.exam[0]);
          toast.dismiss();
          toast.success('Exam details loaded!');
        }
      } catch (err) {
        setError("Failed to fetch exam details. Please try again.");
        console.error("Error fetching exam details:", err);
        toast.dismiss();
        toast.error('Failed to fetch exam details');
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [examId]);

  const sidebarItems = [
    { name: 'Dashboard', path: '/university/dashboard' },
    { name: 'Exams', path: '/university/exams', active: true },
    { name: 'Students', path: '/university/students' },
    { name: 'Profile', path: '/university/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/university/exams');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-green-100 items-center justify-center">
        <Toaster />
        <p className="text-green-700 text-lg font-medium animate-pulse">Loading exam details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-green-100 items-center justify-center">
        <Toaster />
        <p className="text-red-500 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-green-100 items-center justify-center">
        <Toaster />
        <p className="text-green-700 text-lg font-medium">No exam data found.</p>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-gray-100 to-green-100 min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '8px',
          },
          success: { style: { background: '#10B981' } },
          error: { style: { background: '#EF4444' } },
        }}
      />

      {/* Fixed Sidebar (Full Height, No Gap) */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-64 bg-gradient-to-b from-green-600 to-green-700 text-white transition-transform duration-300 ease-in-out z-20 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="pt-16 p-6 border-b border-green-500">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`p-4 cursor-pointer ${
                item.active ? 'bg-yellow-500 text-green-900' : 'hover:bg-green-500'
              } transition-all duration-200`}
            >
              {item.name}
            </div>
          ))}
          <div
            onClick={handleLogout}
            className="p-4 cursor-pointer hover:bg-green-500 transition-all duration-200"
          >
            Logout
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Toggle (Assumes Navbar is Above) */}
      <div className="md:hidden fixed top-0 left-0 z-30 w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Main Content (Starts Below Navbar) */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 overflow-y-auto min-h-screen">
        <div className="p-6 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-green-700 hover:text-green-800 transition-all duration-200"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Exams
            </button>

            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700 tracking-tight">
              Exam Details: <span className="text-yellow-500">{examData.examName}</span>
            </h1>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <h2 className="text-2xl md:text-3xl font-bold">{examData.examName}</h2>
                <p className="mt-2 text-green-100">Exam Overview</p>
              </div>

              {/* Exam Details */}
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-green-700">Exam Date</p>
                    <p className="mt-1 text-lg text-gray-800">{examData.examDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Exam Time</p>
                    <p className="mt-1 text-lg text-gray-800">{examData.examTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Required Qualification</p>
                    <p className="mt-1 text-lg text-gray-800">{examData.examQualification}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Exam Type</p>
                    <p className="mt-1 text-lg text-gray-800">{examData.examType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Duration</p>
                    <p className="mt-1 text-lg text-gray-800">{examData.examDuration} minutes</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Description</p>
                  <p className="mt-1 text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{examData.examDescription}</p>
                </div>
              </div>

              {/* Questions Section */}
              {examData.questions && examData.questions.length > 0 && (
                <div className="px-6 py-6 border-t border-gray-200">
                  <h3 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Questions</h3>
                  <div className="space-y-6">
                    {examData.questions.map((question, index) => (
                      <div
                        key={question._id}
                        className="bg-gray-50 p-4 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200"
                      >
                        <p className="text-sm text-green-600">
                          Question {index + 1} ({question.questionLevel})
                        </p>
                        <h4 className="text-lg font-medium text-green-800 mt-1">{question.questionTitle}</h4>
                        <p className="text-gray-700 mt-2">{question.questionDescription}</p>
                        <div className="mt-3">
                          <p className="text-sm text-green-700">Options:</p>
                          <ul className="list-disc list-inside text-gray-700">
                            {question.questionOptions.map((option, optIndex) => (
                              <li key={optIndex}>{option}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="mt-2 text-gray-700">
                          <span className="text-green-700 font-medium">Answer: </span>
                          {question.questionAnswer}
                        </p>
                        <p className="mt-2 text-gray-700">
                          <span className="text-green-700 font-medium">Marks: </span>
                          {question.questionMarks}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Students Section */}
              <div className="px-6 py-6 border-t border-gray-200">
                <h3 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Registered Students</h3>
                {examData.students && examData.students.length > 0 ? (
                  <div className="space-y-4">
                    {examData.students.map((student, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200"
                      >
                        <p className="text-gray-700">Student {index + 1}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No students registered for this exam yet.</p>
                )}
              </div>

              {/* Assign Exam Component */}
              <div className="px-6 py-6 border-t border-gray-200">
                <h3 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Assign Exam</h3>
                <AssignExam />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExamDetail;