import React, { useState } from 'react';
import { getDeterministicAnimal, AnimalFallback } from '../../utils/avatarUtils';

interface StudentAvatarProps {
  nim: string;
  name: string;
  picture?: string;
  fallbackAnimal?: AnimalFallback;
  sizeClassName?: string;
  borderClassName?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function StudentAvatar({
  nim,
  name,
  picture,
  fallbackAnimal,
  sizeClassName = 'w-5.5 h-5.5',
  borderClassName = 'border border-white shadow-xs',
  style,
  className = ''
}: StudentAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Get the animal configuration
  const animal = fallbackAnimal || getDeterministicAnimal(nim || name);

  if (picture && !hasError) {
    return (
      <div
        style={style}
        className={`rounded-full overflow-hidden shrink-0 ${sizeClassName} ${borderClassName} ${className}`}
        title={name}
      >
        <img
          src={picture}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback to cute colored animal icon
  const IconComponent = animal.icon;
  return (
    <div
      style={style}
      className={`rounded-full flex items-center justify-center text-white shrink-0 ${animal.bg} ${sizeClassName} ${borderClassName} ${className}`}
      title={`${name} (${animal.name} Fallback)`}
    >
      <IconComponent className="w-3 h-3 stroke-[2.5]" />
    </div>
  );
}
