import React from "react";
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and privacy settings.
          </p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0fc4b5] bg-opacity-10 rounded-lg">
                <UserIcon className="w-6 h-6 text-[#0fc4b5]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Settings
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                defaultValue="San Francisco, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
              />
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Notification Preferences
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Email Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Application status updates
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Interview reminders
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">New job matches</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Marketing emails
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Push Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Urgent application updates
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Interview reminders (30 min before)
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Daily job alerts
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Privacy & Security
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Profile Visibility
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    defaultChecked
                    className="text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Public - Visible to all employers
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    className="text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Private - Only visible to employers I apply to
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    className="text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Hidden - Not visible to any employers
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Data Preferences
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Allow analytics to improve job matching
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded text-[#0fc4b5] focus:ring-[#0fc4b5]"
                  />
                  <span className="text-sm text-gray-700">
                    Share anonymous usage data
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <KeyIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Account Security
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <KeyIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">
                    Last changed 3 months ago
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600">Not enabled</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Email Verification
                  </p>
                  <p className="text-sm text-green-600">Verified</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                <ShieldCheckIcon className="w-4 h-4 mr-1" />
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cog6ToothIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Preferences
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent">
                  <option>Pacific Time (PT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Central Time (CT)</option>
                  <option>Eastern Time (ET)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Alert Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
                <option>Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-900">
                Danger Zone
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-red-900">Export Data</p>
                <p className="text-sm text-red-700">
                  Download all your data including applications, messages, and
                  profile information.
                </p>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                Export Data
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-red-900">Deactivate Account</p>
                <p className="text-sm text-red-700">
                  Temporarily deactivate your account. You can reactivate it
                  anytime.
                </p>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                Deactivate
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-red-900">Delete Account</p>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
