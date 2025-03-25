import React from 'react'
import { Routes, Route } from 'react-router-dom';
import UniversityLayout from '../../layouts/UniversityLayout'
import SignUp from "../../pages/university/SignUp";
import Login from "../../pages/university/Login";
import ForgotPassword from "../../pages/university/ForgotPassword.jsx";
import ResetPassword from '../../pages/university/ResetPassword';
import CreateExam from '../../pages/university/CreateExam';
import AddQuestions from '../../pages/university/AddQuestions';
import TotalExams from './../../university/TotalExams';
import ViewExamDetail from './../../university/ViewExamDetail';
import UniversityDashboard from './../../university/UniversityDashboard';
import UniversityProtection from './../../layouts/UniversityProtection';
import ShowAllStudents from './../../university/ShowAllStudents'; 
import UniversityProfile from '../../pages/university/UniversityProfile';
import SendExamInfo from './../../university/SendExamInfo';   // // This Component is to view the info about the exams that the student has taken


function UniversityRouter() {
  return (
    <Routes > 
      <Route path="/" element={<UniversityLayout />}>

          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />




          
             {/* Secure Routes */}
          <Route path="/" element={<UniversityProtection />}>

            <Route index element={<TotalExams />} />
            <Route path="/exams" element={<TotalExams />} />
            <Route path="/examDetails/:examId" element={<ViewExamDetail />} />
            <Route path="/createExam" element={<CreateExam />} />
            <Route path="/addQuestions/:examId" element={<AddQuestions />} />



            <Route path="/dashboard" element={<UniversityDashboard />} />
            <Route path="/students" element={<ShowAllStudents />} />
            <Route path="/students/:studentId/exam-info" element={<SendExamInfo />} />
            <Route path="/profile" element={<UniversityProfile />} />


          </Route>
         
        
      </Route>
    </Routes>
  )
}

export default UniversityRouter