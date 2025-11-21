// src/components/chat/TypingIndicator.tsx
import React from 'react';

type TypingUser = { id?: string; name?: string };

type Props = {
  users?: TypingUser[];
  className?: string;
};

const TypingIndicator: React.FC<Props> = ({ users = [], className }) => {
  if (!users.length) return null;

  const names = users.map(u => u.name || 'Alguém').join(', ');
  return (
    <div className={`px-4 py-2 text-xs text-gray-500 ${className || ''}`}>
      {names} digitando
      <span className="inline-flex ml-1 gap-1">
        <span className="animate-bounce">•</span>
        <span className="animate-bounce [animation-delay:0.15s]">•</span>
        <span className="animate-bounce [animation-delay:0.3s]">•</span>
      </span>
    </div>
  );
};

export default TypingIndicator;  // ✅ default export
export { TypingIndicator };      // (opcional) named export também
