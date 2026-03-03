import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Home } from './Home';
import type { Book } from '../types/book';
import {
  createBook,
  deleteBook,
  listBooks,
  updateBook,
  uploadBookCover,
} from '../services/bookService';

vi.mock('../services/bookService', () => ({
  listBooks: vi.fn(),
  createBook: vi.fn(),
  updateBook: vi.fn(),
  deleteBook: vi.fn(),
  uploadBookCover: vi.fn(),
}));

const mockedListBooks = vi.mocked(listBooks);
const mockedCreateBook = vi.mocked(createBook);
const mockedUpdateBook = vi.mocked(updateBook);
const mockedDeleteBook = vi.mocked(deleteBook);
const mockedUploadBookCover = vi.mocked(uploadBookCover);

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-id',
    title: 'A Revolucao dos Bichos',
    author: 'George Orwell',
    description: 'Um classico sobre poder e politica.',
    content: 'Conteudo do livro para leitura detalhada.',
    publishedAt: '1945-08-17T00:00:00.000Z',
    coverUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateBook.mockResolvedValue(makeBook());
    mockedUpdateBook.mockResolvedValue(makeBook());
    mockedDeleteBook.mockResolvedValue();
    mockedUploadBookCover.mockResolvedValue('http://localhost:3000/uploads/test.png');
  });

  it('lists books and filters by author', async () => {
    mockedListBooks.mockResolvedValueOnce([
      makeBook({ id: '1', title: 'A Revolucao dos Bichos', author: 'George Orwell' }),
      makeBook({ id: '2', title: 'Dom Casmurro', author: 'Machado de Assis' }),
    ]);

    const user = userEvent.setup();
    render(<Home />);

    expect((await screen.findAllByText('A Revolucao dos Bichos')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Dom Casmurro')).length).toBeGreaterThan(0);

    await user.type(screen.getByPlaceholderText('Buscar'), 'orwell');

    expect(screen.getAllByText('A Revolucao dos Bichos').length).toBeGreaterThan(0);
    expect(screen.queryByText('Dom Casmurro')).not.toBeInTheDocument();
  });

  it('opens details modal when clicking a book card', async () => {
    const book = makeBook({ id: 'book-42', title: 'Livro de Teste' });

    mockedListBooks.mockResolvedValueOnce([book]);

    const user = userEvent.setup();
    render(<Home />);

    await screen.findByRole('button', { name: 'Abrir detalhes de Livro de Teste' });
    await user.click(screen.getByRole('button', { name: 'Abrir detalhes de Livro de Teste' }));

    expect(await screen.findByText('Voltar')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do livro para leitura detalhada.')).toBeInTheDocument();
  });

  it('shows custom delete confirmation modal', async () => {
    const book = makeBook({ id: 'del-1', title: 'Livro para Excluir' });
    mockedListBooks.mockResolvedValueOnce([book]);

    const user = userEvent.setup();
    render(<Home />);

    await screen.findByRole('button', { name: 'Abrir detalhes de Livro para Excluir' });
    await user.click(screen.getByRole('button', { name: 'Abrir detalhes de Livro para Excluir' }));
    await screen.findByText('Voltar');
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Tem certeza?')).toBeInTheDocument();
    expect(screen.getByText(/Ao excluir este livro/)).toBeInTheDocument();
  });
});
