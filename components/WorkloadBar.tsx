import React from 'react';

interface WorkloadBarProps {
  percentage: number;
}

export const WorkloadBar: React.FC<WorkloadBarProps> = ({ percentage }) => {
  // Cap visual width at 100% but use color to indicate overload
  const visualPercentage = Math.min(percentage, 100);
  
  // Color logic
  const isOverload = percentage > 100;
  const barColor = isOverload ? 'bg-rose-500' : 'bg-emerald-500';
  const textColor = isOverload ? 'text-rose-500' : 'text-emerald-600';

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs text-gray-400">本周负荷</span>
        <span className={`text-xs font-bold ${textColor}`}>{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${barColor}`} 
          style={{ width: `${visualPercentage}%` }}
        />
      </div>
      {/* Visual indicator for overload part if needed, simpler to just show full bar for >100% in this design */}
      {percentage > 100 && (
         <div className="w-full h-1 mt-0.5 flex justify-end">
             {/* Optional: could show extra overflow indicators here */}
         </div>
      )}
    </div>
  );
};