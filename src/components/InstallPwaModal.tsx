import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, ShieldCheck, Check } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already in standalone/PWA mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isApple);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-neutral-900" />
            <h3 className="text-base font-bold text-neutral-900">Pasang di HP (Aplikasi Mandiri)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-neutral-700">
          {/* Local Storage Assurance Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Data Tersimpan 100% di HP Anda (Lokal)</p>
              <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                Setiap data yang Anda catat disimpan langsung di memori HP masing-masing (Local Storage). Privasi terjaga, tidak butuh server luar, dan tetap tersimpan meski aplikasi ditutup atau tanpa koneksi internet.
              </p>
            </div>
          </div>

          {isStandalone ? (
            <div className="p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-neutral-900">Aplikasi Sudah Terpasang!</p>
              <p className="text-neutral-500">Anda sedang menggunakan KelolaUang dalam mode aplikasi mandiri.</p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3">
              <p className="font-semibold text-neutral-900 text-sm">
                Cara pasang di iPhone / iPad (Safari):
              </p>
              <ol className="space-y-2.5 list-decimal list-inside bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-neutral-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-neutral-900 shrink-0">1.</span>
                  <span>Buka halaman ini melalui browser <strong>Safari</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-neutral-900 shrink-0">2.</span>
                  <span>
                    Tekan tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-blue-600" /> di bilah navigasi bawah Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-neutral-900 shrink-0">3.</span>
                  <span>
                    Gulir ke bawah lalu pilih menu <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-neutral-700" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-neutral-900 shrink-0">4.</span>
                  <span>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di layar utama HP Anda.</span>
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            /* Android / Chrome Flow with native prompt */
            <div className="space-y-4">
              <p className="text-neutral-600 leading-relaxed">
                Pasang aplikasi langsung ke layar utama HP Anda untuk kemudahan akses cepat seperti aplikasi bawaan (Google Play / App Store) tanpa makan memori besar.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Aplikasi Sekarang</span>
              </button>
            </div>
          ) : (
            /* Android Chrome Manual Guide fallback */
            <div className="space-y-3">
              <p className="font-semibold text-neutral-900 text-sm">
                Cara pasang di Android (Google Chrome / Edge):
              </p>
              <ol className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-neutral-700 leading-relaxed">
                <li>1. Tekan ikon <strong>Titik Tiga (⋮)</strong> di sudut kanan atas browser Chrome.</li>
                <li>2. Pilih <strong>"Pasang aplikasi" (Install app)</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.</li>
                <li>3. Konfirmasi dengan menekan <strong>Pasang</strong>. Ikon KelolaUang akan siap di layar HP Anda.</li>
              </ol>
            </div>
          )}

          {installSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-center font-semibold">
              Aplikasi berhasil dipasang ke HP Anda! 🎉
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Dapat diakses offline kapan saja</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-neutral-700 hover:text-neutral-900 rounded"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
