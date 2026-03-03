import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookCover } from './BookCover';

describe('BookCover', () => {
  it('renders styled fallback when no cover url is provided', () => {
    render(<BookCover title="Dom Casmurro" author="Machado de Assis" />);

    expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.getByText('Machado de Assis')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('switches to fallback when image load fails', () => {
    render(<BookCover title="A Revolucao dos Bichos" coverUrl="http://localhost/invalid.png" />);

    const image = screen.getByRole('img', { name: 'Capa do livro A Revolucao dos Bichos' });
    fireEvent.error(image);

    expect(screen.getByText('A Revolucao dos Bichos')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Capa do livro A Revolucao dos Bichos' })).not.toBeInTheDocument();
  });
});
