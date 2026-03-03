import { useState } from 'react';

interface BookCoverProps {
  title: string;
  author?: string;
  coverUrl?: string | null;
  className?: string;
}

function getHue(value: string): number {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
}

function getInitials(title: string): string {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return 'LV';
  }

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
}

export function BookCover({ title, author, coverUrl, className }: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(coverUrl) && !failed;

  if (showImage) {
    return (
      <img
        src={coverUrl ?? undefined}
        alt={`Capa do livro ${title}`}
        className={className}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  const hue = getHue(title);
  const initials = getInitials(title);

  return (
    <div
      className={`overflow-hidden rounded-md border border-white/40 ${className ?? ''}`}
      style={{
        background: `linear-gradient(165deg, hsl(${hue} 35% 24%), hsl(${(hue + 40) % 360} 40% 14%))`,
      }}
    >
      <div className="flex h-full flex-col justify-between bg-black/20 p-3 text-white">
        <p className="line-clamp-2 text-[9px] font-semibold uppercase leading-tight tracking-wide text-white/90">{title}</p>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-2xl font-bold tracking-wider text-white/95">{initials}</p>
        </div>
        <p className="line-clamp-1 text-[9px] text-white/80">{author ?? 'Biblioteca FIT'}</p>
      </div>
    </div>
  );
}
