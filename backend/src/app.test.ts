import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const { mockBookApi } = vi.hoisted(() => ({
  mockBookApi: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./lib/prisma.js', () => ({
  prisma: {
    book: mockBookApi,
  },
}));

function prismaNotFoundError() {
  return new Prisma.PrismaClientKnownRequestError('Not found', {
    clientVersion: 'test',
    code: 'P2025',
  });
}

describe('Book API', () => {
  let app: Awaited<typeof import('./app.js')>['app'];

  beforeAll(async () => {
    ({ app } = await import('./app.js'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('validates required fields on create', async () => {
    const response = await request(app).post('/books').send({
      title: '',
      author: '',
      description: '',
      publishedAt: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Titulo');
    expect(mockBookApi.create).not.toHaveBeenCalled();
  });

  it('rejects invalid publication date on create', async () => {
    const response = await request(app).post('/books').send({
      title: 'Livro com data invalida',
      author: 'Autor Teste',
      description: 'Descricao valida',
      publishedAt: '31-12-2025',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Data de publicacao invalida');
    expect(mockBookApi.create).not.toHaveBeenCalled();
  });

  it('rejects title longer than max length', async () => {
    const response = await request(app).post('/books').send({
      title: 'A'.repeat(181),
      author: 'Autor Teste',
      description: 'Descricao valida',
      publishedAt: '2025-12-31',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Titulo excedeu o limite');
    expect(mockBookApi.create).not.toHaveBeenCalled();
  });

  it('stores YYYY-MM-DD as UTC date without day drift', async () => {
    mockBookApi.create.mockImplementation(async ({ data }) => ({
      id: 'book-id',
      createdAt: new Date(),
      content: null,
      coverUrl: null,
      ...data,
    }));

    const response = await request(app).post('/books').send({
      title: 'Livro com data UTC',
      author: 'Autor Teste',
      description: 'Descricao valida',
      publishedAt: '1945-08-17',
    });

    expect(response.status).toBe(201);
    expect(mockBookApi.create).toHaveBeenCalledTimes(1);
    const firstCall = mockBookApi.create.mock.calls[0];
    expect(firstCall).toBeDefined();

    const createPayload = firstCall?.[0] as { data: { publishedAt: Date } };
    expect(createPayload.data.publishedAt.toISOString()).toBe('1945-08-17T00:00:00.000Z');
  });

  it('returns 404 when deleting an unknown book', async () => {
    mockBookApi.delete.mockRejectedValue(prismaNotFoundError());

    const response = await request(app).delete('/books/unknown-id');

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('nao encontrado');
  });
});
