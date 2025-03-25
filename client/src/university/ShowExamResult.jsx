import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from './../services/axiosInstance'; // Adjust path
import toast, { Toaster } from 'react-hot-toast';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ShowExamResult = () => {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchExamResult();
  }, [examId, studentId]);

  const fetchExamResult = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching exam result...');

      // Fetch student details
      const studentResponse = await axiosInstance.get(`/university/exam/getStudent/${studentId}`);
      if (studentResponse?.status === 200 || studentResponse?.data?.statusCode === 200) {
        setStudent(studentResponse?.data?.data?.student);
      } else {
        throw new Error(studentResponse.data.message || 'Failed to fetch student');
      }

      // Fetch exam result (assuming an endpoint exists)
      const resultResponse = await axiosInstance.get(`/university/exam/${examId}/student/${studentId}/result`);
      if (resultResponse.data.statusCode === 200) {
        setResult(resultResponse.data.data);
        toast.dismiss();
        toast.success('Result loaded!');
      } else {
        throw new Error(resultResponse.data.message || 'Failed to fetch result');
      }
    } catch (error) {
      console.error('Error fetching exam result:', error);
      toast.dismiss();
      toast.error('Failed to load exam result');
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
    navigate(`/university/students/${studentId}/exam-info`);
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

  // Prepare data for charts
  const barData = result ? {
    labels: result.answers.map(a => a.questionTitle.slice(0, 20) + (a.questionTitle.length > 20 ? '...' : '')),
    datasets: [
      {
        label: 'Marks Obtained',
        data: result.answers.map(a => a.marksObtained || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // Green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Max Marks',
        data: result.answers.map(a => a.maxMarks),
        backgroundColor: 'rgba(234, 179, 8, 0.7)', // Yellow
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 1,
      },
    ],
  } : {};

  const pieData = result ? {
    labels: ['Correct', 'Incorrect', 'Unanswered'],
    datasets: [
      {
        data: [
          result.answers.filter(a => a.marksObtained === a.maxMarks).length,
          result.answers.filter(a => a.marksObtained > 0 && a.marksObtained < a.maxMarks).length,
          result.answers.filter(a => a.marksObtained === 0).length,
        ],
        backgroundColor: ['#22c55e', '#eab308', '#d1d5db'], // Green, Yellow, Gray
        borderColor: ['#fff'],
        borderWidth: 2,
      },
    ],
  } : {};

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Performance Breakdown' },
    },
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
              Back to Exam Info
            </button>

            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700 tracking-tight">
              Exam Result for {student?.studentName || 'Student'}
            </h1>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-2xl p-6 text-center text-gray-600">Loading result...</div>
            ) : result ? (
              <>
                {/* Exam Summary */}
                <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-semibold text-green-700">{result.examName}</h2>
                      <p className="text-gray-600">Date: {result.examDate} {result.examTime}</p>
                      <p className="text-gray-600">Type: {result.examType}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-700">
                        Total Score: {result.totalMarksObtained} / {result.examMarks}
                      </p>
                      <p className="text-sm text-gray-600">Duration: {result.examDuration} min</p>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-2xl p-6">
                    <h3 className="text-lg font-semibold text-green-700 mb-4">Marks Distribution</h3>
                    <Bar data={barData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Marks per Question' } } }} />
                  </div>
                  <div className="bg-white rounded-xl shadow-2xl p-6">
                    <h3 className="text-lg font-semibold text-green-700 mb-4">Answer Breakdown</h3>
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  <h3 className="text-lg font-semibold text-green-700 p-4 bg-green-50">Question-wise Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-green-100 text-green-800">
                          <th className="p-4 text-left font-semibold">Question</th>
                          <th className="p-4 text-left font-semibold">Student Answer</th>
                          <th className="p-4 text-left font-semibold">Correct Answer</th>
                          <th className="p-4 text-left font-semibold">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.answers.map((answer, index) => (
                          <tr key={index} className="hover:bg-yellow-50 transition-all duration-200 border-b border-gray-200">
                            <td className="p-4">{answer.questionTitle}</td>
                            <td className="p-4">{answer.studentAnswer || 'Not Answered'}</td>
                            <td className="p-4">{answer.correctAnswer}</td>
                            <td className="p-4">{answer.marksObtained} / {answer.maxMarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-2xl p-6 text-center text-gray-600">
                No result available for this exam.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowExamResult;