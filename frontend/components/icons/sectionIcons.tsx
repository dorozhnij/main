import type { ComponentType, ReactNode } from "react";

const iconClass = "size-6 text-[var(--color-accent)]";

export function IconMapPin() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconHome() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconLayers() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L2 7l10 5 9-4.5L12 2zm0 7.5L2 14l10 5 9-4.5L12 9.5zm0 7.5L2 21l10 5 9-4.5L12 17z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCollect() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z"
        fill="currentColor"
      />
      <circle cx="18" cy="16" r="3" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function IconChart() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" />
      <path d="M7 14l4-4 4 4 6-8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function IconBlueprint() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path d="M14 2v6h6M8 13h8M8 17h6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconForum() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function IconCheckDoc() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/** Долгосрочный вектор / рост (мастер-план на годы вперед) */
export function IconTrendUp() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14l4-4 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 6h4v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconComfort() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/** Ускорение реализации (приоритеты → быстрее внедрение) */
export function IconFastForward() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5v14l7-7-7-7zm9 0v14l7-7-7-7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCard({
  icon: Icon,
  children
}: {
  icon: ComponentType;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#E0E0E0] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[#077BBD]/10">
        <Icon />
      </div>
      <p className="mb-0 text-base leading-relaxed text-[#333333] md:text-lg">{children}</p>
    </div>
  );
}

export function IconCardMuted({
  icon: Icon,
  children
}: {
  icon: ComponentType;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#E0E0E0] bg-[#FAFAFA] p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[#077BBD]/10">
        <Icon />
      </div>
      <p className="mb-0 text-base leading-relaxed text-[#333333] md:text-lg">{children}</p>
    </div>
  );
}
