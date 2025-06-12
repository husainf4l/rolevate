"use client";

interface BankDetailsProps {
  name: string;
  division: string;
  type: string;
}

export const BankDetails = ({ name, division, type }: BankDetailsProps) => {
  return (
    <div className="bg-slate-900/40 p-4 rounded-lg">
      <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">
        Bank Details
      </h3>
      <div className="space-y-1">
        <p className="text-md font-medium">{name}</p>
        <p className="text-sm text-gray-400">{division}</p>
        <div className="flex items-center mt-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs">{type}</span>
        </div>
      </div>
    </div>
  );
};
