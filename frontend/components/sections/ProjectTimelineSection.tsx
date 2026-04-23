import { SectionHeading } from "@/components/SectionHeading";
import { RevealSection } from "@/components/RevealSection";

const STEPS = [
  {
    period: "Апрель–Май 2026",
    description: "Проведение стратегической сессии"
  },
  {
    period: "Июль 2026",
    description: "Первый этап работы, содержащий оценку территории"
  },
  {
    period: "Август–Ноябрь 26",
    description: "Детализация проектных решений"
  },
  {
    period: "Декабрь 26",
    description: "Представление проекта мастер-плана Димитровграда"
  }
] as const;

export function ProjectTimelineSection() {
  return (
    <section className="relative z-10 w-full bg-white">
      <div className="section-wrap">
      <RevealSection>
        <SectionHeading>График проекта</SectionHeading>
        <ol className="mx-auto max-w-2xl list-none space-y-0 pl-0">
          {STEPS.map((step, index) => {
            const n = String(index + 1).padStart(2, "0");
            return (
              <li key={step.period} className="flex gap-4 md:gap-6">
                <div className="flex w-4 shrink-0 flex-col items-center pt-1 md:w-5 md:pt-1.5">
                  <span
                    className="z-[1] size-3 shrink-0 rounded-full bg-[#077BBD] ring-4 ring-white"
                    aria-hidden
                  />
                  {index < STEPS.length - 1 ? (
                    <span
                      className="mt-2 w-0.5 flex-1 min-h-[4.5rem] bg-[#077BBD] md:min-h-[5.5rem]"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div
                  className={`min-w-0 flex-1 ${index < STEPS.length - 1 ? "pb-8 md:pb-10" : ""}`}
                >
                  <p className="text-3xl font-semibold tabular-nums leading-none text-[#077BBD] md:text-4xl">
                    {n}
                  </p>
                  <p className="mt-3 text-base font-medium text-[#333333] md:text-lg">
                    {step.period}
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-[#666666] md:text-lg">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </RevealSection>
      </div>
    </section>
  );
}
