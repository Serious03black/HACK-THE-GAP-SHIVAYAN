import React, { useState, useEffect } from 'react';

const Notification = () => {
  const [notification, setNotification] = useState(null);

  // Simulate fetching notification from the backend
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        // Mock backend response
        const backendResponse = {
          message: 'New update available!',
          timestamp: new Date().toLocaleTimeString(),
        };
        setNotification(backendResponse);
      } catch (error) {
        console.error('Error fetching notification:', error);
      }
    };

    fetchNotification();
  }, []);

  // Handle closing the notification
  const handleClose = () => {
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
        <p className="text-sm flex-grow">{notification.message}</p>
        <span className="text-xs text-gray-400">{notification.timestamp}</span>
        <button
          className="text-white hover:text-red-500 text-xl leading-none"
          onClick={handleClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;