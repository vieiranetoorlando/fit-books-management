import { api } from './api';
import type { Book, BookPayload } from '../types/book';

function resolveCoverUrl(coverUrl: string | null): string | null {
  if (!coverUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(coverUrl)) {
    return coverUrl;
  }

  const baseUrl = api.defaults.baseURL;
  if (typeof baseUrl !== 'string' || !baseUrl) {
    return coverUrl;
  }

  return new URL(coverUrl, baseUrl).toString();
}

function normalizeBook(book: Book): Book {
  return {
    ...book,
    coverUrl: resolveCoverUrl(book.coverUrl),
  };
}

export async function listBooks(): Promise<Book[]> {
  const response = await api.get<Book[]>('/books');
  return response.data.map(normalizeBook);
}

export async function createBook(payload: BookPayload): Promise<Book> {
  const response = await api.post<Book>('/books', payload);
  return normalizeBook(response.data);
}

export async function updateBook(id: string, payload: BookPayload): Promise<Book> {
  const response = await api.put<Book>(`/books/${id}`, payload);
  return normalizeBook(response.data);
}

export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/books/${id}`);
}

export async function uploadBookCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ url: string }>('/uploads/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.url;
}
