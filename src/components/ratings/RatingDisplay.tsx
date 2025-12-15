import React from 'react';
import { Star, Users } from 'lucide-react';

interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  averageRating,
  totalRatings,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${sizeClasses[size]} text-yellow-400 fill-current`}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${sizeClasses[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star
            key={i}
            className={`${sizeClasses[size]} text-gray-300`}
          />
        );
      }
    }
    
    return stars;
  };

  if (totalRatings === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
          ))}
        </div>
        <span className={`text-gray-500 dark:text-gray-400 ${textSizeClasses[size]}`}>
          Sem avaliações
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex space-x-1">
        {renderStars()}
      </div>
      <span className={`font-semibold text-foreground ${textSizeClasses[size]}`}>
        {averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`text-muted-foreground flex items-center space-x-1 ${textSizeClasses[size]}`}>
          <Users className={sizeClasses[size]} />
          <span>({totalRatings})</span>
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;