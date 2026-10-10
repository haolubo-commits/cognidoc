import React from 'react';

export function ConfidenceBadge({ score }) {
  const percentage = Math.round(score * 100);
  
  let badgeClass = 'badge-high';
  let label = 'Strong Match';

  if (percentage < 60) {
    badgeClass = 'badge-low';
    label = 'Weak Context';
  } else if (percentage < 80) {
    badgeClass = 'badge-med';
    label = 'Moderate Match';
  }

  return (
    <span className={`badge ${badgeClass}`} title={`${label}: ${(score * 100).toFixed(1)}% cosine similarity`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
      {percentage}% match
    </span>
  );
}
