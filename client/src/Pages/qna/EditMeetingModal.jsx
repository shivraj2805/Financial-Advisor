import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUserTie, FaLink, FaExclamationCircle, FaCheckCircle, FaYoutube } from 'react-icons/fa';

const MEETING_TYPES = [
  { value: 'qna', label: 'Q&A', icon: '❓', color: 'green' },
  { value: 'webinar', label: 'Webinar', icon: '📹', color: 'blue' },
  { value: 'other', label: 'Other', icon: '👨‍🏫', color: 'purple' },
];

const EditMeetingModal = ({
  showEditModal,
  setShowEditModal,
  editForm,
  setEditForm,
  formError,
  formSuccess,
  editing,
  handleEditMeeting
}) => {
  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-200/60 via-white/80 to-green-100/60 backdrop-blur-sm"></div>
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-green-300 rounded-full opacity-30 blur-2xl animate-float" style={{zIndex:1}}></div>
      <form onSubmit={handleEditMeeting} className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-fadeIn flex flex-col max-h-[90vh] border border-green-100">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-t-3xl">
          <button type="button" className="absolute top-6 right-6 text-white hover:text-gray-200 text-2xl transition-colors" onClick={() => setShowEditModal(false)}>
            <FaTimes />
          </button>
          <h2 className="text-3xl font-extrabold text-center">Edit Meeting</h2>
          <p className="text-center opacity-90 mt-2">Update meeting details</p>
        </div>
        
        <div className="overflow-y-auto px-8 py-6 flex-1">
          {formError && (
            <div className="flex items-center text-red-600 mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <FaExclamationCircle className="mr-3 text-xl" />
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="flex items-center text-green-600 mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <FaCheckCircle className="mr-3 text-xl" />
              {formSuccess}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">Title <span className="text-red-500">*</span></label>
              <input 
                required 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                value={editForm.title} 
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} 
                placeholder="e.g. Dairy Business Q&A Session" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">Description</label>
              <textarea 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 resize-none" 
                rows="3"
                value={editForm.description} 
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} 
                placeholder="Brief description of what will be covered in this session..." 
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                <input 
                  required 
                  type="date" 
                  className="w-full border-2 border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                  value={editForm.date} 
                  onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} 
                />
              </div>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <FaClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                <input 
                  required 
                  type="time" 
                  className="w-full border-2 border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                  value={editForm.time} 
                  onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} 
                />
              </div>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Type</label>
              <select 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                value={editForm.type} 
                onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
              >
                {MEETING_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Duration</label>
              <input 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                value={editForm.duration} 
                onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))} 
                placeholder="e.g. 1h 30m" 
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Language</label>
              <select 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                value={editForm.language} 
                onChange={e => setEditForm(f => ({ ...f, language: e.target.value }))}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Urdu">Urdu</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">Topics <span className="text-gray-400 text-sm">(comma separated)</span></label>
              <input 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                value={editForm.topics} 
                onChange={e => setEditForm(f => ({ ...f, topics: e.target.value }))} 
                placeholder="e.g. loans, subsidies, insurance, best practices" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">Expert Name</label>
              <div className="relative">
                <FaUserTie className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                <input 
                  className="w-full border-2 border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                  value={editForm.expert} 
                  onChange={e => setEditForm(f => ({ ...f, expert: e.target.value }))} 
                  placeholder="Expert's name" 
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">Join URL</label>
              <div className="relative">
                <FaLink className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                <input 
                  className="w-full border-2 border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                  value={editForm.joinUrl} 
                  onChange={e => setEditForm(f => ({ ...f, joinUrl: e.target.value }))} 
                  placeholder="https://meet.google.com/..." 
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">YouTube Recording URL</label>
              <div className="relative">
                <FaYoutube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500" />
                <input 
                  className="w-full border-2 border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300" 
                  value={editForm.youtubeUrl} 
                  onChange={e => setEditForm(f => ({ ...f, youtubeUrl: e.target.value }))} 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Optional: Add YouTube URL for session recording</p>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-6 rounded-b-3xl border-t border-gray-100">
          <button 
            type="submit" 
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full text-lg flex items-center justify-center gap-2 transform hover:scale-105" 
            disabled={editing}
          >
            {editing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
            {editing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMeetingModal;