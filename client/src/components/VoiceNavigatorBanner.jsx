import React, { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const VoiceNavigatorBanner = () => {
  const [isVisible, setIsVisible] = useState(false); // Start hidden, show after page load
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Mark as seen in localStorage
    localStorage.setItem('voiceNavigatorBannerSeen', 'true');
  };

  useEffect(() => {
    console.log('VoiceNavigatorBanner useEffect called');
    
    // Only show banner on homepage (root path)
    if (location.pathname !== '/') {
      console.log('Not on homepage, not showing banner');
      return;
    }
    
    // For testing - always show banner (remove localStorage check temporarily)
    // const hasSeenBanner = localStorage.getItem('voiceNavigatorBannerSeen');
    
    // Wait for page to fully load, then show banner
    const handlePageLoad = () => {
      console.log('Page fully loaded, showing banner');
      
             // Show banner after page load
       setIsVisible(true);
      
      // Auto-dismiss banner after 5 seconds
      const autoDismissTimer = setTimeout(() => {
        console.log('Auto-dismissing banner after 5 seconds');
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(autoDismissTimer);
    };
    
    // Check if page is already loaded
    if (document.readyState === 'complete') {
      // Page is already loaded, show banner immediately
      const timer = setTimeout(handlePageLoad, 1000); // Small delay for better UX
      return () => clearTimeout(timer);
    } else {
      // Wait for page to load
      window.addEventListener('load', handlePageLoad);
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, [location.pathname]);

  const handleTryVoice = () => {
    // Trigger voice navigator activation
    const event = new CustomEvent('activateVoiceNavigator');
    window.dispatchEvent(event);
    
    // Dismiss banner after activation
    handleDismiss();
  };



  // Debug logging
  console.log('VoiceNavigatorBanner render:', { isVisible, isDismissed, pathname: location.pathname });
  
  // Don't render if not on homepage or if dismissed/not visible
  if (location.pathname !== '/' || isDismissed || !isVisible) {
    return null;
  }

    return (
    <div className="fixed top-16 right-4 z-50 w-80 animate-slide-down">
      {/* Main banner container */}
      <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white shadow-2xl rounded-xl border border-white/20 backdrop-blur-sm overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse"></div>
        
        <div className="relative p-4">
          {/* Header with icon and title */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 bg-white/25 rounded-full shadow-lg border border-white/30 backdrop-blur-sm animate-pulse">
                <Mic className="h-4 w-4 text-white drop-shadow-sm" />
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-white/40 animate-ping"></div>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-lg">🎤</span>
              <span className="font-bold text-sm tracking-wide drop-shadow-sm">
                Hello Financial Advisor!
              </span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-green-50 text-xs font-medium leading-relaxed mb-3">
            You can also use voice navigation to explore our website. Try saying 
            <span className="font-semibold text-white mx-1">"Hello Financial Advisor"</span> 
            to get started!
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleTryVoice}
              className="group relative px-4 py-1.5 bg-white/25 hover:bg-white/35 rounded-full text-xs font-semibold transition-all duration-300 border border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center space-x-1">
                <span>🎯</span>
                <span>Try Voice</span>
              </span>
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handleDismiss}
              className="group p-1.5 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-white/30"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4 text-white/80 group-hover:text-white transition-colors duration-200" />
            </button>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 overflow-hidden rounded-b-xl">
            <div className="h-full bg-white/60 rounded-full animate-progress-bar"></div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-6 left-1 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default VoiceNavigatorBanner;
