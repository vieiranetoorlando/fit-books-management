import { CalendarDays, Image as ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { uploadBookCover } from '../services/bookService';
import type { Book, BookPayload } from '../types/book';

interface BookFormModalProps {
  isSaving: boolean;
  bookToEdit: Book | null;
  onClose: () => void;
  onSubmit: (payload: BookPayload) => Promise<void>;
}

interface FormState {
  title: string;
  author: string;
  description: string;
  publishedAt: string;
  coverUrl: string;
}

const TITLE_MAX_LENGTH = 180;
const AUTHOR_MAX_LENGTH = 140;
const DESCRIPTION_MAX_LENGTH = 4000;

const emptyForm: FormState = {
  title: '',
  author: '',
  description: '',
  publishedAt: '',
  coverUrl: '',
};

function toDisplayDate(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

function toIsoDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return '';
  }

  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${year}-${month}-${day}`;
}

function buildForm(bookToEdit: Book | null): FormState {
  if (!bookToEdit) {
    return emptyForm;
  }

  return {
    title: bookToEdit.title,
    author: bookToEdit.author,
    description: bookToEdit.description,
    publishedAt: toDisplayDate(bookToEdit.publishedAt),
    coverUrl: bookToEdit.coverUrl ?? '',
  };
}

export function BookFormModal({ isSaving, bookToEdit, onClose, onSubmit }: BookFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildForm(bookToEdit));
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const hasCover = Boolean(form.coverUrl.trim()) && !previewFailed;

  useEffect(() => {
    setPreviewFailed(false);
  }, [form.coverUrl]);

  useEffect(() => {
    titleInputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSaving, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.author.trim() || !form.description.trim() || !form.publishedAt.trim()) {
      setError('Preencha os campos obrigatorios: titulo, autor, descricao e data de publicacao.');
      return;
    }

    const isoDate = toIsoDate(form.publishedAt);
    if (!isoDate) {
      setError('A data deve estar no formato dd/mm/aaaa.');
      return;
    }

    await onSubmit({
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      publishedAt: isoDate,
      coverUrl: form.coverUrl.trim() || undefined,
    });
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const uploadedUrl = await uploadBookCover(selectedFile);
      setForm((prev) => ({ ...prev, coverUrl: uploadedUrl }));
      setImageMode('file');
    } catch (uploadError) {
      console.error('Erro ao enviar imagem:', uploadError);
      setError('Falha no upload da imagem. Use JPG/PNG/WEBP com ate 5MB.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-black/45 p-3 md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-form-modal-title"
        className="mx-auto my-2 w-full max-w-[780px] rounded-[22px] bg-zinc-300 p-4 shadow-2xl md:my-4 md:max-h-[92vh] md:overflow-y-auto md:p-10"
      >
        <h2 id="book-form-modal-title" className="mb-7 text-center text-[34px] font-bold text-zinc-900 md:text-[52px]">
          {bookToEdit ? 'Editar livro' : 'Novo livro'}
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-[1fr_238px] md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <input
                ref={titleInputRef}
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Titulo"
                maxLength={TITLE_MAX_LENGTH}
                className="h-[54px] w-full rounded-2xl bg-zinc-100 px-4 text-[18px] text-zinc-800 outline-none placeholder:text-zinc-500 md:h-[56px] md:text-[24px]"
              />

              <input
                type="text"
                value={form.author}
                onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                placeholder="Autor"
                maxLength={AUTHOR_MAX_LENGTH}
                className="h-[54px] w-full rounded-2xl bg-zinc-100 px-4 text-[18px] text-zinc-800 outline-none placeholder:text-zinc-500 md:h-[56px] md:text-[24px]"
              />

              <div className="relative">
                <input
                  type="text"
                  value={form.publishedAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  placeholder="Data de publicacao"
                  className="h-[54px] w-full rounded-2xl bg-zinc-100 px-4 pr-12 text-[18px] text-zinc-800 outline-none placeholder:text-zinc-500 md:h-[56px] md:text-[24px]"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700" size={30} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-200 p-1">
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`h-10 rounded-lg text-[14px] font-semibold ${
                    imageMode === 'file' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600'
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`h-10 rounded-lg text-[14px] font-semibold ${
                    imageMode === 'url' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600'
                  }`}
                >
                  URL
                </button>
              </div>

              <label className="flex h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-zinc-200 px-4 text-center text-zinc-600 transition hover:bg-zinc-100">
                {hasCover ? (
                  <img
                    src={form.coverUrl}
                    alt="Preview da capa"
                    className="h-[160px] w-[112px] rounded-sm object-cover"
                    onError={() => setPreviewFailed(true)}
                  />
                ) : (
                  <>
                    <ImageIcon size={56} className="mb-4" />
                    <span className="text-[18px] leading-tight">{isUploading ? 'Enviando imagem...' : 'Escolher imagem'}</span>
                    <span className="mt-1 text-[13px] text-zinc-500">Imagem selecionada</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleCoverUpload}
                  disabled={isUploading || imageMode === 'url'}
                />
              </label>

              {imageMode === 'url' && (
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
                  placeholder="https://..."
                  className="h-[44px] w-full rounded-xl bg-zinc-100 px-3 text-[14px] text-zinc-800 outline-none"
                />
              )}
            </div>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descricao"
            rows={7}
            maxLength={DESCRIPTION_MAX_LENGTH}
            className="min-h-[190px] w-full rounded-2xl bg-zinc-100 px-4 py-4 text-[18px] leading-tight text-zinc-800 outline-none md:min-h-[220px] md:text-[22px]"
          />
          <p className="text-right text-[12px] text-zinc-500 md:text-[14px]">
            {form.description.length}/{DESCRIPTION_MAX_LENGTH}
          </p>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[15px] text-red-700 md:text-[18px]">{error}</p>}

          <div className="pt-1">
            <div className="mx-auto grid max-w-[540px] grid-cols-2 gap-4 md:gap-8">
              <button
                type="button"
                onClick={onClose}
                className="h-[52px] rounded-full bg-zinc-200 text-[18px] font-medium text-zinc-800 transition hover:bg-zinc-100 md:h-[60px] md:text-[22px]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="h-[52px] rounded-full bg-sky-500 text-[18px] font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 md:h-[60px] md:text-[22px]"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
