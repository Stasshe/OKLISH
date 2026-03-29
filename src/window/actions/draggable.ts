export interface DraggableParams {
  handle?: string | HTMLElement | null;
  ignoreSelector?: string | null;
  onStart?: (rect: DOMRect) => void;
  onMove?: (x: number, y: number) => void;
  onEnd?: () => void;
  threshold?: number;
}

export function draggable(node: HTMLElement, params: DraggableParams) {
  let p = params;
  const opts: AddEventListenerOptions = { passive: false };

  function getHandle(): HTMLElement {
    if (!p || !p.handle) return node;
    if (typeof p.handle === "string") {
      const found = node.querySelector(p.handle) as HTMLElement | null;
      return found ?? node;
    }
    return p.handle as HTMLElement;
  }

  let handle = getHandle();
  function pointerDown(e: PointerEvent) {
    if (p.ignoreSelector && (e.target as HTMLElement).closest(p.ignoreSelector)) return;
    const rect = node.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    const threshold = typeof p.threshold === "number" ? p.threshold : 0;

    function blockClick(ev: Event) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    function onPointerMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < threshold) return;
      if (!moved) {
        moved = true;
        p.onStart?.(rect);
        document.addEventListener("click", blockClick, true);
      }
      ev.preventDefault();
      p.onMove?.(Math.round(ev.clientX - offsetX), Math.round(ev.clientY - offsetY));
    }

    function onPointerUp() {
      if (moved) p.onEnd?.();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      // keep the click blocker until the next tick so it can intercept the click
      setTimeout(() => document.removeEventListener("click", blockClick, true), 0);
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function touchStart(e: TouchEvent) {
    if (p.ignoreSelector && (e.target as HTMLElement).closest(p.ignoreSelector)) return;
    const rect = node.getBoundingClientRect();
    const startTouch = e.touches[0];
    const startX = startTouch.clientX;
    const startY = startTouch.clientY;
    const offsetX = startTouch.clientX - rect.left;
    const offsetY = startTouch.clientY - rect.top;
    let moved = false;
    const threshold = typeof p.threshold === "number" ? p.threshold : 0;

    function blockClick(ev: Event) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    function onTouchMove(ev: TouchEvent) {
      const t = ev.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < threshold) return;
      if (!moved) {
        moved = true;
        p.onStart?.(rect);
        document.addEventListener("click", blockClick, true);
      }
      ev.preventDefault();
      p.onMove?.(Math.round(t.clientX - offsetX), Math.round(t.clientY - offsetY));
    }

    function onTouchEnd() {
      if (moved) p.onEnd?.();
      document.removeEventListener("touchmove", onTouchMove as EventListener);
      document.removeEventListener("touchend", onTouchEnd as EventListener);
      setTimeout(() => document.removeEventListener("click", blockClick, true), 0);
    }

    const addOpts: AddEventListenerOptions = { passive: false };
    document.addEventListener("touchmove", onTouchMove as EventListener, addOpts);
    document.addEventListener("touchend", onTouchEnd as EventListener);
  }

  function addListeners() {
    handle = getHandle();
    handle.addEventListener("pointerdown", pointerDown);
    handle.addEventListener("touchstart", touchStart, opts);
  }

  function removeListeners() {
    if (!handle) return;
    handle.removeEventListener("pointerdown", pointerDown);
    handle.removeEventListener("touchstart", touchStart);
  }

  addListeners();

  return {
    update(newParams: DraggableParams) {
      p = newParams;
      removeListeners();
      addListeners();
    },
    destroy() {
      removeListeners();
    },
  };
}
