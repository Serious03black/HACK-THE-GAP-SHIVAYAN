import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const MyExams = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate =  useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axiosInstance.get('exam/user');
        setExams(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchExams();
  }, []);

  return (  
    <div className="bg-white shadow-lg mt-10 rounded-xl p-8 ">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">My Exams</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          { exams.map((exam) => (
            <div key={exam._id} className="bg-white shadow-lg rounded-xl p-8 mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{exam.name}</h3>
              <p className="text-gray-600">{exam.description}</p>
              <Link to={`/exam/view/${exam._id}`} className="text-purple-600 hover:underline"> View Exam </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};  

export default MyExams;
