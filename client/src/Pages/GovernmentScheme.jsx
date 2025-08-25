import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FaFilter, FaSearch, FaRegUser, FaMapMarkerAlt, FaRupeeSign, FaBirthdayCake, FaBriefcase, FaTimes, FaBars } from "react-icons/fa";

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "All",
    state: "All",
    income: "All",
    age: "All",
    occupation: "All",
  });

  const [activeCard, setActiveCard] = useState(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError("");

    try {
      const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
      const response = await axios.post(`${backend_url}/api/schemes`, filters);

      if (Array.isArray(response.data)) {
        setSchemes(response.data);
      } else {
        setSchemes([]);
        setError("Unexpected response format");
        console.error("Unexpected format:", response.data);
      }
    } catch (err) {
      setError("Failed to fetch schemes");
      setSchemes([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setHasSearched(true);
    fetchSchemes();
    // Close mobile filters after applying
    setIsMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      category: "All",
      state: "All",
      income: "All",
      age: "All",
      occupation: "All",
    });
    setHasSearched(false);
    fetchSchemes(); // Fetch all schemes again
    // Close mobile filters after clearing
    setIsMobileFiltersOpen(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset search state when filters change
    setHasSearched(false);
  };

  // Fetch all schemes when component mounts
  useEffect(() => {
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Scroll-based shading effect for cards
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll('.govt-scheme-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80 && rect.bottom > 80) {
          card.classList.add('scrolled');
        } else {
          card.classList.remove('scrolled');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 200); // Initial trigger
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter component to avoid repetition
  const FilterSection = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'p-4' : 'p-4 flex flex-col gap-3 h-full'}`}>
      {!isMobile && (
        <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-base">
          <FaFilter className="text-sm" /> Filters
        </div>
      )}
      
      <div className="relative mb-3">
        <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search schemes..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent bg-white/70 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {[
        { key: "category", icon: <FaRegUser className="text-xs" /> },
        { key: "state", icon: <FaMapMarkerAlt className="text-xs" /> },
        { key: "income", icon: <FaRupeeSign className="text-xs" /> },
        { key: "age", icon: <FaBirthdayCake className="text-xs" /> },
        { key: "occupation", icon: <FaBriefcase className="text-xs" /> },
      ].map(({ key, icon }) => (
        <div key={key} className="mb-2">
          <label className="block mb-1 capitalize font-medium flex items-center gap-1.5 text-gray-700 text-xs">
            {icon} {key}
          </label>
          <select
            className="w-full border border-gray-300/70 rounded-lg p-2 text-sm bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent shadow-sm"
            value={filters[key]}
            onChange={(e) => handleFilterChange(key, e.target.value)}
          >
            {["All"]
              .concat(
                key === "category"
                  ? [
                      "General",
                      "Agriculture",
                      "Healthcare",
                      "Housing",
                      "Education",
                      "Women",
                      "Youth",
                      "Senior Citizens",
                      "Business",
                      "Entrepreneurship",
                      "Rural Development",
                      "Social Welfare",
                      "Minorities",
                      "SC/ST",
                      "Disability"
                    ]
                  : key === "state"
                  ? [
                      "Andhra Pradesh",
                      "Arunachal Pradesh",
                      "Assam",
                      "Bihar",
                      "Chhattisgarh",
                      "Delhi",
                      "Goa",
                      "Gujarat",
                      "Haryana",
                      "Himachal Pradesh",
                      "Jammu & Kashmir",
                      "Jharkhand",
                      "Karnataka",
                      "Kerala",
                      "Madhya Pradesh",
                      "Maharashtra",
                      "Manipur",
                      "Meghalaya",
                      "Mizoram",
                      "Nagaland",
                      "Odisha",
                      "Punjab",
                      "Rajasthan",
                      "Sikkim",
                      "Tamil Nadu",
                      "Telangana",
                      "Tripura",
                      "Uttar Pradesh",
                      "Uttarakhand",
                      "West Bengal"
                    ]
                  : key === "income"
                  ? [
                      "Below 1L",
                      "1L-3L",
                      "3L-6L",
                      "6L-12L",
                      "Above 12L"
                    ]
                  : key === "age"
                  ? [
                      "0-5",
                      "6-17",
                      "18-25",
                      "26-40",
                      "41-60",
                      "60+"
                    ]
                  : [
                      "Farmer",
                      "Student",
                      "Business",
                      "Service",
                      "Entrepreneur",
                      "Unemployed",
                      "Women",
                      "Senior Citizen",
                      "Person with Disability"
                    ]
              )
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>
      ))}
      
      <div className={`${!isMobile ? 'mt-auto pt-3' : 'pt-3'} space-y-2`}>
        <button
          onClick={handleSubmit}
          className="w-full px-3 py-2 bg-green-600/90 text-white rounded-lg font-medium hover:bg-green-700/90 transition-colors shadow-sm hover:shadow-md text-sm"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="w-full px-3 py-2 bg-gray-500/90 text-white rounded-lg font-medium hover:bg-gray-600/90 transition-colors shadow-sm hover:shadow-md text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      <NavBar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 to-blue-50 flex relative overflow-hidden">
       

        {/* Mobile Filters Overlay */}
        {isMobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileFiltersOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-green-700">Filters</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <FilterSection isMobile={true} />
            </div>
          </div>
        )}

        {/* Desktop Sidebar filters */}
        <aside className="hidden lg:block fixed left-0 top-16 w-72 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-md border-r border-gray-200/50 shadow-xl flex flex-col z-20">
          <FilterSection />
        </aside>

        {/* Main content with responsive spacing */}
        <main className="flex-1 lg:ml-72 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-extrabold mb-4 lg:mb-6 text-green-800 tracking-tight">
              Government Schemes
            </h2>
            
            {/* Mobile Filter Summary */}
            <div className="lg:hidden mb-4 p-3 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Active Filters</span>
                </div>
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(filters).map(([key, value]) => 
                  value !== "All" && (
                    <span key={key} className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                      {key}: {value}
                    </span>
                  )
                )}
              </div>
            </div>
            
            {/* Show initial message if no search has been performed */}
            {!hasSearched && !loading && schemes.length > 0 && (
              <div className="flex flex-col items-center justify-center h-32 lg:h-40 text-gray-500 mb-4 lg:mb-6 bg-white/30 rounded-lg border border-gray-200/50 backdrop-blur-sm p-4">
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="mb-2 lg:mb-3">
                  <path stroke="currentColor" strokeWidth="1.5" d="M12 20v-6m0 0V4m0 10c-4.418 0-8 1.343-8 3v3h16v-3c0-1.657-3.582-3-8-3Z"/>
                </svg>
                <span className="text-sm lg:text-base font-medium text-center">Showing all available schemes</span>
                <span className="text-xs lg:text-sm text-gray-400 mt-1 text-center">Use filters to narrow down your search</span>
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center h-32 lg:h-40">
                <svg className="animate-spin h-8 w-8 lg:h-10 lg:w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50/80 border border-red-200/50 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6 backdrop-blur-sm">
                <p className="text-red-600 font-semibold text-sm lg:text-base">{error}</p>
              </div>
            )}
            
            {!loading && !error && schemes.length > 0 && (
              <>
                <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-white/30 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                  <p className="text-gray-600 text-xs lg:text-sm">
                    {hasSearched ? (
                      <>Showing <span className="font-bold text-green-700">{filteredSchemes.length}</span> filtered schemes</>
                    ) : (
                      <>Showing <span className="font-bold text-green-700">{filteredSchemes.length}</span> available schemes</>
                    )}
                  </p>
                </div>
                
                {filteredSchemes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 lg:h-64 text-gray-400 bg-white/30 rounded-lg border border-gray-200/50 backdrop-blur-sm p-4">
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24" className="lg:w-20 lg:h-20">
                      <path stroke="currentColor" strokeWidth="1.5" d="M12 20v-6m0 0V4m0 10c-4.418 0-8 1.343-8 3v3h16v-3c0-1.657-3.582-3-8-3Z"/>
                    </svg>
                    <span className="mt-3 lg:mt-4 text-base lg:text-lg text-center">No schemes found for your selection.</span>
                    <span className="text-xs lg:text-sm text-gray-500 mt-1 lg:mt-2 text-center">Try adjusting your filters or selecting different criteria</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {filteredSchemes.map((scheme, index) => (
                      <div
                        key={index}
                        className={`govt-scheme-card shadow-lg border border-green-100/50 rounded-xl lg:rounded-2xl bg-white/80 backdrop-blur-md transition-all duration-300 animate-fade-in relative overflow-hidden hover:shadow-xl hover:scale-105 ${activeCard === index ? ' ring-2 ring-green-300/50' : ''}`}
                        onMouseEnter={() => setActiveCard(index)}
                        onMouseLeave={() => setActiveCard(null)}
                        tabIndex={0}
                        onFocus={() => setActiveCard(index)}
                        onBlur={() => setActiveCard(null)}
                      >
                        <CardHeader className="pb-2 p-4 lg:p-6">
                          <div className="flex flex-wrap items-center gap-1 lg:gap-2 mb-1">
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100/70 text-green-700">
                              {scheme.category || "Scheme"}
                            </span>
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100/70 text-blue-700">
                              {scheme.state || "All India"}
                            </span>
                          </div>
                          <CardTitle className="text-lg lg:text-xl font-bold text-green-800 leading-tight">
                            {scheme.name || scheme.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-500 mt-1">
                            {scheme.eligibility && <span>Eligibility: {scheme.eligibility}</span>}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs lg:text-sm text-gray-800 p-4 lg:p-6 pt-0">
                          {scheme.description && (
                            <div className="mb-2">
                              <strong className="text-green-700">Description:</strong> 
                              <span className="line-clamp-3">{scheme.description}</span>
                            </div>
                          )}
                          {scheme.lastApplyDate && (
                            <div>
                              <strong className="text-green-700">Last Apply Date:</strong> {scheme.lastApplyDate}
                            </div>
                          )}
                          {scheme.applicationProcedure && (
                            <div>
                              <strong className="text-green-700">How to Apply:</strong> 
                              <span className="line-clamp-2">{scheme.applicationProcedure}</span>
                            </div>
                          )}
                          {scheme.applicationLink && scheme.applicationLink.startsWith("https://") && scheme.applicationLink.includes(".gov.in") && (
                            <div className="pt-2">
                              <a
                                href={scheme.applicationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-full text-center px-4 py-2 bg-gradient-to-r from-green-500/90 to-blue-500/90 text-white rounded-lg font-semibold shadow hover:from-green-600/90 hover:to-blue-600/90 transition text-sm"
                              >
                                Apply Now
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default GovernmentSchemes;