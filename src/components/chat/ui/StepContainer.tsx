import React from 'react';

interface StepContainerProps {
  step: string;
  children: React.ReactNode;
}

export const StepContainer: React.FC<StepContainerProps> = ({ step, children }) => {
  return (
    <div 
      className="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-500 ease-in-out animate-fade-in-down"
      key={step}
    >
      {children}
    </div>
  );
};