import React from 'react';

interface SelectInputProps<T extends string> {
  id: string;
  label: string;
  options: Record<T, string> | { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

export default function SelectInput<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  required = false
}: SelectInputProps<T>) {
  const opts = Array.isArray(options)
    ? options
    : Object.entries(options).map(([value, label]) => ({ value, label }));

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        value={value}
        onChange={onChange}
        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none transition text-sm"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {opts.map(opt => (
          <option key={opt.value} value={opt.value}>
            {String(opt.label)}
          </option>
        ))}
      </select>
    </div>
  );
}

