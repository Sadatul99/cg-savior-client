import React from 'react';

const FacultyHome = () => {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4 text-blue-800">Welcome, Faculty Member 👩‍🏫</h2>
                <p className="text-gray-600 text-lg mb-10">
                    Manage your courses, view student progress, and handle academic tasks with ease.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="My Courses" description="View and manage your course materials." />
                    <Card title="Student Submissions" description="Review and grade student work." />
                    <Card title="Announcements" description="Post updates and announcements for your classes." />
                </div>
            </div>
        </div>
    );
};

const Card = ({ title, description }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default FacultyHome;
