type Props = {
  children: React.ReactNode;
  className?: string;
};

export function SectionHeading({ children, className }: Props) {
  return (
    <div className={`mb-5 flex items-stretch gap-3 md:mb-7 md:gap-4 ${className ?? ""}`}>
      <span className="w-1.5 shrink-0 rounded-full bg-[#077BBD]" aria-hidden />
      <h2 className="min-h-[1.5em] text-2xl font-semibold leading-tight text-[#333333] md:text-3xl lg:text-4xl">
        {children}
      </h2>
    </div>
  );
}
