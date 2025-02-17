import React from 'react';

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            {[
              'Email notifications for pickup reminders',
              'Monthly impact summary',
              'Community event updates'
            ].map((setting) => (
              <div key={setting} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">{setting}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Pickup Availability
          </h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Monday - Friday</span>
                <select className="text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                  <option>9:00 AM - 5:00 PM</option>
                  <option>10:00 AM - 6:00 PM</option>
                  <option>11:00 AM - 7:00 PM</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Weekend</span>
                <select className="text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                  <option>10:00 AM - 4:00 PM</option>
                  <option>11:00 AM - 5:00 PM</option>
                  <option>12:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Email
              </label>
              <input
                type="email"
                className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="alternative@example.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;