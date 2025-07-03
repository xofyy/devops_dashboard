import { useState, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom";
}

export default function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | undefined>(undefined);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timeout = useRef<number | null>(null);

  const show = () => {
    timeout.current = window.setTimeout(() => setOpen(true), 100);
  };
  const hide = () => {
    if (timeout.current) window.clearTimeout(timeout.current);
    setOpen(false);
    setCoords(undefined);
  };

  useLayoutEffect(() => {
    if (open && tooltipRef.current && wrapperRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      let left = wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;
      // Sağdan taşarsa sağa kaydır
      if (left + tooltipRect.width > windowWidth - 8) {
        left = windowWidth - tooltipRect.width - 8;
      }
      // Soldan taşarsa sola kaydır
      if (left < 8) {
        left = 8;
      }
      let top = 0;
      if (position === "top") {
        top = wrapperRect.top - tooltipRect.height - 8;
      } else {
        top = wrapperRect.bottom + 8;
      }
      setCoords({ left, top });
    }
  }, [open, content, position]);

  return (
    <span
      className="relative inline-block focus-within:z-50"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      ref={wrapperRef}
    >
      {children}
      {open && coords && ReactDOM.createPortal(
        <span
          ref={tooltipRef}
          className={`fixed z-[9999] whitespace-nowrap px-3 py-1.5 rounded-xl shadow-lg text-sm font-semibold transition-all duration-200
            bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900
            opacity-90 animate-fade-in pointer-events-none
          `}
          style={{ left: coords.left, top: coords.top }}
          role="tooltip"
        >
          {content}
        </span>,
        document.body
      )}
    </span>
  );
}