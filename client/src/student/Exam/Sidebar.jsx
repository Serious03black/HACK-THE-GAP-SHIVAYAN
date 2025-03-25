import React from 'react';

const Sidebar = ({ examDetails, currentQuestion, setCurrentQuestion, answers }) => {
  const getQuestionTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'mcq': return 'bg-blue-700';
      case 'essay': return 'bg-yellow-700';
      case 'coding': return 'bg-purple-700';
      case 'assignment': return 'bg-orange-700';
      default: return 'bg-gray-700';
    }
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer && answer.isAnswered && answer.answerText !== '';
  };

  const groupQuestionsByType = () => {
    const groups = { mcq: [], essay: [], coding: [], assignment: [] };
    examDetails.questions.forEach((q, index) => {
      const type = q.questionType.toLowerCase();
      if (type === 'mcq') groups.mcq.push({ ...q, index });
      else if (type === 'essay') groups.essay.push({ ...q, index });
      else if (type === 'coding') groups.coding.push({ ...q, index });
      else if (type === 'assignment') groups.assignment.push({ ...q, index });
    });
    return groups;
  };

  const questionGroups = groupQuestionsByType();

  return (
    <div className="w-64 bg-gray-700 text-white flex flex-col py-4 fixed top-0 bottom-0 overflow-y-auto">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold">Questions</h2>
      </div>
      {Object.entries(questionGroups).map(([type, questions]) => (
        questions.length > 0 && (
          <div key={type} className="mb-4">
            <h3 className={`px-4 text-sm font-semibold text-${type === 'mcq' ? 'blue' : type === 'essay' ? 'yellow' : type === 'coding' ? 'purple' : 'orange'}-300`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </h3>
            <div className="flex flex-wrap px-4 gap-2">
              {questions.map((q) => (
                <div
                  key={q.index}
                  className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-500 ${
                    currentQuestion === q.index
                      ? 'bg-gray-600 text-white'
                      : isQuestionAnswered(q._id)
                      ? 'bg-green-600 text-white'
                      : getQuestionTypeColor(q.questionType) + ' text-white'
                  }`}
                  onClick={() => setCurrentQuestion(q.index)}
                >
                  {q.index + 1}
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default Sidebar;