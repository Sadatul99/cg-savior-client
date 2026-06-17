import { Link } from 'react-router-dom';

const AIScheduleButton = () => {
  return (
    <Link
      to="airoutinebuilder"
      className="relative inline-flex items-center justify-center"
    >
      <div className="relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>AI Routine Builder</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
};

export default AIScheduleButton;
