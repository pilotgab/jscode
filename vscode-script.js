document.addEventListener("DOMContentLoaded", function () {
  const ROOT_SEL = ".monaco-workbench";
  const PALETTE_SEL = ".quick-input-widget";
  const OVERLAY_ID = "command-blur";

  let resizeHandler = null;

  const waitForPalette = setInterval(() => {
    const palette = document.querySelector(PALETTE_SEL);
    if (!palette) return;

    // Watch palette show/hide
    if (palette.style.display !== "none") showBlur();

    const observer = new MutationObserver(() => {
      if (palette.style.display === "none") {
        hideBlur();
      } else {
        showBlur();
      }
    });

    observer.observe(palette, { attributes: true, attributeFilter: ["style"] });
    clearInterval(waitForPalette);
  }, 300);

  // Escape closes blur
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" || event.key === "Esc") hideBlur();
    },
    true
  );

  function ensureOverlay(root) {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;

    // 4 panels: top/left/right/bottom
    ["top", "left", "right", "bottom"].forEach((pos) => {
      const p = document.createElement("div");
      p.className = `command-blur-panel ${pos}`;
      overlay.appendChild(p);
    });

    root.appendChild(overlay);
    return overlay;
  }

  function layoutOverlay() {
    const root = document.querySelector(ROOT_SEL);
    const palette = document.querySelector(PALETTE_SEL);
    const overlay = document.getElementById(OVERLAY_ID);
    if (!root || !palette || !overlay) return;

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

  function showBlur() {
    const root = document.querySelector(ROOT_SEL);
    if (!root) return;

    // Ensure root can position absolute children correctly
    const prevPos = getComputedStyle(root).position;
    if (prevPos === "static") root.style.position = "relative";

    ensureOverlay(root);
    layoutOverlay();

    // keep it aligned if window resizes
    if (!resizeHandler) {
      resizeHandler = () => {
        if (document.getElementById(OVERLAY_ID)) layoutOverlay();
      };
      window.addEventListener("resize", resizeHandler);
    }
  }

  function hideBlur() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
  }
});
