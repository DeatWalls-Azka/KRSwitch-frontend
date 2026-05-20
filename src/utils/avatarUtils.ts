import { 
  Cat, 
  Dog, 
  Rabbit, 
  Bird, 
  Fish, 
  Smile, 
  Heart, 
  Sparkles, 
  Star, 
  Crown, 
  Sun, 
  Moon, 
  Flame, 
  Anchor, 
  Compass 
} from 'lucide-react';
import React from 'react';

// --- Curated Unsplash Animal Pictures --------------------------
export const AESTHETICS_AVATARS = [
  'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=64&q=80', // Monkey
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=64&q=80', // Cat
  'https://images.unsplash.com/photo-1598978213913-54e1687b9f11?auto=format&fit=crop&w=64&q=80', // Seal
  'https://images.unsplash.com/photo-1537151608828-ea2b117b62e4?auto=format&fit=crop&w=64&q=80', // Puppy
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=64&q=80', // Panda
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=64&q=80', // Rabbit
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=64&q=80', // Koala
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=64&q=80', // Fox
  'https://images.unsplash.com/photo-1507666480829-a53be25720f7?auto=format&fit=crop&w=64&q=80', // Squirrel
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=64&q=80'  // Dog
];

export interface AnimalFallback {
  url: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
}

const FALLBACK_CONFIGS = [
  { bg: 'bg-emerald-600', icon: Smile, name: 'Monkey' },
  { bg: 'bg-amber-600', icon: Cat, name: 'Cat' },
  { bg: 'bg-sky-600', icon: Fish, name: 'Seal' },
  { bg: 'bg-yellow-600', icon: Dog, name: 'Puppy' },
  { bg: 'bg-rose-500', icon: Heart, name: 'Heart' },
  { bg: 'bg-lime-600', icon: Rabbit, name: 'Rabbit' },
  { bg: 'bg-purple-600', icon: Sparkles, name: 'Sparkles' },
  { bg: 'bg-orange-600', icon: Flame, name: 'Fox' },
  { bg: 'bg-teal-600', icon: Bird, name: 'Bird' },
  { bg: 'bg-indigo-600', icon: Star, name: 'Star' },
  { bg: 'bg-pink-600', icon: Crown, name: 'Crown' },
  { bg: 'bg-cyan-600', icon: Sun, name: 'Sun' },
  { bg: 'bg-violet-600', icon: Moon, name: 'Moon' },
  { bg: 'bg-blue-600', icon: Anchor, name: 'Anchor' },
  { bg: 'bg-amber-700', icon: Compass, name: 'Compass' }
];

export function getDeterministicAnimal(seed: string): AnimalFallback {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_CONFIGS.length;
  const config = FALLBACK_CONFIGS[index];
  const urlIndex = Math.abs(hash) % AESTHETICS_AVATARS.length;
  
  return {
    url: AESTHETICS_AVATARS[urlIndex],
    bg: config.bg,
    icon: config.icon,
    name: config.name
  };
}

/**
 * Returns a list of unique fallback animal avatars for a list of students to avoid duplication in the same UI view.
 */
export function getUniqueAnimalAvatars(students: { nim: string; name: string }[]): AnimalFallback[] {
  const usedIndices = new Set<number>();
  
  return students.map((student, idx) => {
    const seed = student.nim || student.name || idx.toString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let preferredIndex = Math.abs(hash) % FALLBACK_CONFIGS.length;
    let attempts = 0;
    
    // Scan forward if this combination index is already used in this set
    while (usedIndices.has(preferredIndex) && attempts < FALLBACK_CONFIGS.length) {
      preferredIndex = (preferredIndex + 1) % FALLBACK_CONFIGS.length;
      attempts++;
    }
    
    usedIndices.add(preferredIndex);
    const config = FALLBACK_CONFIGS[preferredIndex];
    const urlIndex = (preferredIndex) % AESTHETICS_AVATARS.length;
    
    return {
      url: AESTHETICS_AVATARS[urlIndex],
      bg: config.bg,
      icon: config.icon,
      name: config.name
    };
  });
}
