import React from 'react';

interface FormSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  className?: string;
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  disabled = false,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-md border-gray-300 shadow-sm 
                 focus:border-accent focus:ring focus:ring-accent/20
                 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
