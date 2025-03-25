// AllExams.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

const AllExams = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching your exams...');
      const response = await axiosInstance.get('/student/exam/getMyExams');
      setExams(response?.data?.data?.exams);
      setFilteredExams(response?.data?.data?.exams);
      toast.dismiss();
      toast.success('Exams loaded successfully!');
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.dismiss();
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = exams.filter((exam) =>
      exam.examName.toLowerCase().includes(query)
    );
    setFilteredExams(filtered);
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/start/${examId}`);
    toast.success('Starting exam...');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen mb-10 bg-gray-100">
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
          {['Dashboard', 'myExams', 'Profile', 'Exam History', 'Settings'].map((item) => (
            <div
              key={item}
              onClick={() => navigate(`/student/${item.toLowerCase().replace(' ', '-')}`)}
              className={`p-4 cursor-pointer ${
                item === 'Exams' ? 'bg-green-600' : 'hover:bg-green-700'
              } transition-colors flex items-center space-x-2`}
            >
              <span>{item}</span>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Exams</h2>
            <input
              type="text"
              placeholder="Search exams by name..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 mb-4"
            />
            {loading ? <p>Loading...</p> : (
              filteredExams.length > 0 ? (
                filteredExams.map(exam => (
                  <div key={exam._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md mb-2">
                    <div>
                      <h3 className="text-lg font-medium">{exam.examName}</h3>
                      <p>Date: {exam.examDate} | Time: {exam.examTime} | Duration: {exam.examDuration} mins</p>
                    </div>
                    <button
                      onClick={() => handleStartExam(exam._id)}
                      className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md"
                    >
                      Start Exam
                    </button>
                  </div>
                ))
              ) : (
                <p>No exams available</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllExams;