export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string | null;
  publishedAt: string;
  coverUrl: string | null;
  createdAt: string;
}

export interface BookPayload {
  title: string;
  author: string;
  description: string;
  content?: string;
  publishedAt: string;
  coverUrl?: string;
}
