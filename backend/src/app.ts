import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from './lib/prisma.js';

export const app = express();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isImage = /^image\/(jpeg|png|webp|jpg)$/.test(file.mimetype);
    if (!isImage) {
      callback(new Error('Arquivo invalido. Envie apenas imagens JPG, PNG ou WEBP.'));
      return;
    }
    callback(null, true);
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

interface BookPayload {
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

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function ensureMaxLength(field: string, value: string, max: number) {
  if (value.length > max) {
    throw new Error(`${field} excedeu o limite de ${max} caracteres.`);
  }
}

function parseRequiredDate(value: string | undefined): Date {
  if (!value) {
    throw new Error('Data de publicacao e obrigatoria.');
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Data de publicacao invalida.');
  }

  return parsedDate;
}

function buildCreateData(payload: BookPayload): Prisma.BookCreateInput {
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

function buildUpdateData(payload: BookPayload): Prisma.BookUpdateInput {
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/uploads/cover', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const coverUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.status(201).json({ url: coverUrl });
  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return res.status(500).json({ error: 'Falha ao processar upload de imagem.' });
  }
});

app.get('/books', async (_req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(books);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return res.status(500).json({ error: 'Falha interna ao recuperar acervo.' });
  }
});

app.get('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      return res.status(404).json({ error: 'Livro nao localizado no acervo.' });
    }

    return res.json(book);
  } catch (error) {
    console.error(`Erro ao buscar livro ${id}:`, error);
    return res.status(500).json({ error: 'Erro na comunicacao com a base de dados.' });
  }
});

app.post('/books', async (req, res) => {
  const payload = req.body as BookPayload;

  try {
    const data = buildCreateData(payload);
    const newBook = await prisma.book.create({ data });
    return res.status(201).json(newBook);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Erro ao cadastrar livro:', error);
    return res.status(500).json({ error: 'Falha na persistencia dos dados.' });
  }
});

app.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body as BookPayload;

  try {
    const data = buildUpdateData(payload);
    const updatedBook = await prisma.book.update({
      where: { id },
      data,
    });
    return res.json(updatedBook);
  } catch (error) {
    if (error instanceof Error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({ error: 'Livro nao encontrado para atualizacao.' });
      }

      return res.status(400).json({ error: error.message });
    }

    console.error(`Erro ao atualizar livro ${id}:`, error);
    return res.status(500).json({ error: 'Nao foi possivel atualizar o registro.' });
  }
});

app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.book.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      return res.status(404).json({ error: 'Livro nao encontrado para exclusao.' });
    }

    console.error(`Erro ao excluir livro ${id}:`, error);
    return res.status(500).json({ error: 'Falha ao remover o registro.' });
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Imagem muito grande. Maximo permitido: 5MB.' });
  }

  if (error instanceof Error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: 'Erro inesperado.' });
});
