import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { BookCard } from '../components/BookCard';
import { BookFormModal } from '../components/BookFormModal';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { Toast } from '../components/Toast';
import { useBookSearch } from '../hooks/useBookSearch';
import { useBooks } from '../hooks/useBooks';
import type { Book, BookPayload } from '../types/book';

export function Home() {
  const {
    books,
    loading,
    saving,
    deleting,
    error,
    toast,
    setToast,
    fetchBooks,
    saveBook,
    removeBook,
  } = useBooks();
  const { search, setSearch, filteredBooks } = useBookSearch(books);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function handleSave(payload: BookPayload) {
    const saved = await saveBook(payload, bookToEdit);
    if (!saved) {
      return;
    }

    setIsModalOpen(false);
    setBookToEdit(null);
    setSelectedBook(null);
  }

  async function confirmDelete() {
    if (!bookToDelete) {
      return;
    }

    const deleted = await removeBook(bookToDelete.id);
    if (!deleted) {
      return;
    }

    setSelectedBook((current) => (current?.id === bookToDelete.id ? null : current));
    setBookToDelete(null);
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

  return (
    <div className="min-h-screen bg-black pt-5">
      <div className="mx-auto min-h-[calc(100vh-20px)] w-full max-w-[1440px] bg-[#d9d9dd] px-4 pb-10 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-[1000px]">
          <header className="mb-6 flex items-center justify-between md:mb-8">
            <h1 className="text-[52px] font-semibold leading-none text-zinc-900 md:text-[60px]">Livros</h1>
            <button
              type="button"
              onClick={openCreateModal}
              className="text-[34px] font-semibold leading-none text-zinc-900 md:text-[44px]"
            >
              Novo
            </button>
          </header>

          <div className="relative mb-8 md:mb-10">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              className="h-[52px] w-full rounded-2xl bg-[#f0f0f0] px-4 pr-12 text-[18px] text-zinc-700 outline-none md:h-[56px] md:text-[24px]"
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
