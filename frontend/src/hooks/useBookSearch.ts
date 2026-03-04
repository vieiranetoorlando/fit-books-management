import { useMemo, useState } from 'react';
import type { Book } from '../types/book';

export function useBookSearch(books: Book[]) {
  const [search, setSearch] = useState('');

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

  return { search, setSearch, filteredBooks };
}
