import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's default stylesheet

const RichTextEditor = () => {
  const [content, setContent] = useState('');

  // Quill toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Header levels
      [{ 'font': [] }], // Font family dropdown
      [{ 'size': ['small', false, 'large', 'huge'] }], // Font size options
      ['bold', 'italic', 'underline', 'strike'], // Text formatting
      [{ 'align': [] }], // Alignment (left, center, right, justify)
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Lists
      ['blockquote', 'code-block'], // Blockquote and code
      [{ 'color': [] }, { 'background': [] }], // Text and background color
      ['link', 'image'], // Link and image insertion
      ['clean'], // Remove formatting
    ],
  };

  // Formats supported by the editor
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet',
    'blockquote', 'code-block',
    'color', 'background',
    'link', 'image',
  ];

  // Handle content change
  const handleChange = (value) => {
    setContent(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rich Text Editor</h2>
        
        {/* Editor Container */}
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <ReactQuill
            value={content}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder="Start typing here..."
            className="h-64"
          />
        </div>

        {/* Preview Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Preview</h3>
          <div
            className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-800"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setContent('')}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => alert('Content saved: ' + content)}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;