import React, { useState, useEffect } from 'react';
import axiosInstance from './../services/axiosInstance';
import { useParams } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const AssignExam = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { examId } = useParams();

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching students...');
      const response = await axiosInstance.get('/university/exam/getAllStudents');
      setAllStudents(response.data.data.students);
      toast.dismiss();
      toast.success('Students fetched successfully!');
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.dismiss();
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim()) {
      const filteredSuggestions = allStudents.filter(
        (student) =>
          student.studentEmail.toLowerCase().includes(value.toLowerCase()) ||
          (student.studentPhone && student.studentPhone.includes(value))
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (student) => {
    if (!selectedStudents.some((s) => s._id === student._id)) {
      setSelectedStudents([...selectedStudents, student]);
      toast.success(`${student.studentName} added!`);
    } else {
      toast.error('Student already added!');
    }
    setSearchInput('');
    setSuggestions([]);
  };

  const handleAddStudent = () => {
    if (!searchInput.trim()) {
      toast.error('Please enter a phone or email!');
      return;
    }

    const student = allStudents.find(
      (s) => s.studentPhone === searchInput || s.studentEmail === searchInput
    );

    if (student && !selectedStudents.some((s) => s._id === student._id)) {
      setSelectedStudents([...selectedStudents, student]);
      toast.success(`${student.studentName} added!`);
      setSearchInput('');
      setSuggestions([]);
    } else {
      toast.error('Student not found or already added!');
    }
  };

  const handleRemoveStudent = (studentId) => {
    const student = selectedStudents.find((s) => s._id === studentId);
    setSelectedStudents(selectedStudents.filter((s) => s._id !== studentId));
    toast.success(`${student.studentName} removed!`);
  };

  const handleSendExam = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please add at least one student!');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Assigning exam...');
      const studentIds = selectedStudents.map((s) => s._id);
      await axiosInstance.post(`/university/exam/assignExam/${examId}`, { studentIds });
      toast.dismiss();
      toast.success('Exam assigned successfully!');
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error sending exam:', error);
      toast.dismiss();
      toast.error('Failed to assign exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#10B981', // Green background
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
          <h2 className="text-2xl md:text-3xl font-bold">Assign Exam</h2>
          <p className="mt-1 text-yellow-100">Select students to assign the exam</p>
        </div>

        <div className="p-6">
          {/* Search Section */}
          <div className="relative mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by Phone or Email"
                value={searchInput}
                onChange={handleSearch}
                className="flex-1 p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 text-gray-800 transition-all duration-200"
              />
              <button
                onClick={handleAddStudent}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200"
              >
                Add
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleSuggestionClick(student)}
                    className="p-3 hover:bg-green-50 cursor-pointer transition-colors duration-200"
                  >
                    <p className="font-medium text-green-800">{student.studentName}</p>
                    <p className="text-sm text-gray-600">
                      {student.studentEmail} {student.studentPhone ? `| ${student.studentPhone}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Students */}
          <div className="max-h-72 overflow-y-auto mb-6">
            {selectedStudents.length > 0 ? (
              selectedStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-3 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-green-800">{student.studentName}</p>
                    <p className="text-sm text-gray-600">
                      {student.studentEmail} {student.studentPhone ? `| ${student.studentPhone}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student._id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No students selected yet.</p>
            )}
          </div>

          {selectedStudents.length > 0 && (
            <p className="text-sm text-green-700 mb-6">
              {selectedStudents.length} student(s) selected
            </p>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendExam}
              disabled={loading || selectedStudents.length === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-green-700 shadow-md transition-all duration-300"
            >
              {loading ? 'Sending...' : 'Send Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignExam;