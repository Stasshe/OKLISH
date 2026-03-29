export interface ResizableParams {
  position?: string;
  onStart?: () => void;
  onResize?: (dx: number, dy: number) => void;
  onEnd?: () => void;
}

export function resizable(node: HTMLElement, params: ResizableParams) {
  let p = params;
  const opts: AddEventListenerOptions = { passive: false };

  function pointerDown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    p.onStart?.();
    const startX = e.clientX;
    const startY = e.clientY;
    try {
      node.setPointerCapture?.(e.pointerId);
    } catch {}

    function onPointerMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      p.onResize?.(dx, dy);
    }

    function onPointerUp() {
      p.onEnd?.();
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", onPointerUp);
    }

    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", onPointerUp);
  }

  function touchStart(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    p.onStart?.();
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;

    function onTouchMove(ev: TouchEvent) {
      ev.preventDefault();
      const dx = ev.touches[0].clientX - startX;
      const dy = ev.touches[0].clientY - startY;
      p.onResize?.(dx, dy);
    }

    function onTouchEnd() {
      p.onEnd?.();
      document.removeEventListener("touchmove", onTouchMove as EventListener);
      document.removeEventListener("touchend", onTouchEnd as EventListener);
    }

    const addOpts: AddEventListenerOptions = { passive: false };
    document.addEventListener("touchmove", onTouchMove as EventListener, addOpts);
    document.addEventListener("touchend", onTouchEnd as EventListener);
  }

  node.addEventListener("pointerdown", pointerDown);
  node.addEventListener("touchstart", touchStart, opts);

  return {
    update(newParams: ResizableParams) {
      p = newParams;
    },
    destroy() {
      node.removeEventListener("pointerdown", pointerDown);
      node.removeEventListener("touchstart", touchStart);
    },
  };
}
