import { useEffect, useState, type RefObject } from "react";

export type ElementSize = {
  width: number;
  height: number;
};

export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observedElement = element;

    function update() {
      setSize({
        width: observedElement.clientWidth,
        height: observedElement.clientHeight,
      });
    }

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
