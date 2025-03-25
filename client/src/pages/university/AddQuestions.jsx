import { useState, useEffect } from "react";
import gsap from "gsap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { extractErrorMessage } from "../../components/customError";

const AddQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    type: "MCQ",
    description: "",
    marks: "",
    level: "Easy",
    time: "",
    options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
    codingLanguage: "javascript",
  });
  const [expandedSections, setExpandedSections] = useState({
    questionList: true,
    addQuestion: false,
  });
  const [questionDescription, setQuestionDescription] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // GSAP animations and fetch old questions
  useEffect(() => {
    const icons = document.querySelectorAll(".floating-icon");
    icons.forEach((icon) => {
      gsap.to(icon, {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });

    const getOldQuestions = async () => {
      try {
        const response = await axiosInstance.get(`/university/exam/getOldQuestions/${examId}`, {
          headers: { "Content-Type": "application/json" },
        });
        const allQuestions = response?.data?.data?.questions;
        const formattedQuestions = allQuestions.map((q) => ({
          title: q.questionTitle,
          description: q.questionDescription,
          type: q.questionType,
          marks: q.questionMarks,
          level: q.questionLevel,
          options: q.questionOptions,
          codingLanguage: q.questionAnswer,
          time: q.questionTime,
          _id: q._id,
        }));
        setQuestions(formattedQuestions);
      } catch (error) {
        toast.error("Failed to fetch existing questions.");
      }
    };
    getOldQuestions();
  }, [examId]);

  useEffect(() => {
    if (newQuestion.title.trim().length > 3) {
      fetchAiSuggestions(newQuestion.title);
    }
  }, [newQuestion.title]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (e) => {
    setQuestionDescription(e.target.value);
  };

  const addOption = () => {
    if (newQuestion.options.length < 6) {
      setNewQuestion((prev) => ({
        ...prev,
        options: [...prev.options, { text: "", isCorrect: false }],
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = value;
    setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
  };

  const setCorrectOption = (index) => {
    const updatedOptions = newQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
  };

  const deleteOption = (index) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title || !newQuestion.marks || !newQuestion.time) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const options = [];
      let rightAns = undefined;
      if (newQuestion.options) {
        for (let i = 0; i < newQuestion?.options?.length; i++) {
          options.push(newQuestion.options[i].text);
          if (newQuestion.options[i].isCorrect) {
            rightAns = newQuestion.options[i].text;
          }
        }
      }
      const questionData = {
        exam: examId,
        questionTitle: newQuestion.title,
        questionDescription: questionDescription,
        questionType: newQuestion.type,
        questionOptions: options,
        questionAnswer: rightAns,
        questionMarks: newQuestion.marks,
        questionLevel: newQuestion.level,
      };
      const response = await axiosInstance.post("/university/exam/addQuestions", questionData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response?.data?.data?.statusCode == 201 || response?.data?.status == 201 || response?.status == 200) {
        toast.success("Question added successfully!");
        setQuestions((prev) => [...prev, newQuestion]);
        resetQuestionForm();
      } else {
        toast.error(extractErrorMessage(response?.data?.message) || "Failed to add question");
      }
    } catch (error) {
      toast.error(extractErrorMessage(error?.response?.data) || "Failed to add question");
    }
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      title: "",
      type: "MCQ",
      description: "",
      marks: "",
      level: "Easy",
      time: "",
      options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
      codingLanguage: "javascript",
    });
    setQuestionDescription("");
    setAiSuggestions(null);
  };

  const handleRemoveQuestion = async (_id, e) => {
    if (e) e.preventDefault();
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await axiosInstance.delete(`/university/exam/removeQuestion/${_id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (response?.data?.statusCode === 200) {
          toast.success("Question removed successfully!");
          setQuestions((prev) => prev.filter((question) => question._id !== _id));
        } else {
          toast.error(extractErrorMessage(response?.data?.message) || "Failed to remove question");
        }
      } catch (error) {
        toast.error(extractErrorMessage(error?.response?.data) || "Failed to remove question");
      }
    }
  };

  const fetchAiSuggestions = async (title) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/university/exam/generate-description", { 
        inputText: title,
        type: newQuestion.type || ""
      });
      setAiSuggestions(response?.data?.data?.description?.trim());
    } catch (error) {
      console.error("AI Suggestion Error:", error);
    }
    setLoading(false);
  };

  const handleImplementAi = () => {
    setQuestionDescription(aiSuggestions);
    setAiSuggestions(null);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
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
      <ToastContainer />

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
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
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
              Back to Exams
            </button>

            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700 tracking-tight">
              Add Questions for <span className="text-yellow-500">{'Exam Name'}</span>
            </h1>

            <form className="space-y-8">
              {/* Question List Section */}
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("questionList")}
                  className="w-full p-4 md:p-6 text-left font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white flex justify-between items-center hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  <span className="text-lg md:text-xl">Question List</span>
                  <span className="text-2xl">{expandedSections.questionList ? "▲" : "▼"}</span>
                </button>
                {expandedSections.questionList && (
                  <div className="p-4 md:p-6">
                    {questions?.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-green-50 text-green-800">
                              <th className="p-3 text-left font-semibold">Title</th>
                              <th className="p-3 text-left font-semibold">Type</th>
                              <th className="p-3 text-left font-semibold">Marks</th>
                              <th className="p-3 text-left font-semibold">Level</th>
                              <th className="p-3 text-left font-semibold">Time (min)</th>
                              <th className="p-3 text-left font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {questions.map((q, index) => (
                              <tr key={index} className="hover:bg-yellow-50 transition-colors duration-200">
                                <td className="p-3 border-b border-gray-200">{q.title}</td>
                                <td className="p-3 border-b border-gray-200">{q.type}</td>
                                <td className="p-3 border-b border-gray-200">{q.marks}</td>
                                <td className="p-3 border-b border-gray-200">{q.level}</td>
                                <td className="p-3 border-b border-gray-200">{q.time}</td>
                                <td className="p-3 border-b border-gray-200">
                                  <button
                                    onClick={(e) => handleRemoveQuestion(q._id, e)}
                                    className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No questions added yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Add Question Section */}
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("addQuestion")}
                  className="w-full p-4 md:p-6 text-left font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex justify-between items-center hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                >
                  <span className="text-lg md:text-xl">Add New Question</span>
                  <span className="text-2xl">{expandedSections.addQuestion ? "▲" : "▼"}</span>
                </button>
                {expandedSections.addQuestion && (
                  <div className="p-4 md:p-6 space-y-6">
                    <div>
                      <label className="block mb-2 font-medium text-green-700">Question Type</label>
                      <select
                        name="type"
                        value={newQuestion.type}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay</option>
                        <option value="OA">Coding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-green-700">Question Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newQuestion.title}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-green-700">Description</label>
                      <textarea
                        value={questionDescription}
                        onChange={handleDescriptionChange}
                        className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] transition-all duration-200"
                        placeholder="Enter question description"
                      />
                      {aiSuggestions && (
                        <div className="mt-4 bg-green-50 p-4 rounded-lg border-l-4 border-green-500 shadow-md">
                          <p className="italic text-green-800 whitespace-pre-line">{aiSuggestions}</p>
                          <div className="mt-3 flex gap-3">
                            <button
                              type="button"
                              onClick={handleImplementAi}
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              Use
                            </button>
                            <button
                              type="button"
                              onClick={() => setAiSuggestions(null)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-2 font-medium text-green-700">Marks</label>
                        <input
                          type="number"
                          name="marks"
                          value={newQuestion.marks}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium text-green-700">Difficulty Level</label>
                        <select
                          name="level"
                          value={newQuestion.level}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 font-medium text-green-700">Time (minutes)</label>
                        <input
                          type="number"
                          name="time"
                          value={newQuestion.time}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {newQuestion.type === "MCQ" && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-green-700">Options</h3>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3 mb-3">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              required
                              className="flex-1 p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                            />
                            <input
                              type="radio"
                              name="correctOption"
                              checked={option.isCorrect}
                              onChange={() => setCorrectOption(index)}
                              className="h-5 w-5 text-green-600"
                            />
                            <span className="text-sm text-green-700">Correct</span>
                            {newQuestion.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => deleteOption(index)}
                                className="text-red-500 hover:text-red-600 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                        {newQuestion.options.length < 6 && (
                          <button
                            type="button"
                            onClick={addOption}
                            className="mt-2 text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>
                    )}

                    {newQuestion.type === "Coding" && (
                      <div>
                        <label className="block mb-2 font-medium text-green-700">Coding Language</label>
                        <select
                          name="codingLanguage"
                          value={newQuestion.codingLanguage}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md transition-all duration-300"
                      >
                        Add Question
                      </button>
                      <button
                        type="button"
                        onClick={resetQuestionForm}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 shadow-md transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;