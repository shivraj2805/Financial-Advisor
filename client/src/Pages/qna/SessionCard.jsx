import React from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaPlay, 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheckCircle, 
  FaTimes,
  FaUserTie,
  FaGlobe,
  FaYoutube,
  FaCircle,
  FaBookmark,
  FaShare,
  FaUsers,
  FaStar,
  FaMicrophone,
  FaVideo,
  FaChartLine,
  FaTag,
  FaLanguage,
  FaGraduationCap
} from 'react-icons/fa';
import dayjs from 'dayjs';

const MEETING_TYPES = [
  { value: 'qna', label: 'Q&A', icon: '❓', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'webinar', label: 'Webinar', icon: '📹', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' },
  { value: 'other', label: 'Other', icon: '👨‍🏫', color: 'teal', bgColor: 'bg-teal-100', textColor: 'text-teal-800' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
];

const SessionCard = ({
  session,
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
  isBookmarked = false
}) => {
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'E';

  const getMeetingTypeIcon = (type) => {
    const meetingType = MEETING_TYPES.find(t => t.value === type);
    return meetingType ? meetingType.icon : '📋';
  };

  const getMeetingTypeStyle = (type) => {
    const meetingType = MEETING_TYPES.find(t => t.value === type);
    return meetingType ? { bgColor: meetingType.bgColor, textColor: meetingType.textColor } : { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  };

  const getDifficultyStyle = (difficulty) => {
    const level = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
    return level ? { bgColor: level.bgColor, textColor: level.textColor } : { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  };

  // Get session status based on time
  const getSessionStatus = () => {
    const now = dayjs();
    const sessionStart = dayjs(`${session.date}T${session.time}`);
    const sessionEnd = sessionStart.add(session.duration ? parseInt(session.duration) : 60, 'minute');
    
    const isBetween = (date, start, end) => {
      return date.isAfter(start) && date.isBefore(end);
    };
    
    if (isBetween(now, sessionStart, sessionEnd)) {
      return { 
        status: 'LIVE NOW', 
        color: 'red', 
        bgColor: 'bg-red-100', 
        textColor: 'text-red-800',
        icon: FaCircle,
        animate: 'animate-pulse'
      };
    } else if (now.isBefore(sessionStart)) {
      return { 
        status: 'UPCOMING', 
        color: 'green', 
        bgColor: 'bg-green-100', 
        textColor: 'text-green-800',
        icon: FaClock,
        animate: ''
      };
    } else {
      return { 
        status: 'CLOSED', 
        color: 'gray', 
        bgColor: 'bg-gray-100', 
        textColor: 'text-gray-800',
        icon: FaCheckCircle,
        animate: ''
      };
    }
  };

  const sessionStatus = getSessionStatus();
  const meetingTypeStyle = getMeetingTypeStyle(session.type);
  const difficultyStyle = getDifficultyStyle(session.difficulty);

  const formatDuration = (duration) => {
    const minutes = parseInt(duration);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatDateTime = (date, time) => {
    const sessionDate = dayjs(`${date}T${time}`);
    const now = dayjs();
    
    if (sessionDate.isSame(now, 'day')) {
      return `Today at ${sessionDate.format('h:mm A')}`;
    } else if (sessionDate.isSame(now.add(1, 'day'), 'day')) {
      return `Tomorrow at ${sessionDate.format('h:mm A')}`;
    } else {
      return sessionDate.format('MMM DD, YYYY at h:mm A');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Status Bar */}
      <div className={`h-1 ${sessionStatus.bgColor}`}></div>
      
      <div className="p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-wrap">
            {/* Meeting Type Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${meetingTypeStyle.bgColor} ${meetingTypeStyle.textColor}`}>
              <span className="mr-1">{getMeetingTypeIcon(session.type)}</span>
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </span>
            
            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sessionStatus.bgColor} ${sessionStatus.textColor} ${sessionStatus.animate}`}>
              <sessionStatus.icon className="mr-1 text-xs" />
              {sessionStatus.status}
            </span>

            {/* Difficulty Badge */}
            {session.difficulty && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${difficultyStyle.bgColor} ${difficultyStyle.textColor}`}>
                <FaGraduationCap className="mr-1 text-xs" />
                {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Bookmark Button */}
            <button
              onClick={() => handleBookmark(session._id)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <FaBookmark className={`text-sm ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              onClick={() => handleShare(session)}
              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="Share session"
            >
              <FaShare className="text-sm" />
            </button>
          </div>
        </div>
        
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {session.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {session.description}
          </p>
        </div>

        {/* Expert Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {getInitials(session.expert)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{session.expert}</p>
            <p className="text-sm text-gray-500">Expert</p>
          </div>
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span>{formatDateTime(session.date, session.time)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaClock className="mr-2 text-gray-400" />
            <span>{formatDuration(session.duration)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaLanguage className="mr-2 text-gray-400" />
            <span>{session.language}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="mr-2 text-gray-400" />
            <span>{session.attendees?.length || 0} attendees</span>
          </div>
        </div>

        {/* Topics/Tags */}
        {session.topics && session.topics.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaTag className="mr-2 text-gray-400 text-sm" />
              <span className="text-sm font-medium text-gray-700">Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {session.topics.slice(0, 3).map((topic, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {topic}
                </span>
              ))}
              {session.topics.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{session.topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Primary Action Button */}
          {sessionStatus.status === 'LIVE NOW' && (
            <button
              onClick={() => handleJoinMeeting(session)}
              disabled={!isRegisteredForSession(session._id)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isRegisteredForSession(session._id)
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaPlay className="mr-2" />
              {isRegisteredForSession(session._id) ? 'Join Now' : 'Register First'}
            </button>
          )}

          {sessionStatus.status === 'UPCOMING' && (
            <button
              onClick={() => handleRegister(session)}
              disabled={isRegistrationClosed(session) || isRegisteredForSession(session._id)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isRegisteredForSession(session._id)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : isRegistrationClosed(session)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <FaUserPlus className="mr-2" />
              {isRegisteredForSession(session._id) ? 'Registered' : 'Register'}
            </button>
          )}

          {sessionStatus.status === 'CLOSED' && session.youtubeUrl && (
            <button
              onClick={() => handleWatchYouTube(session)}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <FaYoutube className="mr-2" />
              Watch Recording
            </button>
          )}

          {/* Secondary Action Buttons */}
          {isMeetingCreator(session) && (
            <>
              <button
                onClick={() => handleViewAttendees(session._id)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="View attendees"
              >
                <FaEye className="text-sm" />
              </button>
              
              {sessionStatus.status === 'UPCOMING' && (
                <button
                  onClick={() => handleGoLive(session._id)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Go live"
                >
                  <FaMicrophone className="text-sm" />
                </button>
              )}
              
              <button
                onClick={() => handleEditClick(session)}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                title="Edit session"
              >
                <FaEdit className="text-sm" />
              </button>
              
              <button
                onClick={() => handleDeleteMeeting(session._id)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                title="Delete session"
              >
                <FaTrash className="text-sm" />
              </button>
            </>
          )}
        </div>

        {/* Registration Status */}
        {isRegisteredForSession(session._id) && (
          <div className="mt-3 flex items-center text-green-600 text-sm">
            <FaCheckCircle className="mr-2" />
            You are registered for this session
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionCard;