import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SavingsGoal } from '../types/finance';
import { formatNumber, parseRupiahInput, getTodayString } from '../utils/formatters';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
  onSave: (goalData: Omit<SavingsGoal, 'id'>, idToEdit?: string) => void;
}

const CATEGORIES = [
  'Dana Darurat',
  'Rumah & Properti',
  'Kendaraan',
  'Gadget & Elektronik',
  'Pendidikan',
  'Liburan & Wisata',
  'Ibadah / Qurban / Umroh',
  'Modal Usaha',
  'Lainnya',
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Dana Darurat');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmountStr(formatNumber(goalToEdit.targetAmount));
      setCurrentAmountStr(formatNumber(goalToEdit.currentAmount || 0));
      setTargetDate(goalToEdit.targetDate || getTodayString());
      setCategory(goalToEdit.category || 'Dana Darurat');
      setNotes(goalToEdit.notes || '');
    } else {
      setTitle('');
      setTargetAmountStr('');
      setCurrentAmountStr('0');
      setTargetDate('2026-12-31');
      setCategory('Dana Darurat');
      setNotes('');
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const numTarget = parseRupiahInput(targetAmountStr);
  const numCurrent = parseRupiahInput(currentAmountStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numTarget <= 0) return;

    onSave(
      {
        title: title.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        targetDate,
        category,
        color: '#059669',
        notes: notes.trim(),
      },
      goalToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">
            {goalToEdit ? 'Ubah Target Tabungan' : 'Buat Target Tabungan Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 font-semibold mb-1">
              Nama Impian / Target Tabungan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Dana Darurat Pribadi, DP Rumah, Beli Laptop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Target Sasaran (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={targetAmountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setTargetAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-sm font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Saldo Terkumpul (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={currentAmountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setCurrentAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-sm font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Kategori Tabungan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Target Tanggal Dicapai
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-600 font-semibold mb-1">
              Catatan / Motivasi Tambahan
            </label>
            <input
              type="text"
              placeholder="Contoh: Sisihkan Rp 500rb per bulan tiap gajian"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={numTarget <= 0 || !title.trim()}
              className="px-5 py-2 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {goalToEdit ? 'Simpan Perubahan' : 'Buat Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
