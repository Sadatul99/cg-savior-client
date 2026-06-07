import React from 'react';
import { Link } from 'react-router-dom';

const AIScheduleButton = () => {
  return (
    <Link
      to="airoutinebuilder"
      className="group relative inline-flex items-center justify-center"
    >
      {/* Background glow */}
      <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
      
      {/* Button */}
      <div className="relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/30 group-hover:scale-105 flex items-center gap-2">
        {/* AI Icon */}
        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        
        {/* Text */}
        <span>AI Routine Builder</span>
        
        {/* Arrow */}
        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 translate-x-[-5px] group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
};

export default AIScheduleButton;