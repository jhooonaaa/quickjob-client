import React, { useState } from "react";

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Header */}
      <header className="w-full max-w-4xl bg-white shadow-md rounded-2xl p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Client Dashboard</h1>
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Logout
        </button>
      </header>

      {/* Profile Card */}
      <section className="w-full max-w-4xl bg-white mt-6 shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Profile</h2>
        <div className="flex items-center space-x-4">
          <img
            src="https://via.placeholder.com/100"
            alt="profile"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-800">Juan Dela Cruz</h3>
            <p className="text-gray-600">Client</p>
            <p className="text-gray-500 text-sm">
              Member since: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Booked Professionals */}
      <section className="w-full max-w-4xl bg-white mt-6 shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Booked Professionals
        </h2>
        <ul className="space-y-3">
          <li className="p-4 border rounded-lg hover:bg-gray-50">
            <h3 className="font-bold text-gray-800">Maria Santos</h3>
            <p className="text-gray-600 text-sm">Interior Designer</p>
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              View Profile
            </button>
          </li>
          <li className="p-4 border rounded-lg hover:bg-gray-50">
            <h3 className="font-bold text-gray-800">Pedro Ramirez</h3>
            <p className="text-gray-600 text-sm">Plumber</p>
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              View Profile
            </button>
          </li>
        </ul>
      </section>

      {/* Reviews */}
      <section className="w-full max-w-4xl bg-white mt-6 shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Reviews</h2>
        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <p className="text-gray-800">
              ⭐⭐⭐⭐ - Maria Santos did a great job designing my living room!
            </p>
            <span className="text-sm text-gray-500">Feb 20, 2025</span>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-gray-800">
              ⭐⭐⭐⭐⭐ - Pedro fixed our sink very fast and professional!
            </p>
            <span className="text-sm text-gray-500">Jan 15, 2025</span>
          </div>
        </div>
      </section>
    </div>
  );
}
