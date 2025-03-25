import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

const ShowExamInfo = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedExam, setExpandedExam] = useState(null); // For questions
  const [expandedResult, setExpandedResult] = useState(null); // For results

  useEffect(() => {
    fetchStudentExamInfo();
  }, [studentId]);

  const fetchStudentExamInfo = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching exam info...');

      const studentResponse = await axiosInstance.get(`/university/exam/getStudent/${studentId}`);
      console.log("studentResponse:", studentResponse?.data?.data);

      if (studentResponse?.status === 200 || studentResponse?.data?.statusCode === 200) {
        setStudent(studentResponse?.data?.data?.student);
      } else {
        throw new Error(studentResponse.data.message || 'Failed to fetch student');
      }

      const examsResponse = await axiosInstance.get(`/university/exam/student/${studentId}/exams`);
      console.log("examsResponse:", examsResponse);

      if (examsResponse.data.statusCode === 200) {
        setExams(examsResponse.data.data.exams);
        toast.dismiss();
        toast.success('Exam info loaded!');
      } else {
        throw new Error(examsResponse.data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exam info:', error);
      toast.dismiss();
      toast.error('Failed to load exam info');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/university/students');
  };

  const toggleExamQuestions = (examId) => {
    setExpandedExam(expandedExam === examId ? null : examId);
    if (expandedResult === examId) setExpandedResult(null); // Close result if open
  };

  const toggleExamResult = (examId) => {
    setExpandedResult(expandedResult === examId ? null : examId);
    if (expandedExam === examId) setExpandedExam(null); // Close questions if open
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/university/dashboard' },
    { name: 'Exams', path: '/university/exams' },
    { name: 'Students', path: '/university/students', active: true },
    { name: 'Profile', path: '/university/profile' },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 to-green-100 min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#10B981', color: '#fff', borderRadius: '8px' },
          success: { style: { background: '#10B981' } },
          error: { style: { background: '#EF4444' } },
        }}
      />

      {/* Sidebar */}
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
              className={`p-4 cursor-pointer ${item.active ? 'bg-yellow-500 text-green-900' : 'hover:bg-green-500'} transition-all duration-200`}
            >
              {item.name}
            </div>
          ))}
          <div onClick={handleLogout} className="p-4 cursor-pointer hover:bg-green-500 transition-all duration-200">
            Logout
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 z-30 w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 overflow-y-auto min-h-screen">
        <div className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-green-700 hover:text-green-800 transition-all duration-200"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Students
            </button>

            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700 tracking-tight">
              Exam Info for {student?.studentName || 'Student'}
            </h1>

            {/* Student Details */}
            {student && (
              <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
                <div className="flex items-center space-x-6">
                  <img
                    src={student?.studentPhoto?.secure_url}
                    alt={student?.studentName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-green-500"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold text-green-700">{student.studentName}</h2>
                    <p className="text-gray-600">{student.studentEmail}</p>
                    <p className="text-gray-600">{student.studentPhone}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium text-green-700">Registered:</span> {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Exams List */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              {loading ? (
                <p className="p-6 text-center text-gray-600">Loading exam info...</p>
              ) : exams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-green-50 text-green-800">
                        <th className="p-4 text-left font-semibold">Exam Name</th>
                        <th className="p-4 text-left font-semibold">Date & Time</th>
                        <th className="p-4 text-left font-semibold">Type</th>
                        <th className="p-4 text-left font-semibold">Duration (min)</th>
                        <th className="p-4 text-left font-semibold">Marks</th>
                        <th className="p-4 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((exam) => (
                        <React.Fragment key={exam._id}>
                          <tr className="hover:bg-yellow-50 transition-all duration-200 border-b border-gray-200">
                            <td className="p-4">{exam.examName}</td>
                            <td className="p-4">{`${exam.examDate} ${exam.examTime}`}</td>
                            <td className="p-4">{exam.examType}</td>
                            <td className="p-4">{exam.examDuration}</td>
                            <td className="p-4">{exam.examMarks || 'N/A'}</td>
                            <td className="p-4 flex space-x-2">
                              <button
                                onClick={() => toggleExamQuestions(exam._id)}
                                className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-200"
                              >
                                {expandedExam === exam._id ? 'Hide Questions' : 'Show Questions'}
                              </button>
                              <button
                                onClick={() => toggleExamResult(exam._id)}
                                className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all duration-200"
                              >
                                {expandedResult === exam._id ? 'Hide Result' : 'Result'}
                              </button>
                            </td>
                          </tr>
                          {expandedExam === exam._id && (
                            <tr>
                              <td colSpan="6" className="p-4 bg-gray-50">
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-green-700">Questions</h3>
                                  {exam.questions.length > 0 ? (
                                    <table className="w-full border-collapse">
                                      <thead>
                                        <tr className="bg-green-100 text-green-800">
                                          <th className="p-2 text-left font-semibold">Title</th>
                                          <th className="p-2 text-left font-semibold">Type</th>
                                          <th className="p-2 text-left font-semibold">Marks</th>
                                          <th className="p-2 text-left font-semibold">Level</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {exam.questions.map((question) => (
                                          <tr key={question._id} className="border-b border-gray-200">
                                            <td className="p-2">{question.questionTitle}</td>
                                            <td className="p-2">{question.questionType}</td>
                                            <td className="p-2">{question.questionMarks}</td>
                                            <td className="p-2">{question.questionLevel}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-gray-600">No questions found for this exam.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          {expandedResult === exam._id && (
                            <tr>
                              <td colSpan="6" className="p-4 bg-gray-50">
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-blue-700">Exam Result Analytics</h3>
                                  {exam.results && exam.results.length > 0 ? (
                                    <>
                                      <table className="w-full border-collapse">
                                        <thead>
                                          <tr className="bg-blue-100 text-blue-800">
                                            <th className="p-2 text-left font-semibold">Question</th>
                                            <th className="p-2 text-left font-semibold">Student Answer</th>
                                            <th className="p-2 text-left font-semibold">Correct Answer</th>
                                            <th className="p-2 text-left font-semibold">Marks Obtained</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {exam.results.map((result, index) => {
                                            const question = exam.questions.find(q => q._id === result.questionId);
                                            return (
                                              <tr key={index} className="border-b border-gray-200">
                                                <td className="p-2">{question?.questionTitle || 'N/A'}</td>
                                                <td className="p-2">{result.studentAnswer || 'Not Answered'}</td>
                                                <td className="p-2">{result.correctAnswer || question?.questionAnswer || 'N/A'}</td>
                                                <td className="p-2">{result.marksObtained !== undefined ? result.marksObtained : 'N/A'}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                      <div className="text-blue-700">
                                        Total Marks Obtained: <span className="font-semibold">
                                          {exam.results.reduce((sum, r) => sum + (r.marksObtained || 0), 0)} / {exam.examMarks || 'N/A'}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-gray-600">Student has not taken this exam yet.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-6 text-center text-gray-600">No exams assigned to this student yet.</p>
              )}
            </div>

            {/* Summary */}
            <div className="text-green-700 text-sm">
              Total Exams Assigned: <span className="font-semibold">{exams.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowExamInfo;