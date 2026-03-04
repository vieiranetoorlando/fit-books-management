import { BookCover } from './BookCover';

interface BookCardProps {
  title: string;
  author: string;
  description: string;
  coverUrl?: string | null;
  onOpen?: () => void;
}

export function BookCard({ title, author, description, coverUrl, onOpen }: BookCardProps) {
  return (
    <article className="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl bg-[#d2d1d7] md:max-w-none">
      <button type="button" onClick={onOpen} className="w-full text-left" aria-label={`Abrir detalhes de ${title}`}>
        <div className="flex h-[200px] items-center justify-center bg-[#d2d1d7] md:h-[210px]">
          <BookCover title={title} author={author} coverUrl={coverUrl} className="h-[170px] w-[114px] rounded-sm md:h-[180px] md:w-[120px]" />
        </div>

        <div className="min-h-[230px] bg-[#f0f0f0] px-5 py-4 md:min-h-[240px]">
          <h3 className="line-clamp-2 text-[20px] font-bold leading-tight text-zinc-900 md:text-[22px]">{title}</h3>
          <p className="mt-3 line-clamp-6 text-[16px] leading-snug text-zinc-800">{description}</p>
        </div>
      </button>
    </article>
  );
}
