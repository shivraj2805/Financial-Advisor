import React from 'react';
import { FaPlay, FaUsers, FaChalkboardTeacher, FaClock, FaVideo, FaCheckCircle, FaTimes } from 'react-icons/fa';

const LiveSessionCard = ({
  liveSession,
  isRegisteredForSession,
  handleJoinMeeting,
  isValidUrl
}) => {
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'E';

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 relative overflow-hidden mb-8">
      <div className="absolute top-4 right-4 flex items-center">
        <span className="animate-ping absolute h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
        <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
        <span className="ml-2 text-sm font-medium">LIVE NOW</span>
      </div>

      <div className="absolute top-4 left-4">
        {isRegisteredForSession(liveSession._id) ? (
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaCheckCircle className="mr-1" /> Registered
          </span>
        ) : (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaTimes className="mr-1" /> Not Registered
          </span>
        )}
      </div>

      <div className="md:flex items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 text-white text-xl">
              <FaPlay />
            </span>
            <h2 className="text-xl font-bold">{liveSession.title}</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white bg-opacity-20 text-white text-sm font-medium">
              {getInitials(liveSession.expert)}
            </span>
            <span className="font-medium">{liveSession.expert}</span>
          </div>
          <div className="flex items-center space-x-3 mb-3 text-sm">
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full flex items-center">
              <FaUsers className="mr-1" /> {liveSession.registrations?.length || liveSession.attendees || 0} Attendees
            </span>
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full flex items-center">
              <FaChalkboardTeacher className="mr-1" /> {liveSession.language || 'English'}
            </span>
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full flex items-center">
              <FaClock className="mr-1" /> {liveSession.time} ({liveSession.date})
            </span>
          </div>
          <span className="inline-block bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium mr-2">
            <FaVideo className="inline mr-1" />{liveSession.type}
          </span>
          {liveSession.duration && (
            <span className="inline-block bg-blue-400 text-blue-900 px-2 py-1 rounded-full text-xs font-medium ml-2">
              Duration: {liveSession.duration}
            </span>
          )}

          {!isRegisteredForSession(liveSession._id) && (
            <div className="mt-3 p-2 bg-red-500 bg-opacity-20 rounded border border-red-400">
              <p className="text-xs font-medium">
                ⚠️ You are not registered for this live meeting.
              </p>
            </div>
          )}
        </div>

        <a
          href={isValidUrl(liveSession.joinUrl) ? liveSession.joinUrl : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            isRegisteredForSession(liveSession._id)
              ? 'bg-white text-green-700 hover:bg-gray-50'
              : 'bg-red-600 text-white hover:bg-red-700 cursor-not-allowed opacity-75'
          }`}
          onClick={(e) => {
            if (!isRegisteredForSession(liveSession._id)) {
              e.preventDefault();
              alert('Please register for the meeting to join.');
            }
          }}
        >
          <FaPlay className="mr-2" /> {isRegisteredForSession(liveSession._id) ? 'Join Now' : 'Call Admin'}
        </a>
      </div>
    </div>
  );
};

export default LiveSessionCard;