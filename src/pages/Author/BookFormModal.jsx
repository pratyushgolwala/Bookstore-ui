import { useState } from 'react';
import { X } from 'lucide-react';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';

/**
 * BookFormModal — create / edit a book entry in the author studio.
 * Controlled, self-contained form. Calls onSave(data) with validated fields.
 */
function BookFormModal({ initial, onClose, onSave }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    price: initial?.price ?? '',
    category: initial?.category || 'Fiction',
    isbn: initial?.isbn || '',
    stock: initial?.stock ?? 100,
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a valid price';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
    });
  };

  const categories = [
    'Fiction', 'Science', 'History', 'Fantasy',
    'Mystery', 'Philosophy', 'Poetry', 'Adventure',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          <h2 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
            {isEdit ? 'Edit Book' : 'Publish New Book'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.secondary }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="The title of your book"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="What is your book about?"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)" error={errors.price}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                style={inputStyle}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="ISBN">
              <input
                value={form.isbn}
                onChange={(e) => set('isbn', e.target.value)}
                placeholder="978-..."
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 py-4"
          style={{ borderTop: `1px solid ${COLORS.border}` }}
        >
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{isEdit ? 'Save Changes' : 'Publish'}</Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  backgroundColor: COLORS.surfaceLight,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text.primary,
  fontSize: '14px',
  outline: 'none',
};

function Field({ label, error, children }) {
  return (
    <div>
      <label
        className="text-xs uppercase tracking-wide block mb-1.5"
        style={{ color: COLORS.text.tertiary }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: COLORS.error }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default BookFormModal;
