import React from 'react';

const Header = ({ title }) => (
  <div className="bg-gray-700 text-white p-4 flex items-center justify-between border-b border-gray-500">
    <span className="text-lg font-semibold">{title}</span>
    <div className="flex space-x-2">
      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
    </div>
  </div>
);

export default Header;