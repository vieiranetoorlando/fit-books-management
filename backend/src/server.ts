import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';

const app = express();

app.use(cors());
app.use(express.json());

// ROTA 1: Listar todos os livros (Página Inicial do Figma)
app.get('/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(books);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar livros" });
  }
});

// ROTA 2: Cadastrar novo livro (Modal do Figma)
app.post('/books', async (req, res) => {
  const { title, author, description, publishedAt, coverUrl } = req.body;

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        publishedAt: new Date(publishedAt),
        coverUrl
      }
    });
    return res.status(201).json(newBook);
  } catch (error) {
    return res.status(400).json({ error: "Erro ao cadastrar livro. Verifique os dados." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Back-end rodando em http://localhost:${PORT}`);
});