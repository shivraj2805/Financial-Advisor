import React from 'react';
import { FaPlay, FaCalendarAlt, FaClock, FaUsers, FaStar } from 'react-icons/fa';
import SessionCard from './SessionCard';

const SessionsSection = ({
  title,
  icon: Icon,
  sessions,
  loading,
  isMeetingCreator,
  isRegisteredForSession,
  isRegistrationClosed,
  handleGoLive,
  handleViewAttendees,
  handleEditClick,
  handleDeleteMeeting,
  handleRegister,
  handleJoinMeeting,
  handleWatchYouTube,
  handleBookmark,
  handleShare,
  actionLoading,
  isLive = false,
  isPast = false,
  viewMode = 'grid',
  bookmarkedSessions = new Set()
}) => {
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Icon className="text-2xl text-gray-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {isLive && <div className="ml-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Icon className="text-2xl text-gray-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {isLive && <div className="ml-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Icon className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isLive ? 'No live sessions' : isPast ? 'No past sessions' : 'No upcoming sessions'}
          </h3>
          <p className="text-gray-500">
            {isLive 
              ? 'Check upcoming sessions below for future meetings'
              : isPast 
              ? 'Past sessions will appear here once completed'
              : 'Create a new session or check back later for upcoming meetings'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Icon className={`text-2xl mr-3 ${isLive ? 'text-red-600' : 'text-green-600'}`} />
          <h2 className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-green-600'}`}>
            {title}
          </h2>
          {isLive && <div className="ml-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
        </div>
        
        {/* Session Count */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <FaUsers className="mr-1" />
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </span>
          {sessions.some(s => s.attendees?.length > 0) && (
            <span className="flex items-center">
              <FaStar className="mr-1" />
              {sessions.reduce((total, s) => total + (s.attendees?.length || 0), 0)} total attendees
            </span>
          )}
        </div>
      </div>

      {/* Sessions Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <SessionCard
              key={session._id}
              session={session}
              isMeetingCreator={isMeetingCreator}
              isRegisteredForSession={isRegisteredForSession}
              isRegistrationClosed={isRegistrationClosed}
              handleGoLive={handleGoLive}
              handleViewAttendees={handleViewAttendees}
              handleEditClick={handleEditClick}
              handleDeleteMeeting={handleDeleteMeeting}
              handleRegister={handleRegister}
              handleJoinMeeting={handleJoinMeeting}
              handleWatchYouTube={handleWatchYouTube}
              handleBookmark={handleBookmark}
              handleShare={handleShare}
              actionLoading={actionLoading}
              isLive={isLive}
              isPast={isPast}
              isBookmarked={bookmarkedSessions.has(session._id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isLive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {isLive ? 'LIVE NOW' : session.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {session.date} at {session.time}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      {session.duration} minutes
                    </span>
                    <span className="flex items-center">
                      <FaUsers className="mr-1" />
                      {session.attendees?.length || 0} attendees
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SessionCard
                      session={session}
                      isMeetingCreator={isMeetingCreator}
                      isRegisteredForSession={isRegisteredForSession}
                      isRegistrationClosed={isRegistrationClosed}
                      handleGoLive={handleGoLive}
                      handleViewAttendees={handleViewAttendees}
                      handleEditClick={handleEditClick}
                      handleDeleteMeeting={handleDeleteMeeting}
                      handleRegister={handleRegister}
                      handleJoinMeeting={handleJoinMeeting}
                      handleWatchYouTube={handleWatchYouTube}
                      handleBookmark={handleBookmark}
                      handleShare={handleShare}
                      actionLoading={actionLoading}
                      isLive={isLive}
                      isPast={isPast}
                      isBookmarked={bookmarkedSessions.has(session._id)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsSection;