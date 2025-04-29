import React from 'react';
import { Helmet } from 'react-helmet';

const Home = () => {
    return (
        <div>
            <Helmet>
                <title>Home</title>
            </Helmet>
            
            <div
                className="hero min-h-screen relative"
                style={{
                    backgroundImage:
                        "url(https://i.ibb.co.com/BKQtZMH2/freepik-a-young-man-with-short-brown-hair-and-a-wellgroome-71915.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Dark Overlay for Better Readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Content */}
                <div className="hero-content text-white text-center relative z-10">
                    <div className="max-w-2xl">
                        <h1 className="mb-6 text-6xl font-extrabold leading-tight">
                            Unlock Your Potential with <span className="text-blue-500">CG Savior</span>
                        </h1>
                        <p className="mb-6 text-lg">
                            Take control of your academic journey with powerful tools, expert guidance, and a supportive community.
                            Your success starts here!
                        </p>
                        <button className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-500 transition rounded-lg shadow-md">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;