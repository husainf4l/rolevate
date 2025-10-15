import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinCompanyFormProps {
  loading: boolean;
  invitationCode: string;
  setInvitationCode: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function JoinCompanyForm({
  loading,
  invitationCode,
  setInvitationCode,
  onSubmit
}: JoinCompanyFormProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Join Your Team</h2>
        <p className="text-gray-600 text-sm">Enter the invitation code provided by your organization</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" action="#">
        <div>
          <Label htmlFor="invitationCode" className="text-sm font-medium text-gray-700 mb-1.5">
            Invitation Code *
          </Label>
          <Input
            id="invitationCode"
            required
            value={invitationCode}
            onChange={e => setInvitationCode(e.target.value)}
            placeholder="Enter your invitation code"
            className="h-12 text-center tracking-widest font-mono text-lg"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">This code was sent to you by your organization admin</p>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-12"
        >
          {loading ? 'Joining Company...' : 'Join Company'}
        </Button>
      </form>
    </div>
  );
}

