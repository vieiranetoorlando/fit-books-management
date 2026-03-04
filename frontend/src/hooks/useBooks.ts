import { useCallback, useState } from 'react';
import { createBook, deleteBook, listBooks, updateBook } from '../services/bookService';
import type { Book, BookPayload } from '../types/book';

export interface ToastState {
  kind: 'success' | 'error';
  message: string;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const maybeObject = error as { response?: { data?: { error?: string } } };
  return maybeObject.response?.data?.error ?? fallback;
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchBooks = useCallback(async () => {
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
  }, []);

  const saveBook = useCallback(async (payload: BookPayload, bookToEdit: Book | null) => {
    try {
      setSaving(true);

      if (bookToEdit) {
        await updateBook(bookToEdit.id, payload);
        setToast({ kind: 'success', message: 'Livro atualizado com sucesso.' });
      } else {
        await createBook(payload);
        setToast({ kind: 'success', message: 'Livro cadastrado com sucesso.' });
      }

      await fetchBooks();
      return true;
    } catch (requestError) {
      console.error('Erro ao salvar livro:', requestError);
      setToast({
        kind: 'error',
        message: getApiErrorMessage(requestError, 'Nao foi possivel salvar o livro. Revise os dados e tente novamente.'),
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchBooks]);

  const removeBook = useCallback(async (bookId: string) => {
    try {
      setDeleting(true);
      await deleteBook(bookId);
      setToast({ kind: 'success', message: 'Livro excluido com sucesso.' });
      await fetchBooks();
      return true;
    } catch (requestError) {
      console.error('Erro ao deletar:', requestError);
      setToast({
        kind: 'error',
        message: getApiErrorMessage(requestError, 'Nao foi possivel excluir o livro.'),
      });
      return false;
    } finally {
      setDeleting(false);
    }
  }, [fetchBooks]);

  return {
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
  };
}
