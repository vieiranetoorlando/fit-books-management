import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from './lib/prisma.js';
import { buildCreateData, buildUpdateData, isNotFoundError, type BookPayload } from './domain/bookValidation.js';

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
