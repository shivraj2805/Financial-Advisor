import React from 'react';
import { FaUserTie } from 'react-icons/fa';

const HelpSection = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
        <FaUserTie className="text-green-600 text-xl" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
      <p className="text-gray-600 mb-2 font-medium">Call: 1800-XXX-XXXX (Toll Free)</p>
      <p className="text-gray-500 text-sm">9am to 6pm (Monday to Saturday)</p>
    </div>
  );
};

export default HelpSection;