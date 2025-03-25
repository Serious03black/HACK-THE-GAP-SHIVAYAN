import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

const ExamHistory = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [examHistory, setExamHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    university: '',
    status: '',
    minScore: '',
  });

  useEffect(() => {
    fetchExamHistory();
  }, []);

  const fetchExamHistory = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching your exam history...');
      const response = await axiosInstance.get('/student/exam/attemptedExam');
      const exams = response?.data?.data?.exams || [];
      setExamHistory(exams);
      setFilteredHistory(exams);
      toast.dismiss();
      toast.success('Exam history loaded successfully!');
    } catch (error) {
      console.error('Error fetching exam history:', error);
      toast.dismiss();
      toast.error('Failed to load exam history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...examHistory];

    if (filters.date) {
      filtered = filtered.filter((exam) =>
        new Date(exam.completedDate).toLocaleDateString() === new Date(filters.date).toLocaleDateString()
      );
    }

    if (filters.university) {
      filtered = filtered.filter((exam) =>
        exam.universityName?.toLowerCase().includes(filters.university.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((exam) =>
        exam.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.minScore) {
      filtered = filtered.filter((exam) =>
        exam.totalMarks && exam.totalScore !== undefined
          ? (exam.totalScore / exam.totalMarks) * 100 >= parseInt(filters.minScore)
          : false
      );
    }

    setFilteredHistory(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, examHistory]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handleExamClick = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/student/dashboard' },
    { name: 'My Exams', path: '/student/myExams' },
    { name: 'Profile', path: '/student/profile' },
    { name: 'Exam History', path: '/student/exam-history' },
    { name: 'Settings', path: '/student/settings' },
  ];

  return (
    <div className="mt-10 flex min-h-screen bg-gray-100">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-green-800 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6 border-b border-green-700">
          <h2 className="text-2xl font-bold text-white">Student Portal</h2>
          <p className="text-sm text-green-200">Welcome Back!</p>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`p-4 cursor-pointer ${
                location.pathname === item.path ? 'bg-green-600' : 'hover:bg-green-700'
              } transition-colors flex items-center space-x-2`}
            >
              <span>{item.name}</span>
            </div>
          ))}
          <div
            onClick={handleLogout}
            className="p-4 cursor-pointer hover:bg-green-700 transition-colors flex items-center space-x-2 absolute bottom-4 w-full"
          >
            <span>Logout</span>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4 bg-green-800 text-white fixed top-0 left-0 z-30 w-full flex justify-between items-center">
        <h2 className="text-xl font-bold">Student Portal</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Exam History</h2>

            {/* Filter Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">University</label>
                <input
                  type="text"
                  name="university"
                  value={filters.university}
                  onChange={handleFilterChange}
                  placeholder="Enter university name"
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-2"
                >
                  <option value="">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Minimum Score (%)</label>
                <input
                  type="number"
                  name="minScore"
                  value={filters.minScore}
                  onChange={handleFilterChange}
                  placeholder="e.g., 70"
                  min="0"
                  max="100"
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            {/* Exam History List */}
            {loading ? (
              <p>Loading...</p>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((exam) => (
                <div
                  key={exam.examId}
                  onClick={() => handleExamClick(exam.examId)}
                  className="bg-gray-50 p-4 rounded-md mb-2 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-800">{exam.examName || 'Untitled Exam'}</h3>
                  <p className="text-gray-600">
                    Completed: {exam.completedDate ? new Date(exam.completedDate).toLocaleString() : 'N/A'} 
                    | Score: {exam.totalScore || 'N/A'}/{exam.totalMarks || 'N/A'}
                  </p>
                  <p className="text-gray-600">Status: {exam.status || 'Completed'}</p>
                  <p className="text-gray-600">University: {exam.universityName || 'N/A'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No exam history matches your filters</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHistory;