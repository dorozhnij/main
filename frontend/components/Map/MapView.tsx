"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl from "maplibre-gl";
import type { FeatureCollection, MultiPolygon } from "geojson";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IdeaForm } from "./IdeaForm";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  lng: number;
  lat: number;
};

// Точные координаты Димитровграда из bbox
const BBOX_MIN_LNG = 49.358826;
const BBOX_MIN_LAT = 54.081951;
const BBOX_MAX_LNG = 49.86145;
const BBOX_MAX_LAT = 54.362958;

// Центр bbox
const CENTER_LNG = (BBOX_MIN_LNG + BBOX_MAX_LNG) / 2; // ~49.610
const CENTER_LAT = (BBOX_MIN_LAT + BBOX_MAX_LAT) / 2; // ~54.222
const CENTER: [number, number] = [CENTER_LNG, CENTER_LAT];
const DEFAULT_ZOOM = 12.5;

function isWithinBbox(lng: number, lat: number): boolean {
  return (
    lng >= BBOX_MIN_LNG &&
    lng <= BBOX_MAX_LNG &&
    lat >= BBOX_MIN_LAT &&
    lat <= BBOX_MAX_LAT
  );
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:4000"
    : "");

/** Акцентный цвет интерфейса и карты */
const ACCENT = "#077BBD";

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    positron: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO"
    }
  },
  layers: [
    {
      id: "positron",
      type: "raster" as const,
      source: "positron"
    }
  ]
};

/** Лоллипоп в списке боковой панели (как на карте: круг + стержень). */
function IdeaLollipopIcon({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 flex-col items-center self-start pt-0.5 ${className ?? ""}`}
      aria-hidden
    >
      <span className="size-4 shrink-0 rounded-full border-2 border-white bg-[#077BBD] shadow-md" />
      <span className="-mt-px h-3 w-0.5 shrink-0 rounded-sm bg-[#077BBD]" />
    </span>
  );
}

/** Лоллипоп-маркер: круг + стержень, якорь снизу у конца стержня */
function createIdeaLollipopElement(): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.pointerEvents = "auto";
  wrap.style.cursor = "pointer";

  const head = document.createElement("div");
  head.style.width = "16px";
  head.style.height = "16px";
  head.style.borderRadius = "50%";
  head.style.background = ACCENT;
  head.style.boxShadow = "0 2px 8px rgba(0,0,0,0.22)";
  head.style.border = "2px solid #ffffff";
  head.style.flexShrink = "0";

  const stem = document.createElement("div");
  stem.style.width = "3px";
  stem.style.height = "12px";
  stem.style.background = ACCENT;
  stem.style.borderRadius = "2px";
  stem.style.marginTop = "-1px";
  stem.style.flexShrink = "0";

  wrap.appendChild(head);
  wrap.appendChild(stem);
  return wrap;
}

function createPopupContent(idea: Idea): HTMLDivElement {
  const root = document.createElement("div");
  root.style.fontSize = "13px";
  root.style.maxWidth = "220px";
  root.style.color = "#111";
  root.style.background = "#fff";
  root.style.padding = "10px 12px";
  root.style.borderRadius = "16px";
  root.style.fontFamily = "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif";

  const titleEl = document.createElement("div");
  titleEl.style.fontWeight = "700";
  titleEl.style.color = "#111";
  titleEl.textContent = idea.title;
  root.appendChild(titleEl);

  if (idea.description) {
    const descriptionEl = document.createElement("div");
    descriptionEl.style.marginTop = "4px";
    descriptionEl.style.whiteSpace = "pre-wrap";
    descriptionEl.style.color = "#111";
    descriptionEl.textContent = idea.description;
    root.appendChild(descriptionEl);
  }

  return root;
}

type DmtrBorderGeoJson = FeatureCollection<MultiPolygon>;

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  // Ray casting; ring is array of [lng,lat]
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInMultiPolygon(
  lng: number,
  lat: number,
  coordinates: number[][][][]
): boolean {
  for (const polygon of coordinates) {
    const outer = polygon[0];
    if (!outer) continue;
    if (!pointInRing(lng, lat, outer)) continue;

    // Holes
    let inHole = false;
    for (let r = 1; r < polygon.length; r++) {
      if (pointInRing(lng, lat, polygon[r])) {
        inHole = true;
        break;
      }
    }
    if (!inHole) return true;
  }
  return false;
}

type MapViewProps = {
  id?: string;
  className?: string;
};

function ideasSubtitle(ideas: Idea[]): string {
  if (ideas.length === 0) return "Пока нет точек — предложите идею на карте";
  return `На карте: ${ideas.length}`;
}

function IdeasListHeader({ ideas }: { ideas: Idea[] }) {
  return (
    <div className="shrink-0 rounded-b-2xl border-b border-[#E0E0E0] bg-white px-3 py-2.5 shadow-sm">
      <p className="text-xs font-semibold text-[#333333]">Предложения жителей</p>
      <p className="mt-0.5 text-[11px] text-[#666666]">{ideasSubtitle(ideas)}</p>
    </div>
  );
}

function IdeasListItems({
  ideas,
  onSelect
}: {
  ideas: Idea[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
      {ideas.map((idea) => (
        <li key={idea.id}>
          <button
            type="button"
            onClick={() => onSelect(idea.id)}
            className="flex w-full gap-2.5 rounded-2xl border border-[#E0E0E0] bg-white p-3 text-left shadow-sm transition-colors hover:border-[#077BBD]/45 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#077BBD]"
          >
            <IdeaLollipopIcon />
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-sm font-semibold text-[#333333]">{idea.title}</span>
              {idea.description ? (
                <span className="mt-1 line-clamp-2 block text-xs leading-snug text-[#666666]">
                  {idea.description}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MapView({ id, className }: MapViewProps) {
  /** Родитель с position:relative — задает размер области карты (у absolute-контейнера MapLibre иначе бывает 0×0 до reflow). */
  const mapPaneRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const markersByIdRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const styleReadyRef = useRef(false);
  const addModeRef = useRef<"idle" | "picking" | "form">("idle");

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(
    null
  );
  const [addMode, setAddMode] = useState<"idle" | "picking" | "form">("idle");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mobileIdeasOpen, setMobileIdeasOpen] = useState(false);
  const borderRef = useRef<DmtrBorderGeoJson | null>(null);
  const [borderData, setBorderData] = useState<DmtrBorderGeoJson | null>(null);

  useEffect(() => {
    addModeRef.current = addMode;
  }, [addMode]);

  // Инициализация после layout: контейнер в потоке (flex-1), ResizeObserver + rAF — пока нет размера, карта не создается.
  useLayoutEffect(() => {
    if (mapRef.current) return;

    let cancelled = false;
    let ro: ResizeObserver | null = null;
    let raf = 0;
    let resizeBurst: ReturnType<typeof setInterval> | null = null;

    function destroyMap() {
      if (resizeBurst) {
        clearInterval(resizeBurst);
        resizeBurst = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      markersByIdRef.current.clear();
      styleReadyRef.current = false;
      setMapLoaded(false);
      mapRef.current?.remove();
      mapRef.current = null;
    }

    function tryCreate(): boolean {
      if (cancelled || mapRef.current) return true;
      const el = containerRef.current;
      if (!el) return false;
      const { width, height } = el.getBoundingClientRect();
      if (width < 8 || height < 8) return false;

      ro?.disconnect();
      ro = null;
      cancelAnimationFrame(raf);

      const map = new maplibregl.Map({
        container: el,
        style: MAP_STYLE,
        center: CENTER,
        zoom: DEFAULT_ZOOM,
        maxBounds: [
          [BBOX_MIN_LNG, BBOX_MIN_LAT],
          [BBOX_MAX_LNG, BBOX_MAX_LAT]
        ],
        trackResize: true
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        styleReadyRef.current = true;
        map.resize();
        requestAnimationFrame(() => {
          map.resize();
          requestAnimationFrame(() => map.resize());
        });
        let n = 0;
        resizeBurst = setInterval(() => {
          if (cancelled) {
            if (resizeBurst) clearInterval(resizeBurst);
            resizeBurst = null;
            return;
          }
          map.resize();
          n++;
          if (n >= 12) {
            if (resizeBurst) clearInterval(resizeBurst);
            resizeBurst = null;
          }
        }, 48);
        if (!cancelled) setMapLoaded(true);
      });

      map.on("click", (e) => {
        if (addModeRef.current === "idle") return;

        const { lng, lat } = e.lngLat;
        const bboxOk = isWithinBbox(lng, lat);
        const borderOk = borderRef.current
          ? pointInMultiPolygon(
              lng,
              lat,
              borderRef.current.features[0]?.geometry.coordinates ?? []
            )
          : true;

        if (!bboxOk || !borderOk) {
          setError(
            "Клик вне границ города Димитровград. Добавление идеи доступно только внутри границы."
          );
          setSelectedCoordinates(null);
          setAddMode("picking");
          return;
        }

        setError(null);
        setSelectedCoordinates([lng, lat]);
        setAddMode("form");
      });

      mapRef.current = map;
      return true;
    }

    const el = containerRef.current;
    if (el) {
      ro = new ResizeObserver(() => {
        if (!cancelled) tryCreate();
      });
      ro.observe(el);
    }

    if (!tryCreate()) {
      let ticks = 0;
      const loop = () => {
        if (cancelled || mapRef.current) return;
        if (tryCreate()) return;
        ticks++;
        if (ticks < 240) raf = requestAnimationFrame(loop);
        else tryCreate();
      };
      raf = requestAnimationFrame(loop);
    }

    const onWinLoad = () => mapRef.current?.resize();
    if (document.readyState === "complete") queueMicrotask(onWinLoad);
    else window.addEventListener("load", onWinLoad);

    return () => {
      cancelled = true;
      ro?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onWinLoad);
      destroyMap();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const el = containerRef.current;
    const pane = mapPaneRef.current;
    if (!map || !mapLoaded || !el) return;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    if (pane) ro.observe(pane);
    queueMicrotask(() => map.resize());
    return () => ro.disconnect();
  }, [mapLoaded]);

  useLayoutEffect(() => {
    mapRef.current?.resize();
  }, [mapLoaded, addMode]);

  // Загрузка границы (GeoJSON) и отрисовка слоев
  useEffect(() => {
    let cancelled = false;
    async function loadBorder() {
      try {
        const res = await fetch("/dimitrovgrad-border.geojson");
        if (!res.ok) return;
        const data = (await res.json()) as DmtrBorderGeoJson;
        if (cancelled) return;
        borderRef.current = data;
        setBorderData(data);
      } catch {
        // ignore
      }
    }
    loadBorder();
    return () => {
      cancelled = true;
    };
  }, []);

  // Применение границы к карте (после map.load)
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded) return;
    if (!map) return;
    if (!borderData) return;

    if (!map.getSource("dmtr_border")) {
      map.addSource("dmtr_border", { type: "geojson", data: borderData });
      map.addLayer({
        id: "dmtr_fill",
        type: "fill",
        source: "dmtr_border",
        paint: {
          "fill-color": "#F8604A",
          "fill-opacity": 0
        }
      });
      map.addLayer({
        id: "dmtr_line",
        type: "line",
        source: "dmtr_border",
        paint: {
          "line-color": ACCENT,
          "line-width": 2
        }
      });
    } else {
      const src = map.getSource("dmtr_border") as maplibregl.GeoJSONSource;
      src.setData(borderData);
    }
  }, [mapLoaded, borderData]);

  // Загрузка идей
  useEffect(() => {
    let cancelled = false;
    async function loadIdeas() {
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/ideas`);
        if (!res.ok) {
          throw new Error(`Failed to load ideas: ${res.status}`);
        }
        const data = (await res.json()) as { ideas: Idea[] };
        const filtered = data.ideas.filter((i) => {
          if (!isWithinBbox(i.lng, i.lat)) return false;
          if (!borderRef.current) return true;
          const coords = borderRef.current.features[0]?.geometry.coordinates ?? [];
          return pointInMultiPolygon(i.lng, i.lat, coords);
        });
        if (!cancelled) {
          setIdeas(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    loadIdeas();

    return () => {
      cancelled = true;
    };
  }, []);

  // Отрисовка маркеров
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    markersByIdRef.current.clear();

    ideas.forEach((idea) => {
      if (!isWithinBbox(idea.lng, idea.lat)) return;
      if (borderRef.current) {
        const coords = borderRef.current.features[0]?.geometry.coordinates ?? [];
        if (!pointInMultiPolygon(idea.lng, idea.lat, coords)) return;
      }

      const el = createIdeaLollipopElement();

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([idea.lng, idea.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 12, className: "dmtr-idea-popup" }).setDOMContent(
            createPopupContent(idea)
          )
        )
        .addTo(map);

      markersRef.current.push(marker);
      markersByIdRef.current.set(idea.id, marker);
    });
  }, [ideas, mapLoaded]);

  const focusIdeaOnMap = useCallback((ideaId: string) => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const marker = markersByIdRef.current.get(ideaId);
    if (!marker) return;
    const ll = marker.getLngLat();
    map.flyTo({
      center: [ll.lng, ll.lat],
      zoom: Math.max(map.getZoom(), 13.5),
      duration: 650
    });
    markersRef.current.forEach((m) => {
      if (m === marker) return;
      const p = m.getPopup();
      if (p?.isOpen()) m.togglePopup();
    });
    const targetPopup = marker.getPopup();
    if (targetPopup && !targetPopup.isOpen()) marker.togglePopup();
  }, [mapLoaded]);

  const selectIdeaFromList = useCallback(
    (ideaId: string) => {
      focusIdeaOnMap(ideaId);
      setMobileIdeasOpen(false);
    },
    [focusIdeaOnMap]
  );

  useEffect(() => {
    if (!mobileIdeasOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileIdeasOpen]);

  async function handleAddIdea(title: string, description: string) {
    if (!selectedCoordinates) return;
    const [lng, lat] = selectedCoordinates;
    if (!isWithinBbox(lng, lat)) {
      setError("Точка вне bbox — идея не будет добавлена.");
      return;
    }
    if (borderRef.current) {
      const coords = borderRef.current.features[0]?.geometry.coordinates ?? [];
      if (!pointInMultiPolygon(lng, lat, coords)) {
        setError("Точка вне границ города — идея не будет добавлена.");
        return;
      }
    }
    try {
      const res = await fetch(`${API_BASE}/api/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          location: { lng, lat }
        })
      });

      const payload = (await res.json().catch(() => null)) as
        | { idea?: Idea; error?: string }
        | null;

      if (!res.ok) {
        throw new Error(payload?.error ?? `Request failed with ${res.status}`);
      }

      const created = payload?.idea;
      if (created) {
        const nextIdea: Idea = {
          id: created.id,
          title: created.title,
          description: created.description,
          lng: created.lng,
          lat: created.lat
        };
        if (isWithinBbox(nextIdea.lng, nextIdea.lat)) {
          const coords = borderRef.current?.features[0]?.geometry.coordinates ?? [];
          const inside =
            !borderRef.current || pointInMultiPolygon(nextIdea.lng, nextIdea.lat, coords);
          if (inside) {
            setIdeas((prev) => {
              if (prev.some((i) => i.id === nextIdea.id)) return prev;
              return [nextIdea, ...prev];
            });
          }
        }
      }

      setError(null);
      setSelectedCoordinates(null);
      setAddMode("idle");

      const ideasRes = await fetch(`${API_BASE}/api/ideas`);
      if (ideasRes.ok) {
        const data = (await ideasRes.json()) as { ideas: Idea[] };
        const filtered = data.ideas.filter((i) => {
          if (!isWithinBbox(i.lng, i.lat)) return false;
          if (!borderRef.current) return true;
          const coords = borderRef.current.features[0]?.geometry.coordinates ?? [];
          return pointInMultiPolygon(i.lng, i.lat, coords);
        });
        setIdeas(filtered);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при добавлении идеи");
    }
  }

  const rootClass = className ?? "relative h-full w-full";

  return (
    <div
      id={id}
      className={`flex min-h-0 w-full flex-col overflow-hidden md:flex-row ${rootClass}`}
    >
      <aside className="hidden h-full min-h-0 w-72 shrink-0 flex-col border-r border-[#E0E0E0] bg-[#FAFAFA] md:flex">
        <IdeasListHeader ideas={ideas} />
        <IdeasListItems ideas={ideas} onSelect={selectIdeaFromList} />
      </aside>

      {mobileIdeasOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[48] bg-black/40 md:hidden"
            aria-label="Закрыть список предложений"
            onClick={() => setMobileIdeasOpen(false)}
          />
          <aside
            className="fixed bottom-0 left-0 right-0 z-[49] flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[#E0E0E0] bg-[#FAFAFA] shadow-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-ideas-title"
          >
            <div className="shrink-0 border-b border-[#E0E0E0] bg-white px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p id="mobile-ideas-title" className="text-sm font-semibold text-[#333333]">
                    Предложения жителей
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#666666]">{ideasSubtitle(ideas)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileIdeasOpen(false)}
                  className="shrink-0 rounded-full bg-[#F0F0F0] px-3 py-1.5 text-xs font-medium text-[#333333] hover:bg-[#E5E5E5]"
                >
                  Закрыть
                </button>
              </div>
            </div>
            <IdeasListItems ideas={ideas} onSelect={selectIdeaFromList} />
          </aside>
        </>
      ) : null}

      <div
        ref={mapPaneRef}
        className="relative flex min-h-[320px] flex-1 basis-0 flex-col overflow-hidden md:min-h-0"
      >
        <div
          ref={containerRef}
          className={`relative z-0 min-h-[280px] w-full flex-1 ${
            addMode === "picking" ? "cursor-crosshair" : ""
          }`}
        />

        <button
          type="button"
          onClick={() => setMobileIdeasOpen(true)}
          className="pointer-events-auto absolute left-3 top-3 z-20 rounded-full border border-[#E0E0E0] bg-white/95 px-3 py-2 text-xs font-semibold text-[#333333] shadow-md backdrop-blur md:hidden"
        >
          Предложения жителей
          {ideas.length > 0 ? (
            <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-[#077BBD] px-1 text-[10px] font-bold leading-5 text-white">
              {ideas.length > 99 ? "99+" : ideas.length}
            </span>
          ) : null}
        </button>

        {addMode === "idle" && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSelectedCoordinates(null);
                setAddMode("picking");
              }}
              className="pointer-events-auto rounded-full bg-[#077BBD] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#066199]"
            >
              Предложить идею
            </button>
          </div>
        )}

        {addMode === "picking" && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center p-4">
            <div className="pointer-events-auto max-w-md rounded-3xl border border-[#E0E0E0] bg-white/95 px-5 py-4 text-center text-sm leading-snug text-[#333333] shadow-lg backdrop-blur">
              <p>
                Кликните по карте внутри Димитровграда в место, где вы предлагаете идею
              </p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSelectedCoordinates(null);
                  setAddMode("idle");
                }}
                className="mt-4 rounded-2xl border border-[#E0E0E0] bg-white px-4 py-2 text-xs font-medium text-[#333333] hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {addMode === "form" && selectedCoordinates && (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-4">
            <div className="pointer-events-auto w-full max-w-[min(100%,400px)]">
              <IdeaForm
                coordinates={selectedCoordinates}
                onSubmit={handleAddIdea}
                onCancel={() => {
                  setSelectedCoordinates(null);
                  setAddMode("picking");
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10">
            <div className="pointer-events-auto inline-block max-w-full rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-2.5 text-xs text-red-800">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

