

import { useState, useEffect } from "react";
import { useAuthState } from "../hooks/useAuthState";
import "../LandingPage/Hero/Hero.css";

export default function FinancialAdvisorChatbotUi() {
  const { user, isAuthenticated } = useAuthState();
  
  const [formData, setFormData] = useState({
    business_type: "",
    existing_savings: "",
    financial_goal: "",
    risk_tolerance: "low",
  });
  
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(user?.monthlyIncome || "");
  const [errors, setErrors] = useState({});
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const [progress, setProgress] = useState(0);
  const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    fetch(`${backend_url}/api/business-types`)
      .then((response) => response.json())
      .then((data) => setBusinessTypes(data.business_types))
      .catch((error) => console.error("Error fetching business types:", error));
  }, []);

  // Update tempIncome when user data changes
  useEffect(() => {
    if (user?.monthlyIncome) {
      setTempIncome(user.monthlyIncome);
    }
  }, [user?.monthlyIncome]);

  // Validation function for positive numbers
  const validatePositiveNumber = (value, fieldName) => {
    const num = parseFloat(value);
    if (value === "") return "";
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (num <= 0) return `${fieldName} must be greater than 0`;
    if (num > 999999999) return `${fieldName} is too large`;
    return "";
  };

  useEffect(() => {
    // Validate form fields
    const newErrors = {};
    
    // Validate existing savings
    newErrors.existing_savings = validatePositiveNumber(formData.existing_savings, "Existing savings");
    
    setErrors(newErrors);

    // Check if form is valid and user is authenticated
    const isValid =
      isAuthenticated &&
      user &&
      formData.business_type.trim() !== "" &&
      formData.existing_savings >= 0 && // Allow 0 for savings
      formData.financial_goal.trim() !== "" &&
      Object.values(newErrors).every(error => error === "");

    setFormValid(isValid);
    
    // Calculate progress (fields filled / total fields)
    const total = 4; // business_type, existing_savings, financial_goal, risk_tolerance
    let filled = 0;
    Object.values(formData).forEach((v) => {
      if (v && v !== "") filled++;
    });
    setProgress(Math.round((filled / total) * 100));
  }, [formData, isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For number fields, only allow positive numbers
    if (['existing_savings'].includes(name)) {
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^0-9.]/g, '');
      
      // Prevent multiple decimal points
      const parts = cleanValue.split('.');
      if (parts.length > 2) return;
      
      // Limit decimal places to 2
      if (parts.length === 2 && parts[1].length > 2) return;
      
      setFormData({ ...formData, [name]: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleIncomeEdit = () => {
    setIsEditingIncome(true);
  };

  const handleIncomeSave = () => {
    setIsEditingIncome(false);
    // The tempIncome will be used in the form submission
  };

  const handleIncomeCancel = () => {
    setTempIncome(user?.monthlyIncome || "");
    setIsEditingIncome(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid || !isAuthenticated || !user) return;
    
    setLoading(true);
    setAdvice(null);
    
    try {
      // Prepare the data with user profile information
      const requestData = {
        name: user.name || "",
        age: user.age || "",
        location: user.location || "",
        preferred_language: user.language || "English",
        monthly_income: tempIncome || user.monthlyIncome || "",
        family_size: user.familySize || "",
        business_type: formData.business_type,
        existing_savings: formData.existing_savings,
        financial_goal: formData.financial_goal,
        risk_tolerance: formData.risk_tolerance,
      };

      const response = await fetch(`${backend_url}/api/financial-advice/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) throw new Error("Failed to fetch advice");
      const result = await response.json();
      setAdvice(result.financial_advice || "No advice available.");
    } catch (error) {
      console.error("Error fetching advice:", error);
      alert("Error fetching advice. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const stripMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ");
  };

  // Show login message if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl border border-green-100 p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access personalized financial advice. Your profile information will be used to provide tailored recommendations.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg text-lg font-semibold shadow hover:from-green-600 hover:to-blue-600 transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Hero Banner */}
      <div className="w-full py-8 px-4 md:px-0 flex flex-col items-center bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-1 text-center">Financial Advisor</h1>
        <p className="text-lg text-green-700 mb-2 text-center max-w-2xl">Get personalized, expert financial advice tailored to your rural business, family, and goals. Your journey to financial growth starts here.</p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row items-start justify-center w-full max-w-7xl mx-auto px-2 md:px-8 py-6 gap-8">
        {/* Main Form Card */}
        <div className="flex-1 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-green-100 p-6 animate-fade-in">
          {/* Progress Bar */}
          <div className="w-full h-3 bg-green-50 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                list="business-types"
                name="business_type"
                placeholder="Select or type your business type"
                required
                className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
                autoComplete="off"
              />
              <datalist id="business-types">
                {businessTypes.map((type, index) => (
                  <option key={index} value={type} />
                ))}
              </datalist>
            </div>
            <div>
              <input
                type="number"
                name="existing_savings"
                placeholder="Existing Savings (₹)"
                min="0"
                step="0.01"
                required
                className={`p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 ${errors.existing_savings ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
              />
              {errors.existing_savings && <p className="text-red-500 text-xs mt-1">{errors.existing_savings}</p>}
            </div>
            <textarea
              name="financial_goal"
              placeholder="Your Financial Goals"
              required
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
            />
            <select
              name="risk_tolerance"
              required
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg text-lg font-semibold shadow hover:from-green-600 hover:to-blue-600 transition duration-300 disabled:opacity-50"
              disabled={!formValid}
            >
              Get Financial Advice
            </button>
          </form>
          {loading && (
            <div className="flex justify-center items-center h-24">
              <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          {(!advice && !loading) && (
            <p className="text-center mt-4 text-gray-500">
              No advice to display yet.
            </p>
          )}
        </div>
        {/* Right Sidebar with Illustration and Quote */}
        <div className="hidden md:flex flex-col items-center justify-center w-96 min-h-[28rem] p-6 bg-white/80 rounded-2xl shadow-xl border border-green-100 animate-fade-in">
          <div className="w-20 h-20 rounded-full shadow mb-4 border-4 border-green-200 flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-green-500 to-emerald-600">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <blockquote className="text-lg text-green-800 italic text-center mb-2">"The best way to predict your future is to create it."</blockquote>
          <div className="text-green-600 text-sm text-center mb-4">Your trusted financial partner for rural growth.</div>
          
          {/* User Profile Information */}
          <div className="w-full bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-2 border border-green-200">
            <h3 className="text-sm font-semibold text-green-800 mb-1 text-center">Your Profile Information</h3>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center py-0.5 border-b border-green-100">
                <span className="font-medium text-gray-700 text-xs">Name</span>
                <span className="text-gray-900 text-xs">{user.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-green-100">
                <span className="font-medium text-gray-700 text-xs">Age</span>
                <span className="text-gray-900 text-xs">{user.age || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-green-100">
                <span className="font-medium text-gray-700 text-xs">Location</span>
                <span className="text-gray-900 text-xs">{user.location || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-green-100">
                <span className="font-medium text-gray-700 text-xs">Language</span>
                <span className="text-gray-900 text-xs">{user.language || 'English'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-green-100">
                <span className="font-medium text-gray-700 text-xs">Income</span>
                <div className="flex items-center space-x-1">
                  {isEditingIncome ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={tempIncome}
                        onChange={(e) => setTempIncome(e.target.value)}
                        className="w-16 px-1 py-0.5 text-xs border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        placeholder="Amount"
                        min="0"
                      />
                      <button
                        onClick={handleIncomeSave}
                        className="text-green-600 hover:text-green-700 text-xs font-medium"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleIncomeCancel}
                        className="text-red-500 hover:text-red-600 text-xs font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-900 text-xs">
                        {tempIncome ? `₹${parseInt(tempIncome).toLocaleString()}` : (user.monthlyIncome ? `₹${parseInt(user.monthlyIncome).toLocaleString()}` : 'Not set')}
                      </span>
                      <button
                        onClick={handleIncomeEdit}
                        className="text-green-600 hover:text-green-700 text-xs font-medium ml-1"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-gray-700 text-xs">Family Size</span>
                <span className="text-gray-900 text-xs">{user.familySize || 'Not set'}</span>
              </div>
            </div>
            <div className="mt-1 pt-1 border-t border-green-200">
              <a href="/profile" className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center justify-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Profile
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Full-width Advice Timeline */}
      {advice && (
        <div className="w-full py-12 px-2 md:px-0 bg-gradient-to-br from-green-50 to-blue-100 border-t border-green-200 flex flex-col items-center animate-fade-in">
          <h2 className="text-3xl font-bold text-green-800 mb-10 text-center">Your Financial Roadmap</h2>
          <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-12">
            {advice
              .split("\n")
              .slice(1)
              .join("\n")
              .split("\n\n")
              .map((section, index, arr) => (
                <div key={index} className="relative flex items-start gap-6 group animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-4 border-white shadow-lg flex items-center justify-center z-10">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-green-500 to-emerald-600">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="w-1 h-24 bg-gradient-to-b from-green-300 to-blue-200 mt-1 mb-1"></div>
                    )}
                  </div>
                  {/* Advice content */}
                  <div
                    className="advice-step-card flex-1 bg-white rounded-xl shadow-xl border border-green-100 px-8 py-6 transition-all duration-300 focus:outline-none"
                    tabIndex={0}
                  >
                    <h3 className="text-2xl font-semibold text-green-700 mb-2">
                      {stripMarkdown(section.split(":")[0].trim())}
                    </h3>
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {stripMarkdown(section.split(":").slice(1).join(":").trim())}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}