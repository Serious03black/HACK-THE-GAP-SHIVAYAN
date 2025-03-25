import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { extractErrorMessage } from './../../components/customError';
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const CreateExam = () => {
  const [formData, setFormData] = useState({
    examName: "",
    examDate: "",
    examTime: "",
    examQualification: "",
    examType: "MCQ",
    examDuration: "",
    examDescription: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading('Creating exam...');

    try {
      const response = await axiosInstance.post("/university/exam/create", formData);
      if (response.status === 200) {
        toast.dismiss();
        toast.success("Exam created successfully!");
        setFormData({
          examName: "",
          examDate: "",
          examTime: "",
          examQualification: "",
          examType: "MCQ",
          examDuration: "",
          examDescription: "",
        });
        const _id = response.data.data.exam._id;
        setTimeout(() => navigate(`/university/addQuestions/${_id}`), 1000);
      } else {
        toast.dismiss();
        toast.error("Failed to create exam. Please try again.");
      }
    } catch (error) {
      console.log("error => ", error);
      const message = extractErrorMessage(error?.response?.data) || "Failed to create exam. Please try again.";
      toast.dismiss();
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Fixed Sidebar (Starts Below Navbar) */}
      <div
        className={`fixed top-12 bottom-0 left-0 w-64 bg-gradient-to-b from-green-600 to-green-700 text-white transition-transform duration-300 ease-in-out z-20 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-green-500">
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

      {/* Scrollable Main Content (Starts Immediately Below Navbar) */}
      <div className="flex-1 ml-0 md:ml-64 pt-12 overflow-y-auto min-h-screen">
        <div className="p-0"> {/* Removed padding to eliminate space */}
          <div className="max-w-5xl mx-auto"> {/* Increased width from max-w-3xl to max-w-5xl */}
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-green-700 hover:text-green-800 transition-all duration-200 px-6 pt-4"
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

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                <h2 className="text-2xl md:text-3xl font-bold">Create New Exam</h2>
                <p className="mt-1 text-yellow-100">Fill in the details to create a new examination</p>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Exam Name</label>
                  <input
                    type="text"
                    name="examName"
                    value={formData.examName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter exam name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Exam Date</label>
                    <input
                      type="date"
                      name="examDate"
                      value={formData.examDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Exam Time</label>
                    <input
                      type="time"
                      name="examTime"
                      value={formData.examTime}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Required Qualification</label>
                  <input
                    type="text"
                    name="examQualification"
                    value={formData.examQualification}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter required qualification"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Exam Duration (in minutes)</label>
                  <input
                    type="number"
                    name="examDuration"
                    value={formData.examDuration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter duration in minutes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Exam Type</label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 transition-all duration-200"
                  >
                    <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="OA">Online Assessment (OA)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Exam Description</label>
                  <textarea
                    name="examDescription"
                    value={formData.examDescription}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter a brief description of the exam"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <span>Creating Exam...</span>
                    ) : (
                      <span>Create Exam</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;