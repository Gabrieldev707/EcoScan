import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  size?: number;
}

export function Loading({ fullScreen = false, size = 32 }: LoadingProps) {
  const spinner = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--green)"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', zIndex: 999,
      }}>
        {spinner}
      </div>
    );
  }

  return <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>{spinner}</div>;
}
