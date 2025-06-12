"use client";
import Link from "next/link";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-rolevate-primaryText flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Rolevate</h1>
      <p className="text-xl mb-10 text-center max-w-md">
        Realistic interview simulations with AI interviewers to elevate your
        career
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-lg text-center hover:bg-slate-700 transition-colors">
          <h2 className="text-xl font-semibold mb-3">Technical Interview</h2>
          <p className="mb-4 text-gray-300">
            Data structures, algorithms, and coding challenges
          </p>
          <Link href="/app/interview?type=technical">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              Start Interview
            </button>
          </Link>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg text-center hover:bg-slate-700 transition-colors">
          <h2 className="text-xl font-semibold mb-3">Behavioral Interview</h2>
          <p className="mb-4 text-gray-300">
            Leadership, teamwork, and problem-solving scenarios
          </p>
          <Link href="/app/interview?type=behavioral">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              Start Interview
            </button>
          </Link>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg text-center hover:bg-slate-700 transition-colors">
          <h2 className="text-xl font-semibold mb-3">System Design</h2>
          <p className="mb-4 text-gray-300">
            Architecture, scalability, and system requirements
          </p>
          <Link href="/app/interview?type=systemDesign">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              Start Interview
            </button>
          </Link>
        </div>
      </div>

      <Link href="/app/interview">
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
          Custom Interview
        </button>
      </Link>
    </div>
  );
}
