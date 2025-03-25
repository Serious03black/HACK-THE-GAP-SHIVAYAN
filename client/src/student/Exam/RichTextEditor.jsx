import React, { useRef, useEffect } from 'react';

const RichTextEditor = ({ content, onChange, placeholder, limited = false }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

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


  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const toolbarButtons = limited
    ? [
        { label: 'B', command: 'bold', title: 'Bold' },
        { label: 'I', command: 'italic', title: 'Italic' },
        { label: 'U', command: 'underline', title: 'Underline' },
      ]
    : [
        { label: 'B', command: 'bold', title: 'Bold' },
        { label: 'I', command: 'italic', title: 'Italic' },
        { label: 'U', command: 'underline', title: 'Underline' },
        { label: 'H1', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
        { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
        { label: 'UL', command: 'insertUnorderedList', title: 'Bullet List' },
        { label: 'OL', command: 'insertOrderedList', title: 'Numbered List' },
      ];

  return (
    <div className="w-full bg-white rounded-md shadow border border-gray-300">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-200">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.command + (btn.value || '')}
            type="button"
            onClick={() => execCommand(btn.command, btn.value)}
            title={btn.title}
            className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 text-gray-800 focus:outline-none"
        dangerouslySetInnerHTML={{ __html: content || '' }}
        placeholder={placeholder}
        onFocus={(e) => {
          if (!e.target.innerHTML) e.target.innerHTML = '';
        }}
        onBlur={(e) => {
          if (!e.target.innerHTML) e.target.innerHTML = '';
        }}
      />
    </div>
  );
};

export default RichTextEditor;