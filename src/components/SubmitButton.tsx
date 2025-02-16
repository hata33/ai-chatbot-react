import React, { ButtonHTMLAttributes } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({ 
  children, 
  isSubmitting, 
  className = '',
  ...props 
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full px-4 py-2 text-white rounded-md ${
        isSubmitting 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
      } transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}