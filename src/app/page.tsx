"use client";

import { useEffect, useState, useCallback } from "react";

// Custom hook for debounced search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Advocate {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Debounce search term to avoid filtering on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    console.log("fetching advocates...");
    setIsLoading(true);
    fetch("/api/advocates")
      .then((response) => response.json())
      .then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((error) => {
        console.error("Error fetching advocates:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Optimized search function with useCallback
  const performSearch = useCallback((searchValue: string) => {
    if (!searchValue.trim()) {
      setFilteredAdvocates(advocates);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    console.log("filtering advocates...");
    
    const searchLower = searchValue.toLowerCase().trim();
    const filtered = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(searchLower) ||
        advocate.lastName.toLowerCase().includes(searchLower) ||
        advocate.city.toLowerCase().includes(searchLower) ||
        advocate.degree.toLowerCase().includes(searchLower) ||
        advocate.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        ) ||
        advocate.yearsOfExperience.toString().includes(searchLower)
      );
    });

    setFilteredAdvocates(filtered);
    setIsSearching(false);
  }, [advocates]);

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Solace Advocates</h1>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Search Advocates</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={handleSearchChange} 
              placeholder="Search by name, city, degree, or specialty..."
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Searching for: <span className="font-medium">&ldquo;{searchTerm}&rdquo;</span>
            {!isSearching && (
              <span className="ml-2">({filteredAdvocates.length} results)</span>
            )}
          </p>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading advocates...</span>
        </div>
      ) : filteredAdvocates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advocates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No advocates match "${searchTerm}". Try adjusting your search.`
              : "No advocates available at the moment."
            }
          </p>
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border border-gray-300 text-left font-medium">First Name</th>
                <th className="p-3 border border-gray-300 text-left font-medium">Last Name</th>
                <th className="p-3 border border-gray-300 text-left font-medium">City</th>
                <th className="p-3 border border-gray-300 text-left font-medium">Degree</th>
                <th className="p-3 border border-gray-300 text-left font-medium">Specialties</th>
                <th className="p-3 border border-gray-300 text-left font-medium">Years of Experience</th>
                <th className="p-3 border border-gray-300 text-left font-medium">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdvocates.map((advocate) => (
                <tr key={advocate.id} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-300">{advocate.firstName}</td>
                  <td className="p-3 border border-gray-300">{advocate.lastName}</td>
                  <td className="p-3 border border-gray-300">{advocate.city}</td>
                  <td className="p-3 border border-gray-300">{advocate.degree}</td>
                  <td className="p-3 border border-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {advocate.specialties.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 border border-gray-300">{advocate.yearsOfExperience}</td>
                  <td className="p-3 border border-gray-300">{advocate.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvocates.map((advocate) => (
            <div key={advocate.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {advocate.firstName} {advocate.lastName}
                </h3>
                <p className="text-sm text-gray-600">{advocate.degree}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 w-20">City:</span>
                  <span className="text-gray-600">{advocate.city}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 w-20">Experience:</span>
                  <span className="text-gray-600">{advocate.yearsOfExperience} years</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 w-20">Phone:</span>
                  <span className="text-gray-600">{advocate.phoneNumber}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="font-medium text-gray-700 text-sm block mb-2">Specialties:</span>
                <div className="flex flex-wrap gap-1">
                  {advocate.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                Contact Advocate
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
