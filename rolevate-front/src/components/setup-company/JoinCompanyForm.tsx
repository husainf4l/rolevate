import React from 'react';

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
    <form onSubmit={onSubmit}>
      <div className="mb-5">
        <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-1.5">
          Invitation Code *
        </label>
        <input
          id="invitationCode"
          required
          value={invitationCode}
          onChange={e => setInvitationCode(e.target.value)}
          className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
          placeholder="Enter your invitation code"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold hover:scale-[1.01] transition-all text-sm disabled:opacity-60"
      >
        {loading ? 'Joining Company...' : 'Join Company'}
      </button>
    </form>
  );
}

