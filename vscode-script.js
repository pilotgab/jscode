(() => {
  const ROOT_SEL = ".monaco-workbench";
  const PALETTE_SEL = ".quick-input-widget";
  const OVERLAY_ID = "command-blur";

  let running = false;
  let raf = null;

  function isPaletteVisible(palette) {
    if (!palette) return false;

    const cs = getComputedStyle(palette);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;

    // If it has no box, it's not really visible
    const rect = palette.getBoundingClientRect();
    return rect.width > 10 && rect.height > 10;
  }

  function ensureOverlay(root) {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;

    ["top", "left", "right", "bottom"].forEach((pos) => {
      const p = document.createElement("div");
      p.className = `command-blur-panel ${pos}`;
      overlay.appendChild(p);
    });

    root.appendChild(overlay);
    return overlay;
  }

  function removeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
  }

  function layoutOverlay(root, palette) {
    const overlay = ensureOverlay(root);

    const rRoot = root.getBoundingClientRect();
    const rPal = palette.getBoundingClientRect();

    const left = Math.max(0, rPal.left - rRoot.left);
    const top = Math.max(0, rPal.top - rRoot.top);
    const width = Math.min(rPal.width, rRoot.width);
    const height = Math.min(rPal.height, rRoot.height);

    const right = Math.max(0, rRoot.width - (left + width));
    const bottom = Math.max(0, rRoot.height - (top + height));

    const topP = overlay.querySelector(".command-blur-panel.top");
    const leftP = overlay.querySelector(".command-blur-panel.left");
    const rightP = overlay.querySelector(".command-blur-panel.right");
    const bottomP = overlay.querySelector(".command-blur-panel.bottom");

    // Top
    topP.style.left = "0px";
    topP.style.top = "0px";
    topP.style.width = `${rRoot.width}px`;
    topP.style.height = `${top}px`;

    // Left
    leftP.style.left = "0px";
    leftP.style.top = `${top}px`;
    leftP.style.width = `${left}px`;
    leftP.style.height = `${height}px`;

    // Right
    rightP.style.left = `${left + width}px`;
    rightP.style.top = `${top}px`;
    rightP.style.width = `${right}px`;
    rightP.style.height = `${height}px`;

    // Bottom
    bottomP.style.left = "0px";
    bottomP.style.top = `${top + height}px`;
    bottomP.style.width = `${rRoot.width}px`;
    bottomP.style.height = `${bottom}px`;
  }

  function tick() {
    const root = document.querySelector(ROOT_SEL);
    const palette = document.querySelector(PALETTE_SEL);

    if (!root || !palette) {
      removeOverlay();
      raf = requestAnimationFrame(tick);
      return;
    }

    // root needs relative positioning
    if (getComputedStyle(root).position === "static") root.style.position = "relative";

    if (isPaletteVisible(palette)) {
      layoutOverlay(root, palette);
    } else {
      removeOverlay();
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);

    // Escape removes blur immediately
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape" || e.key === "Esc") removeOverlay();
      },
      true
    );
  }

  // Run even if injected after DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
