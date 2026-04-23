import Script from "next/script";
import { HeroFlashlightOverlay } from "@/components/HeroFlashlightOverlay";
import { MapView as InteractiveMap } from "@/components/Map/MapView";
import { RevealSection } from "@/components/RevealSection";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectTimelineSection } from "@/components/sections/ProjectTimelineSection";
import {
  IconBlueprint,
  IconCard,
  IconChart,
  IconCheckDoc,
  IconCollect,
  IconComfort,
  IconFastForward,
  IconForum,
  IconHome,
  IconLayers,
  IconMapPin,
  IconShield,
  IconTrendUp
} from "@/components/icons/sectionIcons";

const CONTACT_EMAIL = "itp.urbanika@yandex.ru";

const PARTICIPATION = [
  { icon: IconMapPin, text: "Какие территории требуют первоочередного внимания" },
  { icon: IconHome, text: "Какие решения улучшают качество жизни в вашем районе" },
  { icon: IconLayers, text: "Какие проекты должны войти в стратегию развития" }
] as const;

const RESULTS = [
  { icon: IconCollect, text: "Сбор идеи жителей на карте и в анкете" },
  { icon: IconChart, text: "Анализ предложений и выявление приоритетов" },
  { icon: IconBlueprint, text: "Формирование проектных направлений мастер-плана" },
  { icon: IconForum, text: "Обсуждение решений с экспертами и жителями" },
  { icon: IconCheckDoc, text: "Включение согласованных решений в итоговый документ" }
] as const;

const WHY_NOW = [
  { icon: IconTrendUp, text: "Мастер-план определяет вектор развития города на годы вперед" },
  { icon: IconComfort, text: "Решения сегодня влияют на комфорт, доступность и безопасность" },
  { icon: IconShield, text: "Участие жителей снижает риск неэффективных проектов" },
  { icon: IconFastForward, text: "Согласованные приоритеты ускоряют реализацию инициатив" }
] as const;

const PARTNERS = [
  { name: "Урбаника", href: "https://www.urbanica.spb.ru/", logoSrc: "/partners/urbanika.png" },
  {
    name: "Правительство Ульяновской области",
    href: "https://ulgov.gosuslugi.ru/",
    logoSrc: "/partners/ulianovsk.png"
  },
  {
    name: "Правительство Димитровграда",
    href: "https://dimitrovgrad.gosuslugi.ru/",
    logoSrc: "/partners/dimitrovo.png"
  },
  { name: "Росатом", href: "https://rosatom.ru/index.html", logoSrc: "/partners/rosatom.png" },
  { name: "Студия Андрея Дорожного", href: "https://dorozhnij.com/", logoSrc: "/partners/dorozhnij.png" }
] as const;

const surfaceOuter = "relative z-10 w-full bg-white";
const surfaceSoftOuter = "relative z-10 w-full bg-[#FAFAFA]";

export default function Page() {
  return (
    <main className="relative min-h-screen bg-white text-[#333333]">
      <section
        id="landing-hero"
        className="relative z-20 min-h-screen overflow-hidden bg-center bg-cover md:bg-fixed"
        style={{ backgroundImage: "url('/hero-dimitrovgrad.png')" }}
      >
        <HeroFlashlightOverlay />
        <div className="section-wrap pointer-events-none relative z-10 flex min-h-screen items-center justify-center text-center">
          <h1 className="mb-4 text-3xl font-semibold text-white md:mb-6 md:text-4xl lg:text-5xl">
            Поделитесь идеями о том, как сделать Димитровград лучше
          </h1>
        </div>
      </section>

      <section className={surfaceOuter}>
          <div className="section-wrap text-center">
            <RevealSection>
              <p className="mx-auto mb-6 max-w-prose text-base leading-relaxed text-[#333333] md:text-lg">
                Вы находитесь на платформе разработки стратегии развития Димитровграда. Здесь
                можно оставить идею на карте и пройти опрос, чтобы повлиять на приоритеты
                мастер-плана
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a href="#map-section" className="btn btn--accent">
                  Карта идей
                </a>
                <a href="#survey-section" className="btn btn--secondary">
                  Пройти опрос
                </a>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className={surfaceSoftOuter}>
          <div className="section-wrap">
            <RevealSection>
              <div className="rounded-3xl bg-[#077BBD] px-6 py-7 text-white shadow-lg md:px-8 md:py-9">
                <h2 className="text-2xl font-semibold md:text-4xl">Что такое мастер-план?</h2>
                <p className="mt-3 max-w-4xl text-lg leading-relaxed text-white md:text-2xl">
                  Мастер-план — это долгосрочный план развития территории, который определяет,
                  как будет развиваться городская среда, общественные пространства, транспорт,
                  экономика и социальная инфраструктура.
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <ProjectTimelineSection />

        <section className={surfaceOuter}>
          <div className="section-wrap">
            <RevealSection>
              <SectionHeading>Ваше участие — важно, потому что оно определяет</SectionHeading>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {PARTICIPATION.map(({ icon, text }) => (
                  <IconCard key={text} icon={icon}>
                    {text}
                  </IconCard>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        <section className={surfaceSoftOuter}>
          <div className="section-wrap">
            <RevealSection>
              <SectionHeading>Предложите свою идею на карте</SectionHeading>
              <p className="max-w-prose text-base leading-relaxed text-[#333333] md:text-lg">
                Отметьте точку на карте, напишите проблему или идею и оставьте комментарий. Мы
                соберем предложения и учтем их в разработке мастер-плана.
              </p>
              <InteractiveMap
                id="map-section"
                className="relative mt-6 flex min-h-[420px] h-[60vh] w-full overflow-hidden rounded-3xl border border-[#E0E0E0] bg-white shadow-sm sm:h-[700px]"
              />
            </RevealSection>
          </div>
        </section>

        <section className={surfaceOuter} id="survey-section">
          <div className="section-wrap">
            <RevealSection>
              <SectionHeading>Заполните анкету</SectionHeading>
              <p className="max-w-prose text-base leading-relaxed text-[#333333] md:text-lg">
                Заполнение анкеты займет около 15-20 минут и поможет точнее определить
                приоритеты развития
              </p>
              <div className="mt-6">
                <div
                  id="anketolog-frame-1023715"
                  className="mx-auto w-full max-w-3xl min-h-[78svh] overflow-hidden rounded-3xl border border-[#E0E0E0] bg-white shadow-sm md:min-h-0 md:aspect-video"
                />
                <Script id="anketolog-loader" strategy="afterInteractive">
                  {`(function(d){var u='https://anketolog.ru/api/v2/frame/js/1023715?token=KWkW5HDD';var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src=u;d.body.appendChild(s);})(document);`}
                </Script>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className={surfaceSoftOuter}>
          <div className="section-wrap">
            <RevealSection>
              <SectionHeading>Как будут использоваться результаты</SectionHeading>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {RESULTS.map(({ icon, text }) => (
                  <IconCard key={text} icon={icon}>
                    {text}
                  </IconCard>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        <section className={surfaceOuter}>
          <div className="section-wrap">
            <RevealSection>
              <div className="why-now-wrap">
                <div className="why-now-heading-block">
                  <h2 className="why-now-heading">Почему это важно сейчас</h2>
                  <p className="why-now-subtitle">
                    Эти приоритеты напрямую влияют на качество жизни в городе уже сегодня и
                    формируют основу решений на годы вперед.
                  </p>
                </div>
                <div className="why-now-grid">
                  {WHY_NOW.map(({ icon, text }) => (
                    <article key={text} className="why-now-card">
                      <IconCard icon={icon}>{text}</IconCard>
                    </article>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className={surfaceSoftOuter}>
          <div className="section-wrap">
            <RevealSection>
              <SectionHeading>Остались вопросы?</SectionHeading>
              <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn--link">
                Свяжитесь с нами
              </a>
            </RevealSection>
          </div>
        </section>

        <section className="relative z-10 w-full bg-[#077BBD] py-10 md:py-14">
          <div className="section-wrap">
            <RevealSection>
              <div className="rounded-3xl bg-white p-6 shadow-xl md:p-10">
                <ul className="flex flex-wrap items-stretch justify-center gap-4 md:gap-6">
                  {PARTNERS.map(({ name, href, logoSrc }) => (
                    <li key={name} className="flex min-w-[140px] max-w-[220px] flex-1 basis-[calc(50%-0.5rem)] sm:basis-[180px]">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-5 shadow-sm transition-shadow hover:border-[#077BBD]/30 hover:shadow-md md:min-h-[5.5rem] md:px-5"
                        aria-label={name}
                      >
                        <img
                          src={logoSrc}
                          alt={name}
                          className="h-12 w-auto object-contain md:h-14"
                          loading="lazy"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>
          </div>
        </section>

        <footer className="relative z-10 border-t border-[#E0E0E0] bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-[#666666] sm:px-6 md:px-8 md:text-base">
            <p className="max-w-prose">
              Контакты:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#077BBD] underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </footer>
    </main>
  );
}
