import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './../services/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

const TotalExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      toast.loading('Fetching exams...');
      const response = await axiosInstance.get('/university/exam/getAllExams');
      if (response.data.statusCode === 200) {
        setExams(response.data.data.exams);
        toast.dismiss();
        toast.success('Exams fetched successfully!');
      } else {
        console.error('Failed to fetch exams:', response.data.message);
        toast.dismiss();
        toast.error('Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.dismiss();
      toast.error('Error fetching exams');
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    navigate('/university/dashboard');
  };

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
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-8">
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
              Back to Dashboard
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-4 sm:mb-0">
                Total Examinations
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 text-gray-800 transition-all duration-200 pl-10"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <Link
                  to="/university/createExam"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Exam
                </Link>
              </div>
            </div>

            {/* Exams List */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <div
                      key={exam._id}
                      className="px-6 py-4 hover:bg-green-50 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-green-800">{exam.examName}</h2>
                          <p className="text-sm text-gray-600 mt-1">{exam.examType}</p>
                          <p className="text-sm text-gray-700">
                            {exam.examDate} | {exam.examTime}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              exam.status === 'Scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {exam.status || 'Scheduled'}
                          </span>
                          <Link
                            to={`/university/addQuestions/${exam._id}`}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1 rounded-lg transition-all duration-200"
                          >
                            Edit Questions
                          </Link>
                          <Link
                            to={`/university/examDetails/${exam._id}`}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1 rounded-lg transition-all duration-200"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-600">
                    No exams found matching your search.
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="text-green-700 text-sm">
              Total Exams: <span className="font-semibold">{filteredExams.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalExams;