import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Shared mobile menu controller for the public and admin hamburger menus.
 *
 * It owns open state, focus trap, Escape close, outside-click close,
 * body scroll lock, and close-on-route-change behavior. Attach `menuRef`
 * to the collapsible menu container and `toggleRef` to the hamburger button.
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    previousPathRef.current = location.pathname;
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointer(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab" && menuRef.current) {
        trapFocus(event, menuRef.current);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const first = menuRef.current?.querySelector<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled])",
      );
      first?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return { isOpen, menuRef, setIsOpen, toggleRef } as const;
}

function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.tabIndex !== -1);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export default useMobileMenu;
