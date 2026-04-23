"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dmtr_cookie_consent_v1";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[#E0E0E0] bg-white/95 shadow-lg backdrop-blur">
        <div className="mx-auto flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-[#333333]">
            Мы используем файлы cookie для работы сайта, аналитики (Яндекс.Метрика) и
            интеграции внешних сервисов (Anketolog).{" "}
            <Link href="/privacy" className="text-[#077BBD] underline hover:no-underline">
              Политика конфиденциальности
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem(STORAGE_KEY, "accepted");
              setVisible(false);
            }}
            className="btn btn--accent whitespace-nowrap"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

