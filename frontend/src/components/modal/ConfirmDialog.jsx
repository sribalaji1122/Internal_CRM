import React from 'react';
import Modal from './Modal';
import PrimaryButton from '../buttons/PrimaryButton';
import OutlineButton from '../buttons/OutlineButton';
import DangerButton from '../buttons/DangerButton';

/**
 * Reusable confirmation dialog.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {function} props.onConfirm
 * @param {string} props.title - Heading title.
 * @param {string} props.message - Descriptive text.
 * @param {string} [props.confirmText] - Label for confirm button.
 * @param {string} [props.cancelText] - Label for cancel button.
 * @param {boolean} [props.loading] - Shows spinner on the confirm button when true.
 * @param {string} [props.variant] - 'danger' | 'primary'
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'primary'
}) {
  const renderConfirmButton = () => {
    if (variant === 'danger') {
      return (
        <DangerButton onClick={onConfirm} loading={loading}>
          {confirmText}
        </DangerButton>
      );
    }
    return (
      <PrimaryButton onClick={onConfirm} loading={loading}>
        {confirmText}
      </PrimaryButton>
    );
  };

  const footer = (
    <>
      <OutlineButton onClick={onClose} disabled={loading}>
        {cancelText}
      </OutlineButton>
      {renderConfirmButton()}
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
      <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
    </Modal>
  );
}
