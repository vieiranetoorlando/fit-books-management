import { api } from './api';
import type { Book, BookPayload } from '../types/book';

export async function listBooks(): Promise<Book[]> {
  const response = await api.get<Book[]>('/books');
  return response.data;
}

export async function createBook(payload: BookPayload): Promise<Book> {
  const response = await api.post<Book>('/books', payload);
  return response.data;
}

export async function updateBook(id: string, payload: BookPayload): Promise<Book> {
  const response = await api.put<Book>(`/books/${id}`, payload);
  return response.data;
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
