import React from 'react';

const RulesAndControls = ({
  rules,
  handleFullScreen,
  handleCheckCompatibility,
  handleVerifyFace,
  handleStartTest,
  inputValue,
  handleInputChange,
  cameraStatus,
  micStatus,
  isCompatible,
  faceMatchStatus,
  studentData,
  error,
}) => (
  <div className="w-1/2 bg-white border border-gray-300 rounded shadow-sm p-6 flex flex-col">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Rules & Regulations</h3>
    <div className="bg-gray-50 p-3 border border-gray-200 mb-6 flex-1 overflow-y-auto">
      <ul className="space-y-2 text-gray-700">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 mt-1"></span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="space-y-4">
      <button
        onClick={handleFullScreen}
        className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
      >
        Enter Full Screen
      </button>
      <button
        onClick={handleCheckCompatibility}
        className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition-colors"
      >
        Verify Compatibility
      </button>
      <button
        onClick={handleVerifyFace}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        disabled={cameraStatus !== 'working' || !studentData}
      >
        Verify Face Match
      </button>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type 'start' to begin"
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700"
        />
        <button
          onClick={handleStartTest}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={cameraStatus !== 'working' || micStatus !== 'working' || !isCompatible || faceMatchStatus !== 'verified'}
        >
          Start Test
        </button>
      </div>
      {error && (
        <div className="text-red-700 text-sm bg-red-100 p-2 rounded border border-red-300">
          {error}
        </div>
      )}
    </div>
  </div>
);

export default RulesAndControls;