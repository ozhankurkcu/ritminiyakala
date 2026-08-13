import Image from 'next/image';
import { ACTIVITY_ICONS, ACTIVITY_LABELS, type ActivityType } from '@/lib/constants';

interface Props {
  type: ActivityType | 'custom' | string;
  size?: number;
  className?: string;
}

export function ActivityIcon({ type, size = 32, className = '' }: Props) {
  const resolved = (ACTIVITY_ICONS[type as ActivityType] ? type : 'diger') as ActivityType;
  return (
    <Image
      src={ACTIVITY_ICONS[resolved]}
      alt={ACTIVITY_LABELS[resolved] ?? type}
      width={size}
      height={size}
      className={className}
    />
  );
}
