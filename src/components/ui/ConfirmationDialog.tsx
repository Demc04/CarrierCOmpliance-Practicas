import { useRef, type ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  // El foco inicial va a "Cancelar" para evitar confirmaciones accidentales.
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Modal
      open={open}
      role="alertdialog"
      title={title}
      description={message}
      onClose={onCancel}
      initialFocusRef={cancelRef}
      footer={
        <>
          <button ref={cancelRef} type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
