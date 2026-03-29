export interface DraggableParams {
  handle?: string | HTMLElement | null;
  ignoreSelector?: string | null;
  onStart?: (rect: DOMRect) => void;
  onMove?: (x: number, y: number) => void;
  onEnd?: () => void;
}

export function draggable(node: HTMLElement, params: DraggableParams) {
  let p = params;
  const opts: AddEventListenerOptions = { passive: false };

  function getHandle(): HTMLElement {
    if (!p || !p.handle) return node;
    if (typeof p.handle === 'string') {
      const found = node.querySelector(p.handle) as HTMLElement | null;
      return found ?? node;
    }
    return p.handle as HTMLElement;
  }

  let handle = getHandle();

  function pointerDown(e: PointerEvent) {
    if (p.ignoreSelector && (e.target as HTMLElement).closest(p.ignoreSelector)) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = node.getBoundingClientRect();
    p.onStart?.(rect);
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    function onPointerMove(ev: PointerEvent) {
      ev.preventDefault();
      p.onMove?.(Math.round(ev.clientX - offsetX), Math.round(ev.clientY - offsetY));
    }

    function onPointerUp() {
      p.onEnd?.();
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function touchStart(e: TouchEvent) {
    if (p.ignoreSelector && (e.target as HTMLElement).closest(p.ignoreSelector)) return;
    if (e.cancelable) {
      e.preventDefault();
      e.stopPropagation();
    }
    const rect = node.getBoundingClientRect();
    p.onStart?.(rect);
    const startTouch = e.touches[0];
    const offsetX = startTouch.clientX - rect.left;
    const offsetY = startTouch.clientY - rect.top;

    function onTouchMove(ev: TouchEvent) {
      ev.preventDefault();
      const t = ev.touches[0];
      p.onMove?.(Math.round(t.clientX - offsetX), Math.round(t.clientY - offsetY));
    }

    function onTouchEnd() {
      p.onEnd?.();
      document.removeEventListener('touchmove', onTouchMove as EventListener);
      document.removeEventListener('touchend', onTouchEnd as EventListener);
    }

    const addOpts: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchmove', onTouchMove as EventListener, addOpts);
    document.addEventListener('touchend', onTouchEnd as EventListener);
  }

  function addListeners() {
    handle = getHandle();
    handle.addEventListener('pointerdown', pointerDown);
    handle.addEventListener('touchstart', touchStart, opts);
  }

  function removeListeners() {
    if (!handle) return;
    handle.removeEventListener('pointerdown', pointerDown);
    handle.removeEventListener('touchstart', touchStart);
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
    }
  };
}
