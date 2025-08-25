import React from 'react';
import { FaUserPlus } from 'react-icons/fa';

const CreateMeetingButton = ({ onClick }) => {
  return (
    <div className="flex justify-end mb-6">
      <button
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={onClick}
      >
        <FaUserPlus className="h-4 w-4 mr-2" />
        Create Meeting
      </button>
    </div>
  );
};

export default CreateMeetingButton;