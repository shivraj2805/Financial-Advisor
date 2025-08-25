import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const RegistrationModal = ({
  showRegistrationModal,
  setShowRegistrationModal,
  selectedSession,
  registrationForm,
  setRegistrationForm,
  registrationError,
  registrationSuccess,
  registrationLoading,
  handleRegistration
}) => {
  if (!showRegistrationModal || !selectedSession) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-200/60 via-white/80 to-green-100/60 backdrop-blur-sm"></div>
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-green-300 rounded-full opacity-30 blur-2xl animate-float" style={{zIndex:1}}></div>
      <form onSubmit={handleRegistration} className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn flex flex-col max-h-[90vh] border border-green-100">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl">
          <button type="button" className="absolute top-6 right-6 text-white hover:text-gray-200 text-2xl transition-colors" onClick={() => setShowRegistrationModal(false)}>
            <FaTimes />
          </button>
          <h2 className="text-3xl font-extrabold text-center">Register for Meeting</h2>
          <p className="text-center opacity-90 mt-2">{selectedSession.title}</p>
        </div>
        
        <div className="overflow-y-auto px-8 py-6 flex-1">
          {registrationError && (
            <div className="flex items-center text-red-600 mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <FaExclamationCircle className="mr-3 text-xl" />
              {registrationError}
            </div>
          )}
          {registrationSuccess && (
            <div className="flex items-center text-green-600 mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <FaCheckCircle className="mr-3 text-xl" />
              {registrationSuccess}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <input 
                required 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                value={registrationForm.name} 
                onChange={e => setRegistrationForm(f => ({ ...f, name: e.target.value }))} 
                placeholder="Enter your full name" 
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Email <span className="text-red-500">*</span></label>
              <input 
                required 
                type="email"
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                value={registrationForm.email} 
                onChange={e => setRegistrationForm(f => ({ ...f, email: e.target.value }))} 
                placeholder="your.email@example.com" 
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Phone <span className="text-red-500">*</span></label>
              <input 
                required 
                type="tel"
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                value={registrationForm.phone} 
                onChange={e => setRegistrationForm(f => ({ ...f, phone: e.target.value }))} 
                placeholder="+91 98765 43210" 
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Organization</label>
              <input 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                value={registrationForm.organization} 
                onChange={e => setRegistrationForm(f => ({ ...f, organization: e.target.value }))} 
                placeholder="Your company or organization" 
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Experience Level</label>
              <select 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                value={registrationForm.experience} 
                onChange={e => setRegistrationForm(f => ({ ...f, experience: e.target.value }))}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Questions or Topics</label>
              <textarea 
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 resize-none" 
                rows="3"
                value={registrationForm.questions} 
                onChange={e => setRegistrationForm(f => ({ ...f, questions: e.target.value }))} 
                placeholder="Any specific questions or topics you'd like to discuss..." 
              />
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-6 rounded-b-3xl border-t border-gray-100">
          <button 
            type="submit" 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full text-lg flex items-center justify-center gap-2 transform hover:scale-105" 
            disabled={registrationLoading}
          >
            {registrationLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
            {registrationLoading ? 'Registering...' : 'Register for Meeting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationModal;
