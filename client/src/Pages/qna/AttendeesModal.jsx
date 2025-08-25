import React from 'react';
import { FaTimes, FaRegUser } from 'react-icons/fa';

const AttendeesModal = ({
  showAttendeesModal,
  setShowAttendeesModal,
  sessionAttendees
}) => {
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'E';

  if (!showAttendeesModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-200/60 via-white/80 to-green-100/60 backdrop-blur-sm"></div>
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full opacity-30 blur-2xl animate-float" style={{zIndex:1}}></div>
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-fadeIn flex flex-col max-h-[90vh] border border-green-100">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-3xl">
          <button type="button" className="absolute top-6 right-6 text-white hover:text-gray-200 text-2xl transition-colors" onClick={() => setShowAttendeesModal(false)}>
            <FaTimes />
          </button>
          <h2 className="text-3xl font-extrabold text-center">Meeting Attendees</h2>
          <p className="text-center opacity-90 mt-2">
            {sessionAttendees.length} {sessionAttendees.length === 1 ? 'attendee' : 'attendees'} registered
          </p>
        </div>
        
        <div className="overflow-y-auto px-8 py-6 flex-1">
          {sessionAttendees.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaRegUser className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees yet</h3>
              <p className="text-gray-500">
                No one has registered for this meeting yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionAttendees.map((attendee, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-medium">
                    {getInitials(attendee.name)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{attendee.name}</h4>
                    <p className="text-sm text-gray-500">{attendee.email}</p>
                    {attendee.organization && (
                      <p className="text-xs text-gray-400">{attendee.organization}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attendee.experience === 'beginner' ? 'bg-green-100 text-green-800' :
                      attendee.experience === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      attendee.experience === 'advanced' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {attendee.experience}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white p-6 rounded-b-3xl border-t border-gray-100">
          <button 
            type="button" 
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full text-lg flex items-center justify-center gap-2 transform hover:scale-105" 
            onClick={() => setShowAttendeesModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeesModal;