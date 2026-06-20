import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useEniamzaApi } from '../hooks/useEniamzaApi';
import { 
  getAvailableCourseCodes, 
  getCourseSections, 
  getUniqueFaculties,
  searchCourses,
  extractTimeSlots
} from '../utils/courseUtils';
import { generateRoutine } from '../utils/routineGenerator';
import { getAllTimeSlots, getDays, getAllCoursesInTimeSlot, getRoutineDisplayText } from '../utils/scheduleUtils';
import RoutineGenerator from './RoutineGenerator';

const RoutineBuilder = () => {
  const { courses, loading, error } = useEniamzaApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourseCodes, setSelectedCourseCodes] = useState([]);
  const [courseFacultyPreferences, setCourseFacultyPreferences] = useState({});
  const [numberOfDays, setNumberOfDays] = useState(4);
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [routineError, setRoutineError] = useState(null);
  const [showRoutine, setShowRoutine] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const searchInputRef = useRef(null);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = searchCourses(courses, searchTerm);
    setSearchResults(results);
  }, [searchTerm, courses]);

  const handleAddCourse = (courseCode) => {
    if (!selectedCourseCodes.includes(courseCode) && selectedCourseCodes.length < 6) {
      setSelectedCourseCodes([...selectedCourseCodes, courseCode]);
      // Get available faculties for this course
      const sections = getCourseSections(courses, courseCode);
      const faculties = getUniqueFaculties(sections);
      // Set default faculty preference if available
      if (faculties.length > 0) {
        setCourseFacultyPreferences(prev => ({
          ...prev,
          [courseCode]: faculties[0]
        }));
      }
      // Clear search after adding
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const handleRemoveCourse = (courseCode) => {
    setSelectedCourseCodes(selectedCourseCodes.filter(code => code !== courseCode));
    const newPreferences = { ...courseFacultyPreferences };
    delete newPreferences[courseCode];
    setCourseFacultyPreferences(newPreferences);
  };

  const handleFacultyPreferenceChange = (courseCode, faculty) => {
    setCourseFacultyPreferences(prev => ({
      ...prev,
      [courseCode]: faculty
    }));
  };

  const handleNumberOfDaysChange = (days) => {
    if (days >= 2 && days <= 6) {
      setNumberOfDays(days);
    }
  };

  const handleGenerateRoutine = async () => {
    if (selectedCourseCodes.length < 2) {
      setRoutineError('Please select at least 2 courses');
      setGeneratedRoutine(null);
      setShowRoutine(false);
      return;
    }

    if (selectedCourseCodes.length > 6) {
      setRoutineError('Maximum 6 courses allowed');
      setGeneratedRoutine(null);
      setShowRoutine(false);
      return;
    }

    setIsGenerating(true);
    setRoutineError(null);

    // Let AI generate the routine with section selection
    const result = generateRoutine(
      courses,
      selectedCourseCodes,
      numberOfDays,
      courseFacultyPreferences // Pass course-specific faculty preferences
    );

    setIsGenerating(false);

    if (result.error) {
      setRoutineError(result.error);
      setGeneratedRoutine(null);
      setShowRoutine(false);
      
      if (result.conflicts) {
        console.log('Conflicts detected:', result.conflicts);
      }
    } else if (result.routine) {
      setRoutineError(null);
      setGeneratedRoutine(result.routine);
      setShowRoutine(true);
    }
  };

  // Get available faculties for a specific course
  const getAvailableFacultiesForCourse = (courseCode) => {
    const sections = getCourseSections(courses, courseCode);
    return getUniqueFaculties(sections);
  };

  // Filter out already selected courses from search results
  const filteredSearchResults = searchResults.filter(
    result => !selectedCourseCodes.includes(result.courseCode)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading courses from Eniamza API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading courses: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center">🤖 AI Routine Builder</h1>
      <p className="text-center text-gray-600">
        Select 2-6 courses, choose faculty preferences for each, and the AI will find the best sections
      </p>

      {/* Step 1: Select Courses with Search */}
      <div className="border rounded-lg p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Step 1: Select Courses (2-6 courses)</h2>
        
        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for courses by code (e.g., CSE110, STA201)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Search Results */}
          {searchTerm && filteredSearchResults.length > 0 && (
            <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
              {filteredSearchResults.slice(0, 20).map(result => {
                const sections = getCourseSections(courses, result.courseCode);
                const faculties = getUniqueFaculties(sections);
                
                return (
                  <button
                    key={result.courseCode}
                    onClick={() => handleAddCourse(result.courseCode)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{result.courseCode}</span>
                      <span className="text-sm text-gray-500 ml-2">{result.courseName}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {sections.length} sections • {faculties.length} faculties
                    </div>
                  </button>
                );
              })}
              {filteredSearchResults.length > 20 && (
                <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                  Showing first 20 results. Refine your search.
                </div>
              )}
            </div>
          )}
          
          {searchTerm && filteredSearchResults.length === 0 && (
            <div className="mt-2 p-4 text-center text-gray-500 border rounded-lg">
              No courses found matching "{searchTerm}"
            </div>
          )}
          
          {!searchTerm && (
            <div className="mt-2 text-sm text-gray-500">
              Type a course code to search (e.g., CSE110, STA201, EEE101)
            </div>
          )}
        </div>

        {/* Selected Courses with Faculty Preferences */}
        {selectedCourseCodes.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Selected Courses ({selectedCourseCodes.length}/6)
              <span className="text-xs text-gray-500 ml-2">(Set faculty preference for each course)</span>
            </label>
            <div className="space-y-2">
              {selectedCourseCodes.map(code => {
                const sections = getCourseSections(courses, code);
                const faculties = getUniqueFaculties(sections);
                const currentPreference = courseFacultyPreferences[code] || '';
                
                return (
                  <div key={code} className="flex flex-wrap items-center gap-2 p-3 border rounded bg-gray-50">
                    <span className="font-medium text-sm min-w-[80px]">{code}</span>
                    
                    <div className="flex-1 min-w-[150px]">
                      <select
                        value={currentPreference}
                        onChange={(e) => handleFacultyPreferenceChange(code, e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="">Any Faculty</option>
                        {faculties.map(faculty => (
                          <option key={faculty} value={faculty}>{faculty}</option>
                        ))}
                      </select>
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      {sections.length} sections available
                    </span>
                    
                    <button
                      onClick={() => handleRemoveCourse(code)}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedCourseCodes.length === 0 && (
          <p className="text-gray-500 text-sm">Search and select courses above</p>
        )}
      </div>

      {/* Step 2: Select Number of Days */}
      <div className="border rounded-lg p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">
          Step 2: Select Number of Days Per Week
          <span className="text-sm font-normal text-gray-500 ml-2">(2-6 days)</span>
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {[2, 3, 4, 5, 6].map(days => (
            <button
              key={days}
              onClick={() => handleNumberOfDaysChange(days)}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                numberOfDays === days
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {days} {days === 1 ? 'Day' : 'Days'}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Selected: {numberOfDays} days per week
        </p>
        <p className="text-xs text-gray-400 mt-1">
          AI will intelligently distribute your {selectedCourseCodes.length || 0} courses across {numberOfDays} days
        </p>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateRoutine}
          disabled={selectedCourseCodes.length < 2 || isGenerating}
          className={`px-6 py-3 rounded text-white transition-colors flex items-center gap-2 ${
            selectedCourseCodes.length < 2 || isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              AI is finding the best sections...
            </>
          ) : (
            `Generate Routine (${selectedCourseCodes.length} courses on ${numberOfDays} days)`
          )}
        </button>
      </div>

      {/* Error Message */}
      {routineError && (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-600">{routineError}</p>
        </div>
      )}

      {/* Generated Routine */}
      {showRoutine && generatedRoutine && (
        <RoutineGenerator
          routine={generatedRoutine}
          selectedCourses={generatedRoutine.courses}
          numberOfDays={numberOfDays}
          courseFacultyPreferences={courseFacultyPreferences}
        />
      )}
    </div>
  );
};

export default RoutineBuilder;