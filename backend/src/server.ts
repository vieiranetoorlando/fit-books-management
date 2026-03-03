import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';

const app = express();

app.use(cors());
app.use(express.json());

// Listagem de livros com ordenacao cronologica inversa
app.get('/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(books);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return res.status(500).json({ error: "Falha interna ao recuperar acervo" });
  }
});

// Busca detalhada por ID com validacao de existencia
app.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: "Livro nao localizado no acervo" });
    }
    return res.json(book);
  } catch (error) {
    console.error(`Erro ao buscar livro ${id}:`, error);
    return res.status(500).json({ error: "Erro na comunicacao com a base de dados" });
  }
});

// Cadastro de novo livro com tratamento de data
app.post('/books', async (req, res) => {
  const { title, author, description, publishedAt, coverUrl, content } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes" });
  }

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        publishedAt: new Date(publishedAt),
        coverUrl,
        content
      }
    });
    return res.status(201).json(newBook);
  } catch (error) {
    console.error('Erro ao cadastrar livro:', error);
    return res.status(400).json({ error: "Falha na persistencia dos dados. Verifique o formato." });
  }
});

// Atualizacao parcial ou total de um registro
app.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined
      }
    });
    return res.json(updatedBook);
  } catch (error) {
    console.error(`Erro ao atualizar livro ${id}:`, error);
    return res.status(400).json({ error: "Nao foi possivel atualizar o registro" });
  }
});

// Remocao definitiva de registro
app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.book.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error(`Erro ao excluir livro ${id}:`, error);
    return res.status(400).json({ error: "Falha ao remover o registro ou ID inexistente" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor operacional na porta ${PORT}`);
});