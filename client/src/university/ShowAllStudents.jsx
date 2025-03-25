import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './../services/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

const ShowAllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredStudent, setHoveredStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching students...');
      const response = await axiosInstance.get('/university/exam/getAllStudents');
      if (response.data.statusCode === 200) {
        setStudents(response.data.data.students);
        toast.dismiss();
        toast.success('Students loaded!');
      } else {
        throw new Error(response.data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.dismiss();
      toast.error('Failed to load students');
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
    navigate('/university/dashboard');
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/university/dashboard' },
    { name: 'Exams', path: '/university/exams' },
    { name: 'Students', path: '/university/students', active: true },
    { name: 'Profile', path: '/university/profile' },
  ];

  // Filter students based on search term and registration date
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.studentPhone.includes(searchTerm);
    const registrationDate = new Date(student.createdAt).toISOString().split('T')[0]; // Format to YYYY-MM-DD
    const matchesDate = filterDate ? registrationDate === filterDate : true;
    return matchesSearch && matchesDate;
  });

  // Format date for display
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

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 z-30 w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 overflow-y-auto min-h-screen">
        <div className="p-6 md:p-8">
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700 tracking-tight">
              All Students
            </h1>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-1/2">
                  <input
                    type="text"
                    placeholder="Search by email or phone..."
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

                {/* Date Filter */}
                <div className="w-full sm:w-1/3">
                  <label className="block mb-1 font-medium text-green-700">Filter by Registration Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
              {loading ? (
                <p className="p-6 text-center text-gray-600">Loading students...</p>
              ) : filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-green-50 text-green-800">
                        <th className="p-4 text-left font-semibold">Name</th>
                        <th className="p-4 text-left font-semibold">Email</th>
                        <th className="p-4 text-left font-semibold">Phone</th>
                        <th className="p-4 text-left font-semibold">Registration Date</th>
                        <th className="p-4 text-left font-semibold">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-yellow-50 transition-all duration-200 border-b border-gray-200 relative"
                          onMouseEnter={() => setHoveredStudent(student)}
                          onMouseLeave={() => setHoveredStudent(null)}
                        >
                          <td className="p-4">{student.studentName}</td>
                          <td className="p-4">{student.studentEmail}</td>
                          <td className="p-4">{student.studentPhone}</td>
                          <td className="p-4">{formatDate(student.createdAt)}</td>
                          <td className="p-4">{formatDate(student.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-6 text-center text-gray-600">No students found.</p>
              )}

              {/* Hover Popup */}
              {hoveredStudent && (
                <div className="absolute z-30 bg-white rounded-lg shadow-xl p-4 border border-green-200 w-80 transform -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2">
                  <div className="flex items-center space-x-4">
                    <img
                      src={hoveredStudent.studentPhoto.secure_url}
                      alt={hoveredStudent.studentName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-green-700">{hoveredStudent.studentName}</h3>
                      <p className="text-sm text-gray-600">{hoveredStudent.studentEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-green-700">Phone:</span> {hoveredStudent.studentPhone}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-green-700">Registered:</span> {formatDate(hoveredStudent.createdAt)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-green-700">Last Updated:</span> {formatDate(hoveredStudent.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-green-700">ID:</span> {hoveredStudent._id}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="text-green-700 text-sm">
              Total Students: <span className="font-semibold">{filteredStudents.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowAllStudents;