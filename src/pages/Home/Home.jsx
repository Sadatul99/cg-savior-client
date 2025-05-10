import React from "react";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>

      <main className="min-h-screen bg-white flex items-center justify-center px-8 py-20">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl">
    <div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
        Academic Success Starts with <span className="text-blue-600">CG Savior</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Plan, track, and optimize your semester performance with ease.
      </p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
        Get Started
      </button>
    </div>
    <div className="hidden md:block">
      {/* Optional: Replace with a Lottie animation or illustration */}
      <div className="bg-blue-100 h-64 w-full rounded-xl"></div>
    </div>
  </div>
</main>

    </div>
  );
};

export default Home;
