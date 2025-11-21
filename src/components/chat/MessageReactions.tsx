import React from 'react';

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  currentUserId: string;
  onReact?: (messageId: string, emoji: string) => void;
  className?: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = [],
  currentUserId,
  className = ''
}) => {
  const hasUserReacted = (reaction: MessageReaction): boolean => {
    return reaction.users.includes(currentUserId);
  };

  // Only display existing reactions, no ability to add new ones
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Display existing reactions only - read-only */}
      {reactions.map((reaction) => (
        <div
          key={reaction.emoji}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            backgroundColor: hasUserReacted(reaction) ? '#dbeafe' : '#f3f4f6',
            border: hasUserReacted(reaction) ? '1px solid #3b82f6' : '1px solid #d1d5db',
            borderRadius: '12px',
            fontSize: '12px',
            minHeight: '24px'
          }}
        >
          <span style={{ fontSize: '14px' }}>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </div>
      ))}
    </div>
  );
};