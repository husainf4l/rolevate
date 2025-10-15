import React from "react";

export default function SuccessStories() {
  return (
    <section className="w-full py-16 px-4 md:px-0 bg-white">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
          Success{" "}
          <span className="text-cyan-600">
            Stories
          </span>
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Hear from real users who landed their dream jobs with Rolevate's
          AI-powered interview platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              A
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              "The AI interview felt just like a real one! I got instant
              feedback and felt so much more confident in my next real interview.
              I landed a job at a top company in Dubai."
            </p>
            <span className="text-sm text-gray-500 font-medium">
              Amina S., Product Manager
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              M
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              "Rolevate's AI interview gave me questions tailored to my field.
              The feedback was spot-on and helped me improve my answers. I got
              hired within 2 weeks!"
            </p>
            <span className="text-sm text-gray-500 font-medium">
              Mohammed A., Software Engineer
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              L
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              "I was nervous about interviews, but the AI practice made it easy.
              The experience was realistic and the tips were super helpful.
              Highly recommend!"
            </p>
            <span className="text-sm text-gray-500 font-medium">
              Layla K., Marketing Specialist
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}