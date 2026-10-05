import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'present' | 'absent' | 'published' | 'draft' | 'urgent' | 'high' | 'normal';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  // Clean unboxed inline status indicator with subtle dot and accessible contrast
  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-600';

  if (status === 'active' || status === 'present' || status === 'published') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-700';
  } else if (status === 'absent' || status === 'urgent') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-700';
  } else if (status === 'high' || status === 'draft') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else if (status === 'inactive') {
    dotColor = 'bg-slate-400';
    textColor = 'text-slate-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
