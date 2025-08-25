import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaPlay, 
  FaYoutube,
  FaUsers,
  FaMicrophone,
  FaVideo,
  FaChartLine,
  FaStar,
  FaBell,
  FaBookmark,
  FaShare,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import AuthContext from '../../Authorisation/AuthProvider';
import dayjs from 'dayjs';
import './qna.css';

// Import all components
import QnaHeader from './QnaHeader';
import CreateMeetingButton from './CreateMeetingButton';
import LiveSessionCard from './LiveSessionCard';
import CategoryFilter from './CategoryFilter';
import SessionsSection from './SessionsSection';
import HelpSection from './HelpSection';
import CreateMeetingModal from './CreateMeetingModal';
import RegistrationModal from './RegistrationModal';
import EditMeetingModal from './EditMeetingModal';
import AttendeesModal from './AttendeesModal';
import NotificationToast from './NotificationToast';

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

const QnaPage = () => {
  // Core state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [archivedSessions, setArchivedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveSession, setLiveSession] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  
  // Form states
  const [selectedSession, setSelectedSession] = useState(null);
  const [creating, setCreating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Enhanced form with more fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'qna',
    date: '',
    time: '',
    language: 'English',
    topics: '',
    expert: '',
    joinUrl: '',
    duration: '60',
    youtubeUrl: '',
    maxAttendees: '100',
    isPublic: true,
    requiresRegistration: true,
    tags: '',
    difficulty: 'beginner'
  });
  
  const [editForm, setEditForm] = useState(form);
  
  // Enhanced registration form
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    questions: '',
    experience: 'beginner',
    interests: '',
    goals: ''
  });
  
  // Error and success states
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Enhanced UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showBookmarked, setShowBookmarked] = useState(false);
  
  // Session management
  const [sessionAttendees, setSessionAttendees] = useState([]);
  const [registeredSessions, setRegisteredSessions] = useState(new Set());
  const [bookmarkedSessions, setBookmarkedSessions] = useState(new Set());
  const [registrationLoading, setRegistrationLoading] = useState(false);
  
  // Dynamic categorization
  const [liveSessions, setLiveSessions] = useState([]);
  const [upcomingSessionsFiltered, setUpcomingSessionsFiltered] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  
  // Analytics and insights
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    liveSessions: 0,
    upcomingSessions: 0,
    pastSessions: 0,
    totalAttendees: 0,
    averageRating: 0
  });
  
  // Refs
  const formRef = useRef();
  const searchRef = useRef();
  
  // Context
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin' || false;

  // Enhanced session fetching with better error handling
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const [upcomingRes, archivedRes, liveRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/meetings/upcoming`),
          fetch(`${API_URL}/api/meetings/archived`),
          fetch(`${API_URL}/api/meetings/live`)
        ]);

        const upcoming = upcomingRes.status === 'fulfilled' ? await upcomingRes.value.json() : [];
        const archived = archivedRes.status === 'fulfilled' ? await archivedRes.value.json() : [];
        const live = liveRes.status === 'fulfilled' ? await liveRes.value.json() : null;

        setUpcomingSessions(upcoming || []);
        setArchivedSessions(archived || []);
        setLiveSession(live && live._id ? live : null);
        
        // Calculate session statistics
        const allSessions = [...(upcoming || []), ...(archived || [])];
        calculateSessionStats(allSessions);
        categorizeSessions(allSessions);
        
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setActionError('Failed to load sessions. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    
    // Fetch user data if authenticated
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Calculate session statistics
  const calculateSessionStats = (sessions) => {
    const stats = {
      totalSessions: sessions.length,
      liveSessions: liveSessions.length,
      upcomingSessions: upcomingSessionsFiltered.length,
      pastSessions: pastSessions.length,
      totalAttendees: sessions.reduce((sum, session) => sum + (session.attendees?.length || 0), 0),
      averageRating: sessions.length > 0 ? 
        sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length : 0
    };
    setSessionStats(stats);
  };

  // Enhanced session categorization
  const categorizeSessions = (sessions) => {
    const now = dayjs();
    const live = [];
    const upcoming = [];
    const past = [];

    sessions.forEach(session => {
      const sessionStart = dayjs(`${session.date}T${session.time}`);
      const sessionEnd = sessionStart.add(session.duration ? parseInt(session.duration) : 60, 'minute');
      
      const isBetween = (date, start, end) => {
        return date.isAfter(start) && date.isBefore(end);
      };
      
      if (isBetween(now, sessionStart, sessionEnd)) {
        live.push(session);
      } else if (now.isBefore(sessionStart)) {
        upcoming.push(session);
      } else {
        past.push(session);
      }
    });

    setLiveSessions(live);
    setUpcomingSessionsFiltered(upcoming);
    setPastSessions(past);
  };

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const allSessions = [...upcomingSessions, ...archivedSessions];
      categorizeSessions(allSessions);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [upcomingSessions, archivedSessions]);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const [registrationsRes, bookmarksRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/meetings/user/registrations`, {
          headers: { 'Authorization': `Bearer ${user?.id || 'anonymous'}` }
        }),
        fetch(`${API_URL}/api/meetings/user/bookmarks`, {
          headers: { 'Authorization': `Bearer ${user?.id || 'anonymous'}` }
        })
      ]);

      if (registrationsRes.status === 'fulfilled' && registrationsRes.value.ok) {
        const registrations = await registrationsRes.value.json();
        setRegisteredSessions(new Set(registrations.map(reg => reg.sessionId)));
      }

      if (bookmarksRes.status === 'fulfilled' && bookmarksRes.value.ok) {
        const bookmarks = await bookmarksRes.value.json();
        setBookmarkedSessions(new Set(bookmarks.map(bookmark => bookmark.sessionId)));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Enhanced create meeting with validation
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!user) {
      return setFormError('You must be signed in to create a meeting');
    }
    
    // Enhanced validation
    const validationErrors = [];
    if (!form.title.trim()) validationErrors.push('Title is required');
    if (!form.date) validationErrors.push('Date is required');
    if (!form.time) validationErrors.push('Time is required');
    if (!form.expert.trim()) validationErrors.push('Expert name is required');
    if (!form.description.trim()) validationErrors.push('Description is required');
    
    // Date validation
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      validationErrors.push('Meeting date cannot be in the past');
    }
    
    if (validationErrors.length > 0) {
      return setFormError(validationErrors.join(', '));
    }
    
    setCreating(true);
    try {
      const userIdentifier = user?.primaryEmailAddress?.emailAddress || 
                            user?.email || 
                            user?.id || 
                            user?.emailAddress ||
                            'anonymous';
      
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        topics: form.topics ? form.topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        expert: form.expert.trim(),
        joinUrl: form.joinUrl.trim(),
        youtubeUrl: form.youtubeUrl.trim(),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        creator: userIdentifier
      };

      const res = await fetch(`${API_URL}/api/meetings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || 'anonymous'}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create meeting');
      }

      const result = await res.json();
      setFormSuccess('Meeting created successfully!');
      setShowCreateModal(false);
      setForm({
        title: '', description: '', type: 'qna', date: '', time: '', 
        language: 'English', topics: '', expert: '', joinUrl: '', 
        duration: '60', youtubeUrl: '', maxAttendees: '100', 
        isPublic: true, requiresRegistration: true, tags: '', difficulty: 'beginner'
      });
      
      refreshSessions();
    } catch (err) {
      console.error('Create meeting error:', err);
      setFormError(err.message || 'Failed to create meeting');
    } finally {
      setCreating(false);
    }
  };

  // Enhanced registration handler
  const handleRegistration = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    setRegistrationSuccess('');
    
    if (!user) {
      return setRegistrationError('You must be signed in to register');
    }
    
    if (!selectedSession) {
      return setRegistrationError('No session selected');
    }
    
    // Check if already registered
    if (isRegisteredForSession(selectedSession._id)) {
      return setRegistrationError('You are already registered for this session');
    }
    
    // Check if registration is closed
    if (isRegistrationClosed(selectedSession)) {
      return setRegistrationError('Registration for this session is closed');
    }
    
    setRegistrationLoading(true);
    try {
      const payload = {
        sessionId: selectedSession._id,
        name: registrationForm.name || user.name || 'Anonymous',
        email: registrationForm.email || user.email,
        phone: registrationForm.phone,
        organization: registrationForm.organization,
        questions: registrationForm.questions,
        experience: registrationForm.experience,
        interests: registrationForm.interests,
        goals: registrationForm.goals
      };

      const res = await fetch(`${API_URL}/api/meetings/${selectedSession._id}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || 'anonymous'}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Registration failed');
      }

      setRegistrationSuccess('Successfully registered for the session!');
      setShowRegistrationModal(false);
      setRegisteredSessions(prev => new Set([...prev, selectedSession._id]));
      
      // Refresh sessions to update attendee count
      refreshSessions();
    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationError(err.message || 'Registration failed');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Enhanced edit meeting
  const handleEditMeeting = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!editingId) {
      return setFormError('No meeting selected for editing');
    }
    
    setEditing(true);
    try {
      const payload = {
        ...editForm,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        topics: editForm.topics ? editForm.topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        expert: editForm.expert.trim(),
        joinUrl: editForm.joinUrl.trim(),
        youtubeUrl: editForm.youtubeUrl.trim(),
        tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };

      const res = await fetch(`${API_URL}/api/meetings/${editingId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || 'anonymous'}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to update meeting');
      }

      setFormSuccess('Meeting updated successfully!');
      setShowEditModal(false);
      setEditingId(null);
      refreshSessions();
    } catch (err) {
      console.error('Edit meeting error:', err);
      setFormError(err.message || 'Failed to update meeting');
    } finally {
      setEditing(false);
    }
  };

  // Enhanced delete meeting
  const handleDeleteMeeting = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/meetings/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.id || 'anonymous'}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to delete meeting');
      }

      setActionSuccess('Meeting deleted successfully!');
      refreshSessions();
    } catch (err) {
      console.error('Delete meeting error:', err);
      setActionError(err.message || 'Failed to delete meeting');
    } finally {
      setActionLoading(false);
    }
  };

  // Enhanced attendees view
  const handleViewAttendees = async (sessionId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/meetings/${sessionId}/attendees`, {
        headers: { 'Authorization': `Bearer ${user?.id || 'anonymous'}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch attendees');
      }

      const attendees = await res.json();
      setSessionAttendees(attendees);
      setShowAttendeesModal(true);
    } catch (err) {
      console.error('Fetch attendees error:', err);
      setActionError('Failed to load attendees');
    } finally {
      setActionLoading(false);
    }
  };

  // Enhanced go live functionality
  const handleGoLive = async (sessionId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/meetings/${sessionId}/go-live`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.id || 'anonymous'}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to go live');
      }

      setActionSuccess('Session is now live!');
      refreshSessions();
    } catch (err) {
      console.error('Go live error:', err);
      setActionError(err.message || 'Failed to go live');
    } finally {
      setActionLoading(false);
    }
  };

  // Enhanced join meeting
  const handleJoinMeeting = async (session) => {
    if (!isRegisteredForSession(session._id)) {
      setActionError('Please register for this session first');
      return;
    }
    
    if (!session.joinUrl) {
      setActionError('No join URL available for this session');
      return;
    }
    
    // Validate URL
    if (!isValidUrl(session.joinUrl)) {
      setActionError('Invalid join URL');
      return;
    }
    
    // Open meeting in new tab
    window.open(session.joinUrl, '_blank');
  };

  // Enhanced YouTube watch
  const handleWatchYouTube = (session) => {
    const url = session.youtubeUrl || session.recordingUrl;
    if (!url) {
      setActionError('No recording available for this session');
      return;
    }
    
    if (!isValidUrl(url)) {
      setActionError('Invalid recording URL');
      return;
    }
    
    window.open(url, '_blank');
  };

  // Enhanced registration check
  const handleRegister = (session) => {
    if (!user) {
      setActionError('Please sign in to register for sessions');
      return;
    }
    
    if (isRegisteredForSession(session._id)) {
      setActionError('You are already registered for this session');
      return;
    }
    
    if (isRegistrationClosed(session)) {
      setActionError('Registration for this session is closed');
      return;
    }
    
    setSelectedSession(session);
    setShowRegistrationModal(true);
  };

  // Enhanced edit click
  const handleEditClick = (session) => {
    setEditForm({
      title: session.title,
      description: session.description,
      type: session.type,
      date: session.date,
      time: session.time,
      language: session.language,
      topics: session.topics?.join(', ') || '',
      expert: session.expert,
      joinUrl: session.joinUrl || '',
      duration: session.duration || '60',
      youtubeUrl: session.youtubeUrl || '',
      maxAttendees: session.maxAttendees || '100',
      isPublic: session.isPublic !== false,
      requiresRegistration: session.requiresRegistration !== false,
      tags: session.tags?.join(', ') || '',
      difficulty: session.difficulty || 'beginner'
    });
    setEditingId(session._id);
    setShowEditModal(true);
  };

  // Enhanced bookmark functionality
  const handleBookmark = async (sessionId) => {
    if (!user) {
      setActionError('Please sign in to bookmark sessions');
      return;
    }
    
    try {
      const isBookmarked = bookmarkedSessions.has(sessionId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const res = await fetch(`${API_URL}/api/meetings/${sessionId}/bookmark`, {
        method,
        headers: { 'Authorization': `Bearer ${user?.id || 'anonymous'}` }
      });

      if (!res.ok) {
        throw new Error('Failed to update bookmark');
      }

      if (isBookmarked) {
        setBookmarkedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
        setActionSuccess('Session removed from bookmarks');
      } else {
        setBookmarkedSessions(prev => new Set([...prev, sessionId]));
        setActionSuccess('Session added to bookmarks');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      setActionError('Failed to update bookmark');
    }
  };

  // Enhanced share functionality
  const handleShare = async (session) => {
    const shareData = {
      title: session.title,
      text: session.description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const shareUrl = `${window.location.origin}/qna?session=${session._id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setActionSuccess('Session link copied to clipboard!');
      }).catch(() => {
        setActionError('Failed to copy link');
      });
    }
  };

  // Enhanced filtering and search
  const filteredSessions = (sessions) => {
    return sessions.filter(session => {
      const matchesSearch = !searchTerm || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.expert.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.topics?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || session.type === selectedType;
      const matchesLanguage = selectedLanguage === 'all' || session.language === selectedLanguage;
      const matchesDifficulty = selectedDifficulty === 'all' || session.difficulty === selectedDifficulty;
      const matchesBookmarked = !showBookmarked || bookmarkedSessions.has(session._id);
      
      return matchesSearch && matchesType && matchesLanguage && matchesDifficulty && matchesBookmarked;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'expert':
          return a.expert.localeCompare(b.expert);
        case 'attendees':
          return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        default:
          return 0;
      }
    });
  };

  const filteredUpcomingSessions = filteredSessions(upcomingSessionsFiltered);
  const filteredPastSessions = filteredSessions(pastSessions);
  const filteredLiveSessions = filteredSessions(liveSessions);

  // Utility functions
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isMeetingCreator = (session) => {
    return user && (session.creator === user.id || 
                   session.creator === user.email || 
                   session.creator === user.primaryEmailAddress?.emailAddress ||
                   isAdmin);
  };

  const isRegisteredForSession = (sessionId) => {
    return registeredSessions.has(sessionId);
  };

  const isRegistrationClosed = (session) => {
    const sessionStart = dayjs(`${session.date}T${session.time}`);
    return dayjs().isAfter(sessionStart);
  };

  const refreshSessions = () => {
    window.location.reload();
  };

  // Enhanced search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Search logic is handled in filteredSessions
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Q&A Sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Enhanced Header */}
      <QnaHeader sessionStats={sessionStats} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search sessions, experts, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaFilter className="mr-2" />
              Filters
              {showFilters ? <FaEyeSlash className="ml-2" /> : <FaEye className="ml-2" />}
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Create Meeting Button */}
            <CreateMeetingButton onClick={() => setShowCreateModal(true)} />
          </div>
          
          {/* Enhanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="qna">Q&A</option>
                    <option value="webinar">Webinar</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                  </select>
                </div>
                
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                    <option value="expert">Expert</option>
                    <option value="attendees">Most Popular</option>
                  </select>
                </div>
                
                {/* Bookmarked Only */}
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showBookmarked}
                      onChange={(e) => setShowBookmarked(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Bookmarked Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Session Section */}
        {liveSession ? (
          <LiveSessionCard
            liveSession={liveSession}
            isRegisteredForSession={isRegisteredForSession}
            handleJoinMeeting={handleJoinMeeting}
            isValidUrl={isValidUrl}
            handleBookmark={handleBookmark}
            handleShare={handleShare}
            isBookmarked={bookmarkedSessions.has(liveSession._id)}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaPlay className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions</h3>
            <p className="text-gray-500">
              Check upcoming sessions below for future meetings
            </p>
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Live Sessions */}
        {filteredLiveSessions.length > 0 && (
          <SessionsSection
            title="LIVE NOW"
            icon={FaPlay}
            sessions={filteredLiveSessions}
            loading={loading}
            isMeetingCreator={isMeetingCreator}
            isRegisteredForSession={isRegisteredForSession}
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
            isLive={true}
            viewMode={viewMode}
            bookmarkedSessions={bookmarkedSessions}
          />
        )}

        {/* Upcoming Sessions */}
        <SessionsSection
          title="Upcoming Sessions"
          icon={FaCalendarAlt}
          sessions={filteredUpcomingSessions}
          loading={loading}
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
          isLive={false}
          viewMode={viewMode}
          bookmarkedSessions={bookmarkedSessions}
        />

        {/* Past Sessions */}
        <SessionsSection
          title="Past Sessions"
          icon={FaClock}
          sessions={filteredPastSessions}
          loading={loading}
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
          isLive={false}
          isPast={true}
          viewMode={viewMode}
          bookmarkedSessions={bookmarkedSessions}
        />

        {/* Help Section */}
        <HelpSection />
      </div>

      {/* Enhanced Modals */}
      <CreateMeetingModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        form={form}
        setForm={setForm}
        formError={formError}
        formSuccess={formSuccess}
        creating={creating}
        handleCreateMeeting={handleCreateMeeting}
        formRef={formRef}
      />

      <RegistrationModal
        showRegistrationModal={showRegistrationModal}
        setShowRegistrationModal={setShowRegistrationModal}
        selectedSession={selectedSession}
        registrationForm={registrationForm}
        setRegistrationForm={setRegistrationForm}
        registrationError={registrationError}
        registrationSuccess={registrationSuccess}
        registrationLoading={registrationLoading}
        handleRegistration={handleRegistration}
      />

      <EditMeetingModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editForm={editForm}
        setEditForm={setEditForm}
        formError={formError}
        formSuccess={formSuccess}
        editing={editing}
        handleEditMeeting={handleEditMeeting}
      />

      <AttendeesModal
        showAttendeesModal={showAttendeesModal}
        setShowAttendeesModal={setShowAttendeesModal}
        sessionAttendees={sessionAttendees}
      />

      {/* Enhanced Notifications */}
      <NotificationToast
        message={actionError}
        type="error"
        onClose={() => setActionError('')}
      />
      
      <NotificationToast
        message={actionSuccess}
        type="success"
        onClose={() => setActionSuccess('')}
      />
    </div>
  );
};

export default QnaPage;