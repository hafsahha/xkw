"use client";
import { useState } from "react";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    bio: "Full-stack developer passionate about web technologies. Building cool stuff with React, Next.js, and Node.js.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate back to profile
      window.history.back();
    }, 1000);
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-black">Edit profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-black text-white px-4 py-1.5 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        {/* Cover Photo */}
        <div className="relative">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
          <button className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors">
            <div className="bg-black/70 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
        </div>

        {/* Avatar */}
        <div className="relative px-4 -mt-12 sm:-mt-16 mb-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full border-4 border-white"></div>
            <button className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors rounded-full">
              <div className="bg-black/70 p-1.5 sm:p-2 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={50}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.name.length}/50
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={160}
              placeholder="Tell the world about yourself"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.bio.length}/160
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={30}
              placeholder="Where are you located?"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.location.length}/30
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          {/* Birth date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birth date</label>
            <div className="grid grid-cols-3 gap-3">
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option>Month</option>
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option>Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option>Year</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This information will not be displayed publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
            </p>
          </div>

          {/* Switch to professional account */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Switch to professional</h3>
                <p className="text-sm text-gray-500">Get access to creator tools and analytics</p>
              </div>
              <button className="text-pink-600 hover:text-pink-700 font-medium">
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* Bottom padding for mobile */}
        <div className="h-20"></div>
      </div>
    </>
  );
}