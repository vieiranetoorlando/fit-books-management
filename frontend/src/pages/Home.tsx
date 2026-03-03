import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { BookCard } from '../components/BookCard';
import { BookFormModal } from '../components/BookFormModal';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { Toast } from '../components/Toast';
import { createBook, deleteBook, listBooks, updateBook } from '../services/bookService';
import type { Book, BookPayload } from '../types/book';

interface ToastState {
  kind: 'success' | 'error';
  message: string;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const maybeObject = error as { response?: { data?: { error?: string } } };
  return maybeObject.response?.data?.error ?? fallback;
}

export function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  async function fetchBooks() {
    try {
      setLoading(true);
      setError(null);
      const data = await listBooks();
      setBooks(data);
    } catch (requestError) {
      console.error('Erro ao buscar livros:', requestError);
      setError('Nao foi possivel carregar o acervo. Verifique a API e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload: BookPayload) {
    try {
      setSaving(true);

      if (bookToEdit) {
        await updateBook(bookToEdit.id, payload);
        setToast({ kind: 'success', message: 'Livro atualizado com sucesso.' });
      } else {
        await createBook(payload);
        setToast({ kind: 'success', message: 'Livro cadastrado com sucesso.' });
      }

      setIsModalOpen(false);
      setBookToEdit(null);
      setSelectedBook(null);
      await fetchBooks();
    } catch (requestError) {
      console.error('Erro ao salvar livro:', requestError);
      setToast({
        kind: 'error',
        message: getApiErrorMessage(requestError, 'Nao foi possivel salvar o livro. Revise os dados e tente novamente.'),
      });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!bookToDelete) {
      return;
    }

    try {
      setDeleting(true);
      await deleteBook(bookToDelete.id);
      setSelectedBook((current) => (current?.id === bookToDelete.id ? null : current));
      setBookToDelete(null);
      setToast({ kind: 'success', message: 'Livro excluido com sucesso.' });
      await fetchBooks();
    } catch (requestError) {
      console.error('Erro ao deletar:', requestError);
      setToast({
        kind: 'error',
        message: getApiErrorMessage(requestError, 'Nao foi possivel excluir o livro.'),
      });
    } finally {
      setDeleting(false);
    }
  }

  function askDelete(book: Book) {
    setBookToDelete(book);
  }

  function openCreateModal() {
    setBookToEdit(null);
    setIsModalOpen(true);
  }

  function openEditModal(book: Book) {
    setBookToEdit(book);
    setSelectedBook(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setBookToEdit(null);
  }

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return books;
    }

    return books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(query);
      const authorMatch = book.author.toLowerCase().includes(query);
      return titleMatch || authorMatch;
    });
  }, [books, search]);

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto min-h-screen w-full max-w-[1440px] bg-[#d9d9dd] px-4 pb-10 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-[1000px]">
          <header className="mb-6 flex items-center justify-between md:mb-8">
            <h1 className="text-[30px] font-bold leading-none text-zinc-900 md:text-[56px]">Livros</h1>
            <button type="button" onClick={openCreateModal} className="text-[26px] font-semibold text-zinc-900 md:text-[44px]">
              Novo
            </button>
          </header>

          <div className="relative mb-8 md:mb-10">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              className="h-[52px] w-full rounded-2xl bg-zinc-100 px-4 pr-12 text-[18px] text-zinc-700 outline-none md:h-[56px] md:text-[24px]"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={28} />
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-lg text-red-700">{error}</p>}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-zinc-800"></div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-500 bg-zinc-200 px-6 py-12 text-center text-2xl text-zinc-700">
              Nenhum livro encontrado para a busca atual.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  coverUrl={book.coverUrl}
                  onOpen={() => setSelectedBook(book)}
                />
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <BookFormModal
            key={bookToEdit?.id ?? 'new'}
            isSaving={saving}
            bookToEdit={bookToEdit}
            onClose={closeModal}
            onSubmit={handleSave}
          />
        )}

        {selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onEdit={openEditModal}
            onDelete={askDelete}
          />
        )}

        <ConfirmDeleteModal
          isOpen={Boolean(bookToDelete)}
          title="Tem certeza?"
          message="Ao excluir este livro nao sera possivel recupera-lo. Realmente deseja exclui-lo?"
          isLoading={deleting}
          onCancel={() => setBookToDelete(null)}
          onConfirm={confirmDelete}
        />

        {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
