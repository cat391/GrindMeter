import { useEffect, useRef, useState } from "react";

// Tracks whether content is hidden above or below a scrolling element
export default function useScrollEdges(watch) {
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ above: false, below: false });

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const update = () => {
      const above = element.scrollTop > 1;
      const below =
        element.scrollTop + element.clientHeight < element.scrollHeight - 1;
      setEdges((current) =>
        current.above === above && current.below === below
          ? current
          : { above, below }
      );
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    [...element.children].forEach((child) => observer.observe(child));
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [watch]);

  return { scrollRef, ...edges };
}
