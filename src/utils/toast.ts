/**
 * Custom toast for H5 (beautiful style). Falls back to uni.showToast on other platforms.
 */

const DURATION = 2000;
const TOAST_CLASS = "app-toast";
const TOAST_STYLE_ID = "app-toast-styles";

function injectStyles(): void {
  if (typeof document === "undefined" || document.getElementById(TOAST_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = TOAST_STYLE_ID;
  style.textContent = `
    .${TOAST_CLASS} {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      padding: 16px 24px;
      min-width: 120px;
      max-width: 80vw;
      border-radius: 12px;
      font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.45;
      text-align: center;
      color: #f8fafc;
      background: rgba(30, 41, 59, 0.94);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
      -webkit-font-smoothing: antialiased;
      word-break: break-word;
    }
    .${TOAST_CLASS}.app-toast--visible {
      opacity: 1;
    }
    .${TOAST_CLASS} .app-toast__icon {
      display: block;
      margin: 0 auto 10px;
      width: 40px;
      height: 40px;
    }
    .${TOAST_CLASS} .app-toast__icon svg {
      width: 100%;
      height: 100%;
    }
    .${TOAST_CLASS}.app-toast--text-only .app-toast__icon {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

const successIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

function showCustomToast(title: string, icon: "success" | "none"): void {
  injectStyles();
  const wrap = document.createElement("div");
  wrap.className = TOAST_CLASS + (icon === "none" ? " app-toast--text-only" : "");
  if (icon === "success") {
    const iconEl = document.createElement("span");
    iconEl.className = "app-toast__icon";
    iconEl.innerHTML = successIconSvg;
    wrap.appendChild(iconEl);
  }
  const text = document.createElement("span");
  text.textContent = title;
  wrap.appendChild(text);
  document.body.appendChild(wrap);
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add("app-toast--visible")));
  const t = setTimeout(() => {
    wrap.classList.remove("app-toast--visible");
    setTimeout(() => {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 280);
  }, DURATION);
  const cancel = () => {
    clearTimeout(t);
  };
  (wrap as unknown as { _cancel: () => void })._cancel = cancel;
}

export function showToast(options: { title: string; icon?: "success" | "none" }): void {
  const { title, icon = "none" } = options;
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    showCustomToast(title, icon);
  } else {
    // #ifndef H5
    uni.showToast({ title, icon: icon === "success" ? "success" : "none" });
    // #endif
  }
}
