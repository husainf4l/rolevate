import React, { useRef, useState } from "react";
import { Button } from "@/components/common/Button";

interface JobApplyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; mobile: string; cv: File | null; letter?: string }) => void;
  loading?: boolean;
}

export default function JobApplyModal({ open, onClose, onSubmit, loading }: JobApplyModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [letter, setLetter] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type - only allow PDF
      if (file.type !== 'application/pdf') {
        setError('Please upload only PDF files for your CV.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError('Please upload a CV file smaller than 10MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setError(''); // Clear any previous errors
      setCv(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !cv) {
      setError("Please fill in all required fields and upload your CV.");
      return;
    }
    setError("");
    onSubmit({ name, mobile, cv, letter });
  };

  if (!open) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-2 py-8 sm:py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative p-0 sm:p-10">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl sm:top-5 sm:right-5"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="p-6 sm:p-0">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Apply for this Job</h2>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Full Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:ring-2 focus:ring-[#13ead9] focus:border-[#13ead9] outline-none text-base"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Mobile Number<span className="text-red-500">*</span></label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:ring-2 focus:ring-[#13ead9] focus:border-[#13ead9] outline-none text-base"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
                placeholder="05XXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">CV / Resume<span className="text-red-500">*</span></label>
              <input
                type="file"
                accept=".pdf"
                className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:ring-2 focus:ring-[#13ead9] focus:border-[#13ead9] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#13ead9]/10 file:text-[#0891b2] text-base"
                ref={fileInputRef}
                onChange={handleFileChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Only PDF files are accepted. Maximum file size: 10MB.</p>
              {cv && <div className="text-xs text-gray-500 mt-1">Selected: {cv.name}</div>}
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Cover Letter <span className="text-gray-400">(optional)</span></label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-5 py-5 focus:ring-2 focus:ring-[#13ead9] focus:border-[#13ead9] outline-none min-h-[160px] text-base resize-vertical"
                value={letter}
                onChange={e => setLetter(e.target.value)}
                placeholder="Write a short message..."
              />
            </div>
            {error && <div className="text-red-500 text-base text-center">{error}</div>}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              loading={loading}
            >
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
