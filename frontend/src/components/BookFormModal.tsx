import { Image as ImageIcon } from 'lucide-react';
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
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (uploadError) {
      console.error('Erro ao enviar imagem:', uploadError);
      setError('Falha no upload da imagem. Use JPG/PNG/WEBP com ate 5MB.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  function openImageSourceModal() {
    setError(null);
    setUrlInput(form.coverUrl.trim());
    setIsImageSourceModalOpen(true);
  }

  function applyCoverUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Informe uma URL valida para a capa.');
      return;
    }

    setForm((prev) => ({ ...prev, coverUrl: trimmed }));
    setPreviewFailed(false);
    setIsImageSourceModalOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-black/45 p-3 md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-form-modal-title"
        className="mx-auto my-2 w-full max-w-[780px] rounded-[22px] bg-[#f0f0f0] p-4 shadow-2xl md:my-4 md:max-h-[92vh] md:overflow-y-auto md:p-8"
      >
        <h2 id="book-form-modal-title" className="mb-7 text-center text-[34px] font-semibold text-zinc-900 md:text-[46px]">
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
                className="h-[54px] w-full rounded-2xl bg-white px-4 text-[18px] text-zinc-800 outline-none placeholder:text-zinc-500 md:h-[56px] md:text-[20px]"
              />

              <input
                type="text"
                value={form.author}
                onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                placeholder="Autor"
                maxLength={AUTHOR_MAX_LENGTH}
                className="h-[54px] w-full rounded-2xl bg-white px-4 text-[18px] text-zinc-800 outline-none placeholder:text-zinc-500 md:h-[56px] md:text-[20px]"
              />

              <input
                type="text"
                value={form.publishedAt}
                onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                placeholder="Data de publicacao"
                className="h-[54px] w-full rounded-2xl bg-white px-4 text-[18px] text-zinc-800 outline-none placeholder:text-zinc-500 md:h-[56px] md:text-[20px]"
              />
            </div>

            <div className="space-y-3">
              <div
                onClick={openImageSourceModal}
                className="flex h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#d2d1d7] px-4 text-center text-zinc-600 transition hover:bg-[#cccbd1]"
              >
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
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descricao"
            rows={7}
            maxLength={DESCRIPTION_MAX_LENGTH}
            className="min-h-[190px] w-full rounded-2xl bg-white px-4 py-4 text-[18px] leading-tight text-zinc-800 outline-none md:min-h-[220px] md:text-[20px]"
          />

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[15px] text-red-700 md:text-[18px]">{error}</p>}

          <div className="pt-1">
            <div className="mx-auto grid max-w-[540px] grid-cols-2 gap-4 md:gap-8">
              <button
                type="button"
                onClick={onClose}
                className="h-[52px] rounded-full bg-zinc-200 text-[18px] font-medium text-zinc-800 transition hover:bg-zinc-100 md:h-[60px] md:text-[20px]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="h-[52px] rounded-full bg-sky-500 text-[18px] font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 md:h-[60px] md:text-[20px]"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isImageSourceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl md:p-6">
            <h3 className="mb-4 text-center text-[24px] font-semibold text-zinc-900">Adicionar capa</h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setIsImageSourceModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="h-[48px] w-full rounded-xl bg-zinc-100 text-[16px] font-medium text-zinc-900 transition hover:bg-zinc-200"
              >
                Selecionar arquivo local
              </button>

              <input
                type="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://..."
                className="h-[46px] w-full rounded-xl border border-zinc-200 bg-white px-3 text-[14px] text-zinc-800 outline-none"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsImageSourceModalOpen(false)}
                  className="h-[46px] rounded-xl bg-zinc-200 text-[15px] font-medium text-zinc-800 transition hover:bg-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={applyCoverUrl}
                  className="h-[46px] rounded-xl bg-sky-500 text-[15px] font-medium text-white transition hover:bg-sky-600"
                >
                  Usar URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
