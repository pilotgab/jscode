// document.addEventListener("DOMContentLoaded", function () {
//   const checkElement = setInterval(() => {
//     const commandDialog = document.querySelector(".quick-input-widget");
//     if (commandDialog) {
//       if (commandDialog.style.display !== "none") {
//         runMyScript();
//       }
//       const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//           if (
//             mutation.type === "attributes" &&
//             mutation.attributeName === "style"
//           ) {
//             if (commandDialog.style.display === "none") {
//               handleEscape();
//             } else {
//               runMyScript();
//             }
//           }
//         });
//       });
//       observer.observe(commandDialog, { attributes: true });
//       clearInterval(checkElement);
//     } else {
//       console.log("Command dialog not found yet. Retrying...");
//     }
//   }, 500);

//   document.addEventListener("keydown", function (event) {
//     if ((event.metaKey || event.ctrlKey) && event.key === "p") {
//       event.preventDefault();
//       runMyScript();
//     } else if (event.key === "Escape" || event.key === "Esc") {
//       event.preventDefault();
//       handleEscape();
//     }
//   });

//   document.addEventListener(
//     "keydown",
//     function (event) {
//       if (event.key === "Escape" || event.key === "Esc") {
//         handleEscape();
//       }
//     },
//     true,
//   );

//   function runMyScript() {
//     const targetDiv = document.querySelector(".monaco-workbench");
//     const existingElement = document.getElementById("command-blur");
//     if (existingElement) {
//       existingElement.remove();
//     }
//     const newElement = document.createElement("div");
//     newElement.setAttribute("id", "command-blur");
//     newElement.addEventListener("click", function () {
//       newElement.remove();
//     });
//     targetDiv.appendChild(newElement);
//   }

//   function handleEscape() {
//     const element = document.getElementById("command-blur");
//     if (element) {
//       element.click();
//     }
//   }
// });


(() => {
    // ---- helpers ----
    const waitFor = (selector, timeoutMs = 15000) =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const t = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(t);
                    resolve(el);
                } else if (Date.now() - start > timeoutMs) {
                    clearInterval(t);
                    reject(new Error(`Timeout waiting for ${selector}`));
                }
            }, 200);
        });

    const ensureStyle = () => {
        if (document.getElementById("command-blur-style")) return;

        const style = document.createElement("style");
        style.id = "command-blur-style";
        style.textContent = `
      #command-blur {
        position: absolute;
        inset: 0;
        z-index: 999999;
        background: rgba(0,0,0,0.35);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
    `;
        document.head.appendChild(style);
    };

    const addOverlay = () => {
        const root = document.querySelector(".monaco-workbench");
        if (!root) return;

        ensureStyle();

        const existing = document.getElementById("command-blur");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.id = "command-blur";
        overlay.addEventListener("click", () => overlay.remove());

        // Make sure absolute overlay positions correctly
        const prevPos = getComputedStyle(root).position;
        if (prevPos === "static") root.style.position = "relative";

        root.appendChild(overlay);
    };

    const removeOverlay = () => {
        const el = document.getElementById("command-blur");
        if (el) el.remove();
    };

    // ---- main ----
    const start = async () => {
        // Watch the command palette / quick input widget
        let commandDialog;
        try {
            commandDialog = await waitFor(".quick-input-widget");
        } catch {
            // if it doesn't exist yet, still wire Escape removal
            commandDialog = null;
        }

        if (commandDialog) {
            // initial state
            if (commandDialog.style.display !== "none") addOverlay();

            // observe show/hide changes
            const observer = new MutationObserver(() => {
                if (commandDialog.style.display === "none") removeOverlay();
                else addOverlay();
            });

            observer.observe(commandDialog, { attributes: true, attributeFilter: ["style"] });
        }

        // Escape should always remove overlay
        document.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Escape" || event.key === "Esc") removeOverlay();
            },
            true
        );
    };

    // Run even if injected after DOMContentLoaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
