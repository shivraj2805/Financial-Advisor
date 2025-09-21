import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../Authorisation/AuthProvider';

const SuccessLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('access_token');
      const userId = params.get('user_id');

      console.log('🔍 SuccessLogin - Token:', token ? 'Present' : 'Missing');
      console.log('🔍 SuccessLogin - User ID:', userId);

      if (!token) {
        console.log('❌ No token found, redirecting to login');
        return navigate('/login');
      }

      try {
        // Store token in localStorage for axios interceptor
        localStorage.setItem('token', token);
        
        // Set flag to indicate we're coming from Google OAuth
        sessionStorage.setItem('fromGoogleOAuth', 'true');
        
        console.log('🔍 SuccessLogin - Making request to /api/auth/user');
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/user`,
          { 
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('✅ SuccessLogin - User response:', response.data);
        
        if (response.data.success) {
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Login the user
          login(response.data.user, token);
          
          // Show success message
          toast.success(`Welcome, ${response.data.user.name}! 🎉`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Navigate to dashboard
          setTimeout(() => {
            navigate('/financialAdvisior');
          }, 1000);
        } else {
          console.log('❌ SuccessLogin - Login failed, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('❌ SuccessLogin - Error fetching user:', error);
        console.error('❌ SuccessLogin - Error details:', error.response?.data);
        
        // Clear any stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        toast.error('Login failed. Please try again.', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Logging you in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default SuccessLogin;
