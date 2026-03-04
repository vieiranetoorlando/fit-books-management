import { Prisma } from '@prisma/client';

export interface BookPayload {
  title?: string;
  author?: string;
  description?: string;
  content?: string;
  publishedAt?: string;
  coverUrl?: string;
}

const MAX_TITLE_LENGTH = 180;
const MAX_AUTHOR_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 4000;
const MAX_CONTENT_LENGTH = 20000;
const MAX_COVER_URL_LENGTH = 2048;

export function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function ensureMaxLength(field: string, value: string, max: number) {
  if (value.length > max) {
    throw new Error(`${field} excedeu o limite de ${max} caracteres.`);
  }
}

function parseDateOnlyToUtc(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() + 1 !== month
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function parseRequiredDate(value: string | undefined): Date {
  if (!value) {
    throw new Error('Data de publicacao e obrigatoria.');
  }

  const trimmed = value.trim();
  const utcDate = parseDateOnlyToUtc(trimmed);
  if (utcDate) {
    return utcDate;
  }

  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Data de publicacao invalida.');
  }

  return parsedDate;
}

export function buildCreateData(payload: BookPayload): Prisma.BookCreateInput {
  const title = payload.title?.trim();
  const author = payload.author?.trim();
  const description = payload.description?.trim();
  const content = payload.content?.trim();
  const coverUrl = payload.coverUrl?.trim();

  if (!title) {
    throw new Error('Titulo e obrigatorio.');
  }
  if (!author) {
    throw new Error('Autor e obrigatorio.');
  }
  if (!description) {
    throw new Error('Descricao e obrigatoria.');
  }

  ensureMaxLength('Titulo', title, MAX_TITLE_LENGTH);
  ensureMaxLength('Autor', author, MAX_AUTHOR_LENGTH);
  ensureMaxLength('Descricao', description, MAX_DESCRIPTION_LENGTH);
  if (content) {
    ensureMaxLength('Conteudo', content, MAX_CONTENT_LENGTH);
  }
  if (coverUrl) {
    ensureMaxLength('URL da capa', coverUrl, MAX_COVER_URL_LENGTH);
  }

  return {
    title,
    author,
    description,
    publishedAt: parseRequiredDate(payload.publishedAt),
    content: content || null,
    coverUrl: coverUrl || null,
  };
}

export function buildUpdateData(payload: BookPayload): Prisma.BookUpdateInput {
  const data: Prisma.BookUpdateInput = {};

  if (payload.title !== undefined) {
    const title = payload.title.trim();
    if (!title) {
      throw new Error('Titulo e obrigatorio.');
    }
    ensureMaxLength('Titulo', title, MAX_TITLE_LENGTH);
    data.title = title;
  }

  if (payload.author !== undefined) {
    const author = payload.author.trim();
    if (!author) {
      throw new Error('Autor e obrigatorio.');
    }
    ensureMaxLength('Autor', author, MAX_AUTHOR_LENGTH);
    data.author = author;
  }

  if (payload.description !== undefined) {
    const description = payload.description.trim();
    if (!description) {
      throw new Error('Descricao e obrigatoria.');
    }
    ensureMaxLength('Descricao', description, MAX_DESCRIPTION_LENGTH);
    data.description = description;
  }

  if (payload.publishedAt !== undefined) {
    data.publishedAt = parseRequiredDate(payload.publishedAt);
  }

  if (payload.content !== undefined) {
    const content = payload.content.trim();
    if (content) {
      ensureMaxLength('Conteudo', content, MAX_CONTENT_LENGTH);
    }
    data.content = content || null;
  }

  if (payload.coverUrl !== undefined) {
    const coverUrl = payload.coverUrl.trim();
    if (coverUrl) {
      ensureMaxLength('URL da capa', coverUrl, MAX_COVER_URL_LENGTH);
    }
    data.coverUrl = coverUrl || null;
  }

  return data;
}
