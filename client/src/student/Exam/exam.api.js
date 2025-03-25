
import { toast } from 'react-toastify';
import axiosInstance from './../../services/axiosInstance';

export const fetchExamDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/student/exam/getExamDetails/${id}`);
    if (response.data.statusCode === 200) {
      return response.data.data.exam[0];
    }
  } catch (error) {
    toast.error('Failed to load exam details');
    console.error(error);
  }
  return null;
};

export const submitAnswer = async (question, answerObj, value) => {
  try {
    if (question.questionType.toLowerCase() === 'mcq') {
      await axiosInstance.post('/student/exam/submitMCQAnswer/' + answerObj.examId, answerObj);
      toast.success('MCQ answer submitted');
    } else if (['essay', 'coding'].includes(question.questionType.toLowerCase())) {
      await axiosInstance.post('/student/exam/submitAnswer', answerObj);
      toast.success(`${question.questionType} answer submitted`);
    } else if (question.questionType.toLowerCase() === 'assignment') {
      const formData = new FormData();
      Object.entries(answerObj).forEach(([key, val]) => formData.append(key, val));
      if (value instanceof File) formData.append('file', value);
      await axiosInstance.post('/student/exam/submitAnswer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Assignment submitted');
    }
  } catch (error) {
    toast.error(`Failed to submit ${question.questionType} answer`);
    console.error(error);
  }
};

export const submitExam = async (id) => {
    try {
        const response = await axiosInstance.post(`/student/exam/submitExam/${id}`);
        return response.data.success;
    } catch (error) {
        toast.error('Failed to submit exam');
        console.error(error);
        return false;
    }
};