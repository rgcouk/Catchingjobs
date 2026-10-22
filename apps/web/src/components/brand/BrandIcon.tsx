import { cn } from '../../lib/utils';

export type BrandIconName =
  | 'pickup'
  | 'pay'
  | 'no-cv'
  | 'ppe'
  | 'chicken'
  | 'turkey'
  | 'location'
  | 'team'
  | 'verified'
  | 'moffett'
  | 'mods'
  | 'farm'
  | 'driving-licence'
  | 'night-shift'
  | 'day-shift'
  | 'hours'
  | 'employment'
  | 'training'
  | 'immediate-start'
  | 'right-to-work'
  | 'physical-work'
  | 'animal-welfare'
  | 'crew-leader'
  | 'biosecurity';

interface BrandIconProps {
  name: BrandIconName;
  size?: 16 | 20 | 24 | 32 | 64;
  label?: string;
  className?: string;
}

/** Native Pencil artwork; adjacent text supplies its accessible label by default. */
export function BrandIcon({ name, size = 32, label, className }: BrandIconProps) {
  return (
    <img
      src={`/assets/brand/icons/${name}-${size > 32 ? 64 : 32}.svg`}
      width={size}
      height={size}
      alt={label || ''}
      aria-hidden={label ? undefined : true}
      className={cn('inline-block shrink-0 object-contain', className)}
      decoding="async"
    />
  );
}
