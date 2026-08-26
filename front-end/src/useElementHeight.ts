import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures the rendered height of an element via ResizeObserver, so it stays
 * accurate across font-size/media-query changes and content reflow.
 * Used to stack multiple sticky table header rows without overlap.
 */
export function useElementHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setHeight(el.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, height] as const;
}
