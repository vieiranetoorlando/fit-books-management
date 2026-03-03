import { ChevronLeft } from 'lucide-react';
import { useEffect } from 'react';
import type { Book } from '../types/book';
import { BookCover } from './BookCover';

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export function BookDetailsModal({ book, onClose, onEdit, onDelete }: BookDetailsModalProps) {
  const extraContent =
    book.content && book.content.trim() !== book.description.trim() ? book.content : null;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
      <div className="mx-auto min-h-screen w-full max-w-[1440px] bg-[#d9d9dd] px-4 pb-10 pt-5 md:px-8 md:pt-8">
        <main className="mx-auto w-full max-w-[1020px]">
          <header className="mb-8 flex items-center justify-between md:mb-10">
            <button type="button" onClick={onClose} className="flex items-center gap-2 text-[16px] font-semibold text-zinc-900 md:text-[22px]">
              <ChevronLeft size={30} />
              Voltar
            </button>

            <div className="flex items-center gap-4 md:gap-10">
              <button type="button" onClick={() => onEdit(book)} className="text-[16px] font-semibold text-zinc-900 md:text-[22px]">
                Editar
              </button>
              <button type="button" onClick={() => onDelete(book)} className="text-[16px] font-semibold text-red-700 md:text-[22px]">
                Excluir
              </button>
            </div>
          </header>

          <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-12">
            <div>
              <h1 className="max-w-[760px] text-[44px] font-bold leading-[1.08] text-zinc-900 md:text-[56px]">{book.title}</h1>

              <div className="mt-6 grid gap-4 text-[18px] text-zinc-900 md:mt-8 md:grid-cols-2 md:gap-8 md:text-[22px]">
                <p>Por {book.author}</p>
                <p>Publicado em {formatDate(book.publishedAt)}</p>
              </div>

              <div className="mt-6 max-w-[760px] whitespace-pre-line text-[16px] leading-[1.35] text-zinc-800 md:mt-8 md:text-[18px]">
                <p className="text-left md:text-justify">{book.description}</p>
                {extraContent && <p className="mt-4 text-left md:text-justify">{extraContent}</p>}
              </div>
            </div>

            <div className="mx-auto h-[360px] w-[236px] md:h-[420px] md:w-[270px]">
              <BookCover
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl}
                className="h-full w-full rounded-sm object-cover"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
