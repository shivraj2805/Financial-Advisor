import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const NotificationToast = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  const Icon = type === 'error' ? FaExclamationCircle : FaCheckCircle;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center gap-3 max-w-md`}>
      <Icon className="text-xl" />
      <span className="font-semibold">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-auto text-white hover:text-gray-200 transition-colors"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default NotificationToast;
