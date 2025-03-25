import React, { useState, useEffect, useRef } from "react";
import * as echarts from "echarts";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"; // For autocomplete

const CodingEditor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState([
    { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
  ]);
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTestInput, setNewTestInput] = useState("");
  const [newTestOutput, setNewTestOutput] = useState("");
  const [theme, setTheme] = useState("light");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const performanceChartRef = useRef(null);

  const codeTemplates = {
    python: `def twoSum(nums: List[int], target: int) -> List[int]:
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
    javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
  };

  const languages = [
    { id: "python", name: "Python", mode: "python" },
    { id: "javascript", name: "JavaScript", mode: "javascript" },
    { id: "java", name: "Java", mode: "java" },
    { id: "cpp", name: "C++", mode: "c_cpp" },
  ];

  const question = {
    title: "Two Sum",
    difficulty: "Medium",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCode(codeTemplates[selectedLanguage]);
  }, [selectedLanguage]);

  useEffect(() => {
    if (performanceChartRef.current) {
      const chart = echarts.init(performanceChartRef.current);
      chart.setOption({
        animation: false,
        radar: {
          indicator: [
            { name: "Time Complexity", max: 100 },
            { name: "Space Complexity", max: 100 },
            { name: "Code Quality", max: 100 },
            { name: "Test Cases", max: 100 },
          ],
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: [85, 90, 95, 100],
                name: "Performance",
                areaStyle: { color: "rgba(52, 152, 219, 0.2)" },
                lineStyle: { color: "rgb(52, 152, 219)" },
              },
            ],
          },
        ],
      });
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleRunCode = () => {
    // Simulate running code against test cases
    const results = testCases.map((tc, index) => index % 2 === 0); // Dummy logic
    setTestCaseResults(results);
    setConsoleOutput(
      results.includes(false)
        ? "Some test cases failed. Check details below."
        : "All test cases passed!"
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          code,
          testCases,
        }),
      });
      const result = await response.json();
      setConsoleOutput(
        response.ok ? "Submission accepted!" : `Error: ${result.message}`
      );
    } catch (error) {
      setConsoleOutput("Submission failed: Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: newTestInput, expectedOutput: newTestOutput }]);
    setNewTestInput("");
    setNewTestOutput("");
    setShowAddTest(false);
    showToast("Test case added successfully!");
  };

  const formatCode = () => {
    // Simple formatting (could integrate Prettier in a real app)
    const formatted = code
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    setCode(formatted);
    showToast("Code formatted!");
  };

  const resetCode = () => {
    setCode(codeTemplates[selectedLanguage]);
    showToast("Code reset to default!");
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Autocomplete suggestions (basic example)
  const completions = {
    python: [
      { name: "def", value: "def ", score: 100 },
      { name: "for", value: "for ", score: 90 },
      { name: "if", value: "if ", score: 80 },
      { name: "return", value: "return ", score: 70 },
    ],
    javascript: [
      { name: "function", value: "function ", score: 100 },
      { name: "const", value: "const ", score: 90 },
      { name: "if", value: "if ", score: 80 },
      { name: "return", value: "return ", score: 70 },
    ],
    java: [
      { name: "public", value: "public ", score: 100 },
      { name: "int", value: "int ", score: 90 },
      { name: "if", value: "if ", score: 80 },
      { name: "return", value: "return ", score: 70 },
    ],
    cpp: [
      { name: "vector", value: "vector", score: 100 },
      { name: "int", value: "int ", score: 90 },
      { name: "if", value: "if ", score: 80 },
      { name: "return", value: "return ", score: 70 },
    ],
  };

  return (
    <div className={`min-h-screen bg-gray-100 font-sans ${isFullScreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-gray-900">CodeAssess</h1>
            <span className="text-sm text-gray-500">{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <span>{languages.find((l) => l.id === selectedLanguage)?.name}</span>
                <i className="fas fa-caret-down"></i>
              </button>
              {showLanguageDropdown && (
                <div className="absolute top-full mt-1 w-40 bg-white rounded shadow-lg border border-gray-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        setShowLanguageDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex space-x-6">
        {/* Question Section */}
        {!isFullScreen && (
          <div className="w-1/3 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{question.title}</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {question.difficulty}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{question.description}</p>
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Example:</h3>
              {question.examples.map((example, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded mb-2">
                  <pre className="text-sm text-gray-800">Input: {example.input}</pre>
                  <pre className="text-sm text-gray-800">Output: {example.output}</pre>
                  <p className="text-sm text-gray-600 mt-1">{example.explanation}</p>
                </div>
              ))}
            </div>
            <div ref={performanceChartRef} className="w-full h-64"></div>
          </div>
        )}

        {/* Code Editor and Test Cases */}
        <div className={`${isFullScreen ? "w-full h-full" : "w-2/3"} space-y-6`}>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <div className="space-x-2">
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <i className={`fas fa-${theme === "light" ? "moon" : "sun"}`}></i>
                </button>
                <button
                  onClick={formatCode}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <i className="fas fa-align-left"></i> Format
                </button>
                <button
                  onClick={resetCode}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <i className="fas fa-undo"></i> Reset
                </button>
                <button
                  onClick={toggleFullScreen}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <i className={`fas fa-${isFullScreen ? "compress" : "expand"}`}></i>
                </button>
              </div>
              <div className="space-x-3">
                <button
                  onClick={handleRunCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Run Code
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 ${
                    isSubmitting ? "bg-gray-400" : "bg-green-600"
                  } text-white rounded hover:bg-green-700`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
            <AceEditor
              mode={languages.find((l) => l.id === selectedLanguage)?.mode}
              theme={theme === "light" ? "github" : "monokai"}
              value={code || codeTemplates[selectedLanguage]}
              onChange={setCode}
              name="code-editor"
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 4,
              }}
              width="100%"
              height={isFullScreen ? "80vh" : "400px"}
              completions={completions[selectedLanguage]}
            />
          </div>

          {/* Test Cases */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Cases</h3>
              <button
                onClick={() => setShowAddTest(!showAddTest)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <i className="fas fa-plus mr-2"></i>Add
              </button>
            </div>

            {showAddTest && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Input</label>
                  <input
                    type="text"
                    value={newTestInput}
                    onChange={(e) => setNewTestInput(e.target.value)}
                    placeholder="e.g., nums = [2,7,11,15], target = 9"
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Expected Output</label>
                  <input
                    type="text"
                    value={newTestOutput}
                    onChange={(e) => setNewTestOutput(e.target.value)}
                    placeholder="e.g., [0,1]"
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={addTestCase}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddTest(false)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <div>
                      <pre className="text-sm text-gray-800">Input: {testCase.input}</pre>
                      <pre className="text-sm text-gray-800">
                        Expected: {testCase.expectedOutput}
                      </pre>
                    </div>
                    <button
                      onClick={() => setTestCases(testCases.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  {testCaseResults[index] !== undefined && (
                    <div
                      className={`mt-2 text-sm ${
                        testCaseResults[index] ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {testCaseResults[index]
                        ? "✓ Passed"
                        : `✗ Failed (Expected: ${testCase.expectedOutput}, Got: [1,0])`
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>

            {consoleOutput && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Output</h3>
                <pre
                  className={`p-3 rounded text-sm ${
                    consoleOutput.includes("failed")
                      ? "bg-red-50 text-red-800"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  {consoleOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingEditor;