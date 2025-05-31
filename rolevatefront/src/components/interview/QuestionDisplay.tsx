"use client";

interface QuestionDisplayProps {
  question: string;
}

export const QuestionDisplay = ({ question }: QuestionDisplayProps) => {
  if (!question) return null;

  return (
    <div className="mt-6 bg-slate-700 p-4 rounded-lg max-w-lg text-center shadow-lg border border-slate-600">
      <p className="italic text-gray-300">&ldquo;{question}&rdquo;</p>
    </div>
  );
};
