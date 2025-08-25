import React from 'react';
import { FaMicrophone, FaUsers, FaCalendarAlt, FaStar, FaChartLine, FaPlay } from 'react-icons/fa';

const QnaHeader = ({ sessionStats }) => {
  const stats = sessionStats || {
    totalSessions: 0,
    liveSessions: 0,
    upcomingSessions: 0,
    pastSessions: 0,
    totalAttendees: 0,
    averageRating: 0
  };

  return (
    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <FaMicrophone className="text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Q&A Sessions
            </h1>
          </div>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Join live sessions with financial experts, ask questions, and learn from the community. 
            Discover upcoming webinars and access past recordings.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Sessions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-3">
              <FaCalendarAlt className="text-xl" />
            </div>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-sm text-green-100">Total Sessions</div>
          </div>

          {/* Live Sessions */}
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-500/30 rounded-full mx-auto mb-3">
              <FaPlay className="text-xl" />
            </div>
            <div className="text-2xl font-bold">{stats.liveSessions}</div>
            <div className="text-sm text-red-100">Live Now</div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/30 rounded-full mx-auto mb-3">
              <FaCalendarAlt className="text-xl" />
            </div>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <div className="text-sm text-green-100">Upcoming</div>
          </div>

          {/* Past Sessions */}
          <div className="bg-gray-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-500/30 rounded-full mx-auto mb-3">
              <FaChartLine className="text-xl" />
            </div>
            <div className="text-2xl font-bold">{stats.pastSessions}</div>
            <div className="text-sm text-gray-100">Completed</div>
          </div>

          {/* Total Attendees */}
          <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/30 rounded-full mx-auto mb-3">
              <FaUsers className="text-xl" />
            </div>
            <div className="text-2xl font-bold">{stats.totalAttendees}</div>
            <div className="text-sm text-emerald-100">Attendees</div>
          </div>

          {/* Average Rating */}
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/30 rounded-full mx-auto mb-3">
              <FaStar className="text-xl" />
            </div>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-yellow-100">Avg Rating</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="flex items-center text-sm text-green-100">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live sessions are happening now
          </div>
          <div className="flex items-center text-sm text-green-100">
            <FaUsers className="mr-2" />
            Join thousands of learners
          </div>
          <div className="flex items-center text-sm text-green-100">
            <FaStar className="mr-2" />
            Expert-led discussions
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnaHeader;