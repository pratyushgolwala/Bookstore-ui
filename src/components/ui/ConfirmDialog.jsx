import { AlertTriangle, X } from 'lucide-react';
import COLORS from '../../constants/colors';
import './ConfirmDialog.css';

/**
 * ConfirmDialog — themed confirmation modal that replaces window.confirm.
 *
 * Props:
 *   open        : boolean — whether the dialog is visible
 *   title       : string  — heading text
 *   message     : string  — body text
 *   confirmText : string  — confirm button label (default "Delete")
 *   cancelText  : string  — cancel button label (default "Cancel")
 *   danger      : boolean — red styling for destructive actions (default true)
 *   onConfirm   : fn       — called when user confirms
 *   onCancel    : fn       — called when user cancels / closes
 */
function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const accent = danger ? COLORS.error : COLORS.primary[500];

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-card"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <button className="confirm-close" onClick={onCancel} style={{ color: COLORS.text.tertiary }}>
          <X size={18} />
        </button>

        <div className="confirm-icon" style={{ background: `${accent}1f`, color: accent }}>
          <AlertTriangle size={26} />
        </div>

        <h3 className="confirm-title" style={{ color: COLORS.text.primary }}>{title}</h3>
        {message && <p className="confirm-message" style={{ color: COLORS.text.secondary }}>{message}</p>}

        <div className="confirm-actions">
          <button
            className="confirm-cancel-btn"
            onClick={onCancel}
            style={{ color: COLORS.text.secondary, borderColor: COLORS.border }}
          >
            {cancelText}
          </button>
          <button
            className="confirm-ok-btn"
            onClick={onConfirm}
            style={{ background: accent }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
