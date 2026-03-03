interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-[590px] rounded-3xl bg-zinc-100 px-6 py-7 shadow-2xl md:px-10 md:py-9">
        <h3 className="text-center text-[38px] font-bold leading-none text-zinc-900 md:text-[56px]">{title}</h3>
        <p className="mt-5 text-center text-[24px] leading-tight text-zinc-700 md:mt-7 md:text-[40px]">{message}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:gap-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full bg-zinc-300 py-3 text-[24px] font-medium text-zinc-800 transition hover:bg-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 md:py-4 md:text-[38px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full bg-red-700 py-3 text-[24px] font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 md:py-4 md:text-[38px]"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
