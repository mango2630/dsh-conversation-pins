window.__ModuleLoader__.load({ id: "dsh-conversation-pins", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  PinOverlay: () => PinOverlay,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var PLUGIN_ID = "dsh-conversation-pins";
var STYLE_ID = `${PLUGIN_ID}-style`;
var STORAGE_PREFIX = "dsh:conversation-pins:v1:";
var LANGUAGE_KEY = "dsh:conversation-pins:language";
var MAX_PINS = 200;
var PIN_TEXT_LIMIT = 600;
var MAX_MARKERS = 80;
var BLOCK_SELECTOR = "p,li,h1,h2,h3,h4,h5,h6,blockquote,pre,td,th,dt,dd,figcaption";
var INTERACTIVE_SELECTOR = 'button,a,input,textarea,select,[contenteditable="true"],[contenteditable=""],[role="button"]';
var LABEL_LENGTH = 6;
var CSS = `
.dsh-pins-root {
  position: fixed;
  inset: 0;
  z-index: 19;
  pointer-events: none;
  font-family: var(--dsw-font-family);
  color: var(--dsw-alias-label-primary);
}
.dsh-pins-root *, .dsh-pins-root *::before, .dsh-pins-root *::after {
  box-sizing: border-box;
}
.dsh-pins-ui {
  pointer-events: auto;
}
.dsh-pins-toggle {
  position: fixed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsw-specific-menu) 90%, transparent);
  color: var(--dsw-alias-label-secondary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(18px) saturate(1.45);
  -webkit-backdrop-filter: blur(18px) saturate(1.45);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, transform 120ms ease, border-color 120ms ease;
}
.dsh-pins-toggle:hover {
  color: var(--dsw-alias-state-warn-label);
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, var(--dsw-alias-border-l2));
  transform: translateY(-1px);
}
.dsh-pins-toggle[data-open="true"] {
  color: var(--dsw-alias-state-warn-label);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 72%, var(--dsw-specific-menu));
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 48%, var(--dsw-alias-border-l2));
}
.dsh-pins-count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--dsw-alias-state-warn-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-base);
}
.dsh-pins-triggerSlot {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 34px;
  height: 30px;
  padding: 2px 0 2px 8px;
  pointer-events: auto;
}
.dsh-pins-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 34%, var(--dsw-alias-border-l2));
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 82%, var(--dsw-specific-menu));
  color: var(--dsw-alias-state-warn-label);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.10);
  cursor: pointer;
  animation: dsh-pins-pop 110ms ease-out;
  transition: transform 110ms ease, background 110ms ease;
}
.dsh-pins-trigger:hover {
  transform: scale(1.08);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 18%, var(--dsw-alias-state-warn-tertiary));
}
@keyframes dsh-pins-pop {
  from { opacity: 0; transform: scale(0.82); }
  to { opacity: 1; transform: scale(1); }
}
.dsh-pins-marker {
  position: fixed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 60%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 88%, var(--dsw-alias-bg-base));
  color: #fff;
  font-family: var(--dsw-font-family);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
  cursor: pointer;
  transition: transform 100ms ease, filter 100ms ease;
}
.dsh-pins-marker:hover, .dsh-pins-marker[data-active="true"] {
  transform: scale(1.14);
  filter: saturate(1.2) brightness(1.04);
}
.dsh-pins-panel {
  position: fixed;
  display: flex;
  flex-direction: column;
  min-width: 248px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-lg);
  background: color-mix(in srgb, var(--dsw-specific-menu) 94%, transparent);
  box-shadow: 0 18px 56px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(22px) saturate(1.5);
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  animation: dsh-pins-panel-in 150ms ease-out;
}
@keyframes dsh-pins-panel-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
.dsh-pins-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 12px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dsh-pins-headMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 86%, transparent);
  color: var(--dsw-alias-state-warn-label);
}
.dsh-pins-headCopy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.dsh-pins-title {
  font-size: 14px;
  font-weight: 650;
  line-height: 20px;
  letter-spacing: -0.01em;
}
.dsh-pins-subtitle {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 15px;
}
.dsh-pins-close, .dsh-pins-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}
.dsh-pins-close { width: 28px; height: 28px; }
.dsh-pins-delete {
  width: 28px;
  height: 28px;
  opacity: 0.55;
}
.dsh-pins-item:hover .dsh-pins-delete,
.dsh-pins-delete:focus-visible {
  opacity: 1;
}
.dsh-pins-close:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dsh-pins-delete:hover {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
  color: var(--dsw-alias-state-error-primary);
  opacity: 1;
}
.dsh-pins-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.dsh-pins-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  border-radius: 10px;
  transition: background 100ms ease;
}
.dsh-pins-item:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-pins-item[data-active="true"] {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 60%, transparent);
}
.dsh-pins-itemMain {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  flex: 1;
  padding: 9px 4px 9px 9px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-pins-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  flex: none;
  margin-top: 1px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent);
  color: var(--dsw-alias-state-warn-label);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}
.dsh-pins-itemCopy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.dsh-pins-label {
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-pins-snippet {
  display: -webkit-box;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
}
.dsh-pins-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px 24px 32px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
}
.dsh-pins-emptyIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 2px;
  border-radius: 13px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}
.dsh-pins-emptyTitle {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}
.dsh-pins-emptyHint {
  max-width: 210px;
  font-size: 11px;
  line-height: 17px;
}
.dsh-pins-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px 10px 16px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-tertiary);
  font-size: 10px;
  line-height: 15px;
}
.dsh-pins-footActions {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex: none;
}
.dsh-pins-lang {
  padding: 3px 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
}
.dsh-pins-lang:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dsh-pins-clear {
  padding: 3px 7px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
}
.dsh-pins-clear:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-state-warn-label);
}
.dsh-pins-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  max-width: min(460px, calc(100vw - 32px));
  padding: 9px 14px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-specific-menu) 94%, transparent);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: dsh-pins-toast-in 150ms ease-out;
}
@keyframes dsh-pins-toast-in {
  from { opacity: 0; transform: translate(-50%, 6px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
[data-chat-flow] [data-dsh-pin] {
  border-radius: 3px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 45%, transparent);
  box-shadow: -2px 0 0 var(--dsw-alias-state-warn-primary);
  transition: background 140ms ease;
}
[data-chat-flow] [data-dsh-pin-flash] {
  animation: dsh-pins-flash 1.5s ease-out;
}
@keyframes dsh-pins-flash {
  0% { background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 34%, transparent); }
  100% { background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 45%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-pins-trigger, .dsh-pins-panel, .dsh-pins-toast { animation: none; }
  .dsh-pins-toggle, .dsh-pins-trigger, .dsh-pins-marker { transition: none; }
}
`;
var ZH = {
  title: "\u56FE\u9489",
  count: (n) => `${n} \u4E2A\u4F4D\u7F6E`,
  emptyTitle: "\u8FD8\u6CA1\u6709\u56FE\u9489",
  emptyHint: "\u628A\u9F20\u6807\u79FB\u5230\u4EFB\u610F\u4E00\u6BB5\u8F93\u51FA\u4E0A\uFF0C\u6309 Alt+P\uFF0C\u6216\u70B9\u51FB\u5DE6\u4FA7\u56FE\u9489\u3002",
  hint: "\u60AC\u505C\u8F93\u51FA\uFF0CAlt+P \u6253\u9489",
  clear: "\u5168\u90E8\u6E05\u9664",
  clearConfirm: "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u6E05\u9664",
  pinBlock: "\u5728\u8FD9\u91CC\u6253\u4E00\u4E2A\u56FE\u9489",
  pinShortcut: "Alt + P",
  panelShortcut: "Alt + Shift + P",
  pinNeedHover: "\u5148\u628A\u9F20\u6807\u79FB\u5230\u8981\u56FA\u5B9A\u7684\u8F93\u51FA\u4E0A\uFF0C\u518D\u6309 Alt + P",
  pinned: (label) => `\u5DF2\u56FA\u5B9A\u300C${label}\u300D`,
  alreadyPinned: "\u8FD9\u4E2A\u4F4D\u7F6E\u5DF2\u7ECF\u56FA\u5B9A\u8FC7\u4E86",
  removed: "\u5DF2\u79FB\u9664\u56FE\u9489",
  jumpMissing: "\u627E\u4E0D\u5230\u8FD9\u4E2A\u4F4D\u7F6E\uFF0C\u53EF\u80FD\u8FD8\u6CA1\u52A0\u8F7D\u5230\u8FD9\u6BB5\u5386\u53F2",
  jumpHidden: "\u8FD9\u6BB5\u5185\u5BB9\u5F53\u524D\u88AB\u6298\u53E0\u4E86\uFF0C\u5C55\u5F00\u5BF9\u5E94\u7684\u8F6E\u6B21\u540E\u518D\u70B9\u56FE\u9489",
  close: "\u5173\u95ED\u56FE\u9489\u9762\u677F",
  delete: "\u5220\u9664\u8FD9\u4E2A\u56FE\u9489",
  panelHint: "Alt+P \u6253\u9489 \xB7 Alt+Shift+P \u9762\u677F"
};
var EN = {
  title: "Pins",
  count: (n) => `${n} ${n === 1 ? "spot" : "spots"}`,
  emptyTitle: "No pins yet",
  emptyHint: "Hover any part of the output, press Alt+P, or click the pin in the gutter.",
  hint: "Hover output, Alt+P to pin",
  clear: "Clear all",
  clearConfirm: "Click again to clear",
  pinBlock: "Pin this block",
  pinShortcut: "Alt + P",
  panelShortcut: "Alt + Shift + P",
  pinNeedHover: "Hover the output you want to pin first, then press Alt + P",
  pinned: (label) => `Pinned \u201C${label}\u201D`,
  alreadyPinned: "This spot is already pinned",
  removed: "Pin removed",
  jumpMissing: "Could not find this spot; its history may not be loaded",
  jumpHidden: "This content is folded right now. Expand its turn, then try the pin again.",
  close: "Close pins",
  delete: "Delete this pin",
  panelHint: "Alt+P pin \xB7 Alt+Shift+P panel"
};
function copyFor(language) {
  return language.toLowerCase().startsWith("zh") ? ZH : EN;
}
function pinIcon(size = 15) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "path",
      {
        d: "M9 3.5h6l-.9 4.7 3.4 3.7v2.3H6.5v-2.3l3.4-3.7L9 3.5Z",
        stroke: "currentColor",
        strokeWidth: "1.7",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 14.2v6.1", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" })
  ] });
}
function closeIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 6 12 12M18 6 6 18", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }) });
}
function trashIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "path",
    {
      d: "M5 7h14M9 7V5h6v2m-8 0 .8 12h8.4L17 7M10 11v5m4-5v5",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function normalizeSpace(value) {
  return value.replace(/\s+/gu, " ").trim();
}
function firstGraphemes(value, count) {
  const normalized = normalizeSpace(value);
  if (normalized === "") return "";
  const Segmenter = Intl.Segmenter;
  if (Segmenter === void 0) return Array.from(normalized).slice(0, count).join("");
  const out = [];
  for (const part of new Segmenter(void 0, { granularity: "grapheme" }).segment(normalized)) {
    out.push(part.segment);
    if (out.length === count) break;
  }
  return out.join("");
}
function elementText(element) {
  const value = element.innerText;
  return typeof value === "string" ? value.trim() : (element.textContent ?? "").trim();
}
function isRendered(element) {
  if (element.hidden || element.closest("[hidden]") !== null) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
function isEditable(target) {
  if (!(target instanceof Element)) return false;
  const editable = target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]');
  return editable !== null;
}
function chatScroller() {
  let best = null;
  for (const candidate of document.querySelectorAll("[data-conversation-scroll]")) {
    const flow = candidate.querySelector("[data-chat-flow]");
    if (flow === null) continue;
    const rect = candidate.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (rect.width <= 0 || rect.height <= 0 || area <= 0) continue;
    if (best === null || area > best.area) best = { element: candidate, area };
  }
  if (best !== null) return best.element;
  return document.querySelector("[data-chat-flow]")?.closest("[data-conversation-scroll]") ?? null;
}
function chatFlow(scroller) {
  return scroller.querySelector("[data-chat-flow]");
}
function cssEscape(value) {
  return globalThis.CSS?.escape?.(value) ?? value.replace(/["\\]/gu, "\\$&");
}
function flowElement(scroller, flowKey) {
  const flow = chatFlow(scroller);
  if (flow === null) return null;
  const direct = flow.querySelector(`[data-chat-flow-key="${cssEscape(flowKey)}"]`);
  if (direct !== null) return direct;
  for (const element of flow.querySelectorAll("[data-chat-flow-key]")) {
    if (element.dataset.chatFlowKey === flowKey) return element;
  }
  return null;
}
function nearestBlock(target, flow) {
  if (!(target instanceof Element)) return null;
  const block = target.closest(BLOCK_SELECTOR);
  if (block === null || !flow.contains(block)) return null;
  if (block.closest(INTERACTIVE_SELECTOR) !== null) return null;
  if (normalizeSpace(elementText(block)) === "") return null;
  return block;
}
function collectBlocks(flow, renderedOnly = true) {
  const blocks = [];
  for (const element of flow.querySelectorAll(BLOCK_SELECTOR)) {
    if (!flow.contains(element)) continue;
    if (renderedOnly && !isRendered(element)) continue;
    if (element.closest(INTERACTIVE_SELECTOR) !== null) continue;
    if (normalizeSpace(elementText(element)) === "") continue;
    blocks.push(element);
  }
  return blocks;
}
function nodeKeyOf(flowKey) {
  if (!flowKey.startsWith("[")) return flowKey;
  try {
    const parsed = JSON.parse(flowKey);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {
  }
  return flowKey;
}
function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(value, maximum));
}
function sameRect(left, right) {
  return left !== null && Math.abs(left.left - right.left) < 0.5 && Math.abs(left.top - right.top) < 0.5 && Math.abs(left.right - right.right) < 0.5 && Math.abs(left.bottom - right.bottom) < 0.5;
}
function sameMarkers(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === void 0 || b === void 0) return false;
    if (a.id !== b.id || a.index !== b.index || a.label !== b.label) return false;
    if (Math.abs(a.top - b.top) > 0.5 || Math.abs(a.left - b.left) > 0.5) return false;
  }
  return true;
}
function newPinId() {
  return `pin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function storageKey(sessionId) {
  return `${STORAGE_PREFIX}${sessionId}`;
}
function readPins(sessionId) {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const pins = [];
    for (const entry of parsed) {
      if (typeof entry !== "object" || entry === null) continue;
      const record = entry;
      if (typeof record.id !== "string" || typeof record.flowKey !== "string" || typeof record.label !== "string" || typeof record.text !== "string" || typeof record.createdAt !== "number") continue;
      const anchorSeq = typeof record.anchorSeq === "number" && Number.isFinite(record.anchorSeq) ? record.anchorSeq : void 0;
      const turn = typeof record.turn === "number" && Number.isSafeInteger(record.turn) && record.turn >= 0 ? record.turn : void 0;
      pins.push({
        id: record.id,
        sessionId,
        flowKey: record.flowKey,
        nodeKey: typeof record.nodeKey === "string" ? record.nodeKey : nodeKeyOf(record.flowKey),
        blockIndex: typeof record.blockIndex === "number" && Number.isInteger(record.blockIndex) ? record.blockIndex : 0,
        tag: typeof record.tag === "string" ? record.tag : "",
        label: record.label.slice(0, 24),
        text: record.text.slice(0, PIN_TEXT_LIMIT),
        createdAt: record.createdAt,
        ...turn === void 0 ? {} : { turn },
        ...anchorSeq === void 0 ? {} : { anchorSeq }
      });
      if (pins.length >= MAX_PINS) break;
    }
    return pins;
  } catch {
    return [];
  }
}
function writePins(sessionId, pins) {
  try {
    localStorage.setItem(storageKey(sessionId), JSON.stringify(pins.slice(-MAX_PINS)));
  } catch {
  }
}
function resolveBlock(scroller, pin) {
  const flow = flowElement(scroller, pin.flowKey);
  if (flow === null) return null;
  const blocks = collectBlocks(flow);
  if (blocks.length === 0) return null;
  const wanted = normalizeSpace(pin.text);
  const direct = blocks[pin.blockIndex];
  if (direct !== void 0) {
    const text = normalizeSpace(elementText(direct));
    if (text.startsWith(wanted.slice(0, 24)) || text.includes(wanted.slice(0, 24))) return direct;
  }
  if (wanted.length > 0) {
    const exact = blocks.find((block) => normalizeSpace(elementText(block)) === wanted);
    if (exact !== void 0) return exact;
    const prefix = blocks.find((block) => normalizeSpace(elementText(block)).startsWith(wanted.slice(0, 24)));
    if (prefix !== void 0) return prefix;
  }
  return direct ?? null;
}
function resolveAnyBlock(scroller, pin) {
  const flow = flowElement(scroller, pin.flowKey);
  if (flow === null) return null;
  const blocks = collectBlocks(flow, false);
  if (blocks.length === 0) return null;
  const wanted = normalizeSpace(pin.text);
  const direct = blocks[pin.blockIndex];
  if (direct !== void 0) {
    const text = normalizeSpace(elementText(direct));
    if (text.startsWith(wanted.slice(0, 24)) || text.includes(wanted.slice(0, 24))) return direct;
  }
  if (wanted.length === 0) return direct ?? null;
  return blocks.find((block) => normalizeSpace(elementText(block)) === wanted) ?? blocks.find((block) => normalizeSpace(elementText(block)).startsWith(wanted.slice(0, 24))) ?? direct ?? null;
}
function isFoldedBlock(block) {
  for (let node = block.parentElement; node !== null && node !== document.body; node = node.parentElement) {
    if (node.hasAttribute("hidden")) return true;
    if (node.matches("[data-step-process-body]") && node.getBoundingClientRect().height < 2) return true;
  }
  return false;
}
function pinTurn(pin) {
  if (pin.turn !== void 0) return pin.turn;
  const nodeKey = nodeKeyOf(pin.flowKey);
  const match = /^[^:]+:(\d+):/u.exec(nodeKey);
  if (match?.[1] === void 0) return void 0;
  const turn = Number(match[1]);
  return Number.isSafeInteger(turn) && turn >= 0 ? turn : void 0;
}
function expandTurn(scroller, turn) {
  let changed = false;
  const show = (button) => {
    if (button === null || button.getAttribute("aria-expanded") !== "false") return;
    if (button.getClientRects().length === 0) return;
    button.click();
    changed = true;
  };
  for (const button of scroller.querySelectorAll(`button[data-turn-process="${turn}"]`)) {
    show(button);
  }
  for (const group of scroller.querySelectorAll(`[data-chat-turn="${turn}"][data-step-process]`)) {
    show(group.querySelector('button[aria-expanded="false"]'));
  }
  return changed;
}
function createPinHost(ctx) {
  let activeSession;
  const listeners = /* @__PURE__ */ new Set();
  const source = {
    getSnapshot: () => activeSession,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
  const locale = {
    getSnapshot: () => ctx.locale.getLocale().active,
    subscribe: (listener) => ctx.locale.subscribe(listener)
  };
  const publish = (next) => {
    if (next === activeSession) return;
    activeSession = next;
    for (const listener of [...listeners]) listener();
  };
  const sync = () => {
    const binding = ctx.uiSession.adapter.current.getSnapshot();
    publish(binding.key);
  };
  const disposeSession = ctx.uiSession.adapter.current.subscribe(sync);
  sync();
  const anchorSeqFor = (sessionId, flowKey) => {
    try {
      const chat = ctx.uiConversation.binding(sessionId).target("chat").getSnapshot();
      return chat?.nodes.get(nodeKeyOf(flowKey))?.anchorSeq;
    } catch {
      return void 0;
    }
  };
  const jumpTo = async (pin) => {
    if (activeSession !== pin.sessionId) return false;
    try {
      const binding = ctx.sessions.binding(pin.sessionId);
      if (binding === void 0) return false;
      let anchorSeq = pin.anchorSeq ?? anchorSeqFor(pin.sessionId, pin.flowKey);
      if (anchorSeq === void 0) {
        await binding.session.loadOlder();
        anchorSeq = anchorSeqFor(pin.sessionId, pin.flowKey);
      }
      if (anchorSeq !== void 0) {
        try {
          await binding.session.loadThrough(anchorSeq);
        } catch {
        }
      }
      return true;
    } catch {
      return false;
    }
  };
  return {
    host: { source, locale, anchorSeqFor, jumpTo },
    dispose: () => {
      disposeSession();
      listeners.clear();
    }
  };
}
function PinOverlay({ useActiveSessionId, usePinLocale, anchorSeqFor, jumpTo }) {
  const activeSessionId = useActiveSessionId((value) => value);
  const locale = usePinLocale((value) => value);
  const [language, setLanguage] = (0, import_react.useState)(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      return stored === "zh" || stored === "en" ? stored : null;
    } catch {
      return null;
    }
  });
  const copy = (0, import_react.useMemo)(() => copyFor(language ?? locale), [language, locale]);
  const toggleLanguage = (0, import_react.useCallback)(() => {
    const next = copy === ZH ? "en" : "zh";
    setLanguage(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
    }
  }, [copy]);
  const [pins, setPins] = (0, import_react.useState)([]);
  const [panelOpen, setPanelOpen] = (0, import_react.useState)(false);
  const [hover, setHover] = (0, import_react.useState)(null);
  const [markers, setMarkers] = (0, import_react.useState)([]);
  const [chatRect, setChatRect] = (0, import_react.useState)(null);
  const [toast, setToast] = (0, import_react.useState)(null);
  const [activePinId, setActivePinId] = (0, import_react.useState)(null);
  const [clearArmed, setClearArmed] = (0, import_react.useState)(false);
  const pinsRef = (0, import_react.useRef)([]);
  const chatRectRef = (0, import_react.useRef)(null);
  const panelRef = (0, import_react.useRef)(null);
  const toggleRef = (0, import_react.useRef)(null);
  const hoverRef = (0, import_react.useRef)(null);
  const lastBlockRef = (0, import_react.useRef)(null);
  const toastTimer = (0, import_react.useRef)(void 0);
  const flashTimer = (0, import_react.useRef)(void 0);
  const frame = (0, import_react.useRef)(void 0);
  const mutationTimer = (0, import_react.useRef)(void 0);
  pinsRef.current = pins;
  chatRectRef.current = chatRect;
  hoverRef.current = hover;
  const showToast = (0, import_react.useCallback)((message) => {
    setToast(message);
    if (toastTimer.current !== void 0) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  }, []);
  const commitPins = (0, import_react.useCallback)((next) => {
    setPins(next);
    pinsRef.current = next;
    if (activeSessionId !== void 0) writePins(activeSessionId, next);
  }, [activeSessionId]);
  (0, import_react.useEffect)(() => {
    const next = activeSessionId === void 0 ? [] : readPins(activeSessionId);
    setPins(next);
    pinsRef.current = next;
    setPanelOpen(false);
    setHover(null);
    setMarkers([]);
    setActivePinId(null);
    setClearArmed(false);
    lastBlockRef.current = null;
  }, [activeSessionId]);
  (0, import_react.useEffect)(() => () => {
    if (toastTimer.current !== void 0) window.clearTimeout(toastTimer.current);
    if (flashTimer.current !== void 0) window.clearTimeout(flashTimer.current);
    if (frame.current !== void 0) window.cancelAnimationFrame(frame.current);
    if (mutationTimer.current !== void 0) window.clearTimeout(mutationTimer.current);
    document.querySelectorAll("[data-dsh-pin]").forEach((element) => {
      delete element.dataset.dshPin;
    });
    document.querySelectorAll("[data-dsh-pin-flash]").forEach((element) => {
      delete element.dataset.dshPinFlash;
    });
  }, []);
  const measure = (0, import_react.useCallback)(() => {
    const scroller = chatScroller();
    if (scroller === null) {
      setChatRect(null);
      setMarkers([]);
      return;
    }
    const scrollerRect = scroller.getBoundingClientRect();
    const nextRect = {
      left: scrollerRect.left,
      top: scrollerRect.top,
      right: scrollerRect.right,
      bottom: scrollerRect.bottom,
      width: scrollerRect.width,
      height: scrollerRect.height
    };
    setChatRect((current2) => sameRect(current2, nextRect) ? current2 : nextRect);
    const nextMarkers = [];
    const marked = /* @__PURE__ */ new Set();
    const stack = /* @__PURE__ */ new Map();
    const current = pinsRef.current.slice(0, MAX_MARKERS);
    for (const [index, pin] of current.entries()) {
      const block = resolveBlock(scroller, pin);
      if (block === null) continue;
      const rect = block.getBoundingClientRect();
      if (rect.bottom < scrollerRect.top || rect.top > scrollerRect.bottom) continue;
      marked.add(block);
      const depth = stack.get(block) ?? 0;
      stack.set(block, depth + 1);
      const contentLeft = flowElement(scroller, pin.flowKey)?.getBoundingClientRect().left ?? rect.left;
      const left = clamp(contentLeft - 29, scrollerRect.left + 8, scrollerRect.right - 22);
      const top = clamp(rect.top + 2 + depth * 22, scrollerRect.top + 4, scrollerRect.bottom - 26);
      nextMarkers.push({ id: pin.id, index, top, left, label: pin.label });
    }
    setMarkers((current2) => sameMarkers(current2, nextMarkers) ? current2 : nextMarkers);
    for (const element of document.querySelectorAll("[data-dsh-pin]")) {
      if (!marked.has(element)) delete element.dataset.dshPin;
    }
    for (const element of marked) element.dataset.dshPin = "";
  }, []);
  const scheduleMeasure = (0, import_react.useCallback)(() => {
    if (frame.current !== void 0) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = void 0;
      measure();
    });
  }, [measure]);
  (0, import_react.useEffect)(() => {
    scheduleMeasure();
  }, [pins, panelOpen, activeSessionId, scheduleMeasure]);
  (0, import_react.useEffect)(() => {
    const onResize = () => {
      scheduleMeasure();
    };
    const onScroll = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-dsh-pin-panel]") !== null) return;
      setHover(null);
      scheduleMeasure();
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll, true);
    const observer = new ResizeObserver(onResize);
    const scroller = chatScroller();
    if (scroller !== null) observer.observe(scroller);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onScroll, true);
      observer.disconnect();
    };
  }, [scheduleMeasure, activeSessionId]);
  (0, import_react.useEffect)(() => {
    const scroller = chatScroller();
    if (scroller === null) return;
    const observer = new MutationObserver(() => {
      if (mutationTimer.current !== void 0) window.clearTimeout(mutationTimer.current);
      mutationTimer.current = window.setTimeout(() => {
        scheduleMeasure();
      }, 120);
    });
    observer.observe(scroller, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      if (mutationTimer.current !== void 0) window.clearTimeout(mutationTimer.current);
    };
  }, [scheduleMeasure, activeSessionId]);
  (0, import_react.useEffect)(() => {
    if (activeSessionId === void 0) return;
    let showTimer;
    let hideTimer;
    const clearShow = () => {
      if (showTimer !== void 0) window.clearTimeout(showTimer);
      showTimer = void 0;
    };
    const clearHide = () => {
      if (hideTimer !== void 0) window.clearTimeout(hideTimer);
      hideTimer = void 0;
    };
    const hideNow = () => {
      clearShow();
      clearHide();
      setHover(null);
    };
    const scheduleHide = () => {
      clearShow();
      if (hideTimer !== void 0) return;
      hideTimer = window.setTimeout(() => {
        hideTimer = void 0;
        setHover(null);
      }, 220);
    };
    const onMove = (event) => {
      if (!(event.target instanceof Element)) {
        scheduleHide();
        return;
      }
      if (event.target.closest("[data-dsh-pin-ui]") !== null) {
        clearHide();
        return;
      }
      const scroller = chatScroller();
      if (scroller === null || !scroller.contains(event.target)) {
        lastBlockRef.current = null;
        scheduleHide();
        return;
      }
      if (event.target.closest(INTERACTIVE_SELECTOR) !== null) {
        lastBlockRef.current = null;
        scheduleHide();
        return;
      }
      if (event.target.closest("[data-text-interaction-surface]") !== null) {
        scheduleHide();
        return;
      }
      const flow = event.target.closest("[data-chat-flow-key]");
      if (flow === null || !scroller.contains(flow)) {
        scheduleHide();
        return;
      }
      const block = nearestBlock(event.target, flow);
      if (block === null) {
        const current2 = hoverRef.current;
        if (current2 !== null) {
          const rect = current2.block.getBoundingClientRect();
          if (event.clientX >= rect.left - 48 && event.clientX <= rect.right + 8 && event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8) {
            clearHide();
            return;
          }
        }
        scheduleHide();
        return;
      }
      const flowKey = flow.dataset.chatFlowKey;
      if (flowKey === void 0 || flowKey === "") {
        scheduleHide();
        return;
      }
      clearHide();
      lastBlockRef.current = { block, flowKey };
      const current = hoverRef.current;
      if (current?.block === block) return;
      clearShow();
      showTimer = window.setTimeout(() => {
        showTimer = void 0;
        const text = normalizeSpace(elementText(block));
        setHover({
          block,
          flowKey,
          rect: block.getBoundingClientRect(),
          label: firstGraphemes(text, LABEL_LENGTH) || copy.title
        });
      }, 90);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        hideNow();
        lastBlockRef.current = null;
        setPanelOpen(false);
        setClearArmed(false);
        return;
      }
      if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && (event.code === "KeyP" || event.key.toLowerCase() === "p")) {
        const overOutput = hoverRef.current !== null || lastBlockRef.current !== null;
        if (isEditable(event.target) && !overOutput) return;
        event.preventDefault();
        setPanelOpen((open) => !open);
        setClearArmed(false);
        hideNow();
      }
    };
    const onLeave = (event) => {
      if (event.relatedTarget === null) {
        hideNow();
        lastBlockRef.current = null;
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mouseout", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mouseout", onLeave);
      clearShow();
      clearHide();
    };
  }, [activeSessionId, copy.title]);
  const flash = (0, import_react.useCallback)((block) => {
    if (flashTimer.current !== void 0) window.clearTimeout(flashTimer.current);
    document.querySelectorAll("[data-dsh-pin-flash]").forEach((element) => {
      delete element.dataset.dshPinFlash;
    });
    block.dataset.dshPinFlash = "";
    flashTimer.current = window.setTimeout(() => {
      delete block.dataset.dshPinFlash;
    }, 1550);
  }, []);
  const addPin = (0, import_react.useCallback)((block, flowKey) => {
    if (activeSessionId === void 0) return;
    const text = normalizeSpace(elementText(block));
    if (text === "") return;
    const label = firstGraphemes(text, LABEL_LENGTH) || copy.title;
    const flow = block.closest("[data-chat-flow-key]");
    const directFlowKey = flow?.dataset.chatFlowKey ?? flowKey;
    const blocks = flow === null ? [] : collectBlocks(flow);
    const blockIndex = Math.max(0, blocks.indexOf(block));
    const existing = pinsRef.current.find((pin2) => pin2.flowKey === directFlowKey && pin2.blockIndex === blockIndex && pin2.text.slice(0, 80) === text.slice(0, 80));
    if (existing !== void 0) {
      setActivePinId(existing.id);
      showToast(copy.alreadyPinned);
      setPanelOpen(true);
      setHover(null);
      return;
    }
    const anchorSeq = anchorSeqFor(activeSessionId, directFlowKey);
    const turnValue = block.closest("[data-chat-turn]")?.dataset.chatTurn;
    const turn = turnValue === void 0 ? void 0 : Number(turnValue);
    const pin = {
      id: newPinId(),
      sessionId: activeSessionId,
      flowKey: directFlowKey,
      nodeKey: nodeKeyOf(directFlowKey),
      blockIndex,
      tag: block.tagName.toLowerCase(),
      label,
      text: text.slice(0, PIN_TEXT_LIMIT),
      createdAt: Date.now(),
      ...turn === void 0 || !Number.isSafeInteger(turn) || turn < 0 ? {} : { turn },
      ...anchorSeq === void 0 ? {} : { anchorSeq }
    };
    commitPins([...pinsRef.current, pin].slice(-MAX_PINS));
    flash(block);
    setActivePinId(pin.id);
    setHover(null);
    showToast(copy.pinned(label));
    scheduleMeasure();
  }, [activeSessionId, anchorSeqFor, commitPins, copy, flash, scheduleMeasure, showToast]);
  (0, import_react.useEffect)(() => {
    const onKeyDown = (event) => {
      if (!event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return;
      if (event.code !== "KeyP" && event.key.toLowerCase() !== "p") return;
      const target = hoverRef.current ?? lastBlockRef.current;
      if (target === null || !target.block.isConnected) {
        if (isEditable(event.target)) return;
        showToast(copy.pinNeedHover);
        return;
      }
      event.preventDefault();
      addPin(target.block, target.flowKey);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [addPin, copy.pinNeedHover, showToast]);
  const removePin = (0, import_react.useCallback)((id) => {
    commitPins(pinsRef.current.filter((pin) => pin.id !== id));
    setActivePinId((current) => current === id ? null : current);
    setClearArmed(false);
    showToast(copy.removed);
    scheduleMeasure();
  }, [commitPins, copy.removed, scheduleMeasure, showToast]);
  const clearPins = (0, import_react.useCallback)(() => {
    if (!clearArmed) {
      setClearArmed(true);
      window.setTimeout(() => {
        setClearArmed(false);
      }, 2600);
      return;
    }
    commitPins([]);
    setActivePinId(null);
    setClearArmed(false);
    scheduleMeasure();
  }, [clearArmed, commitPins, scheduleMeasure]);
  const goToPin = (0, import_react.useCallback)(async (pin, retry = 0) => {
    setActivePinId(pin.id);
    setHover(null);
    setClearArmed(false);
    const revealTarget = (block, hidden = false) => {
      setPanelOpen(false);
      const scroller2 = chatScroller();
      if (scroller2 === null) {
        block.scrollIntoView({ behavior: "smooth", block: "center" });
        flash(block);
        return;
      }
      if (hidden) {
        block.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          const rect2 = block.getBoundingClientRect();
          const view = scroller2.getBoundingClientRect();
          const onScreen = rect2.width > 0 && rect2.height > 0 && rect2.bottom > view.top + 4 && rect2.top < view.bottom - 4;
          if (onScreen && !isFoldedBlock(block)) flash(block);
          else showToast(copy.jumpHidden);
        }, 450);
        return;
      }
      try {
        scroller2.dispatchEvent(new WheelEvent("wheel", { deltaY: -1, bubbles: true, cancelable: true }));
      } catch {
      }
      const scrollerRect = scroller2.getBoundingClientRect();
      const rect = block.getBoundingClientRect();
      const visible = rect.top >= scrollerRect.top + 8 && rect.bottom <= scrollerRect.bottom - 8;
      if (!visible) {
        const target = scroller2.scrollTop + rect.top - scrollerRect.top - Math.max(32, scroller2.clientHeight * 0.28);
        scroller2.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      }
      flash(block);
      window.setTimeout(() => {
        const after = block.getBoundingClientRect();
        const view = scroller2.getBoundingClientRect();
        if (after.bottom <= view.top + 8 || after.top >= view.bottom - 8) {
          const target = scroller2.scrollTop + after.top - view.top - Math.max(32, scroller2.clientHeight * 0.28);
          scroller2.scrollTo({ top: Math.max(0, target), behavior: "auto" });
        }
      }, 650);
    };
    const turn = pinTurn(pin);
    const scroller = chatScroller();
    const immediate = scroller === null ? null : resolveBlock(scroller, pin);
    if (immediate !== null) {
      if (scroller !== null && isFoldedBlock(immediate)) {
        if (retry < 2 && turn !== void 0 && expandTurn(scroller, turn)) {
          window.setTimeout(() => {
            void goToPin(pin, retry + 1);
          }, 380);
          return;
        }
        revealTarget(immediate, true);
        return;
      }
      revealTarget(immediate);
      return;
    }
    const jumped = await jumpTo(pin);
    if (!jumped) {
      showToast(copy.jumpMissing);
      return;
    }
    const started = performance.now();
    let expands = 0;
    const poll = () => {
      const current = chatScroller();
      if (current !== null) {
        const block = resolveBlock(current, pin);
        if (block !== null) {
          if (isFoldedBlock(block)) {
            if (expands < 2 && turn !== void 0 && expandTurn(current, turn)) {
              expands += 1;
              window.setTimeout(poll, 380);
              return;
            }
            revealTarget(block, true);
            return;
          }
          revealTarget(block);
          return;
        }
        const hidden = resolveAnyBlock(current, pin);
        if (hidden !== null) {
          if (expands < 2 && turn !== void 0 && expandTurn(current, turn)) {
            expands += 1;
            window.setTimeout(poll, 380);
            return;
          }
          revealTarget(hidden, true);
          return;
        }
        if (expands < 2 && turn !== void 0 && expandTurn(current, turn)) {
          expands += 1;
          window.setTimeout(poll, 380);
          return;
        }
      }
      if (performance.now() - started < 4e3) {
        window.setTimeout(poll, 120);
        return;
      }
      showToast(copy.jumpMissing);
    };
    window.setTimeout(poll, 30);
  }, [copy.jumpHidden, copy.jumpMissing, flash, jumpTo, showToast]);
  const onTriggerClick = (0, import_react.useCallback)((event) => {
    event.preventDefault();
    event.stopPropagation();
    const target = hoverRef.current;
    if (target !== null) addPin(target.block, target.flowKey);
  }, [addPin]);
  (0, import_react.useEffect)(() => {
    if (!panelOpen) return;
    const onPointerDown = (event) => {
      if (!(event.target instanceof Node)) return;
      if (panelRef.current?.contains(event.target) === true) return;
      if (toggleRef.current?.contains(event.target) === true) return;
      if (event.target instanceof Element && event.target.closest("[data-dsh-pin-ui]") !== null) return;
      setPanelOpen(false);
      setClearArmed(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [panelOpen]);
  if (activeSessionId === void 0) return null;
  const triggerPosition = (() => {
    if (hover === null || chatRect === null) return null;
    if (!hover.block.isConnected) return null;
    const rect = hover.block.getBoundingClientRect();
    if (rect.bottom < chatRect.top || rect.top > chatRect.bottom) return null;
    let left = rect.left - 34;
    if (left < chatRect.left + 8) left = rect.right - 34;
    return {
      top: clamp(rect.top - 2, chatRect.top + 4, chatRect.bottom - 32),
      left: clamp(left, chatRect.left + 8, chatRect.right - 34)
    };
  })();
  const panelStyle = chatRect === null ? void 0 : {
    right: `calc(100vw - ${Math.round(chatRect.right)}px + 16px)`,
    top: `${Math.round(Math.max(chatRect.top + 16, 64))}px`,
    width: `${Math.round(clamp(chatRect.width - 32, 248, 320))}px`,
    maxHeight: `${Math.round(Math.max(220, chatRect.height - 32))}px`
  };
  const toggleStyle = chatRect === null ? { display: "none" } : {
    right: `calc(100vw - ${Math.round(chatRect.right)}px + 14px)`,
    top: `${Math.round(Math.max(chatRect.top + 14, 62))}px`
  };
  const toastStyle = chatRect === null ? { display: "none" } : {
    left: `${Math.round(chatRect.left + chatRect.width / 2)}px`,
    top: `${Math.round(Math.max(chatRect.top + 16, 66))}px`
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pins-root", "data-dsh-pin-ui": "root", children: [
    chatRect !== null && !panelOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        ref: toggleRef,
        type: "button",
        className: "dsh-pins-toggle dsh-pins-ui",
        style: toggleStyle,
        "data-open": panelOpen ? "true" : "false",
        "aria-label": copy.title,
        "aria-expanded": panelOpen,
        title: `${copy.title} \xB7 ${copy.panelShortcut}`,
        "aria-keyshortcuts": "Alt+Shift+P",
        onClick: () => {
          setPanelOpen((open) => !open);
          setClearArmed(false);
          setHover(null);
        },
        children: [
          pinIcon(16),
          pins.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-count", children: pins.length > 99 ? "99+" : pins.length })
        ]
      }
    ),
    triggerPosition !== null && hover !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "dsh-pins-triggerSlot dsh-pins-ui",
        style: { top: `${Math.round(triggerPosition.top)}px`, left: `${Math.round(triggerPosition.left)}px` },
        "data-dsh-pin-trigger": "",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-pins-trigger",
            "aria-label": `${copy.pinBlock} (${copy.pinShortcut})`,
            "aria-keyshortcuts": "Alt+P",
            title: `${copy.pinBlock} \xB7 ${copy.pinShortcut} \xB7 ${hover.label}`,
            onClick: onTriggerClick,
            children: pinIcon(14)
          }
        )
      }
    ),
    markers.map((marker) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: "dsh-pins-marker dsh-pins-ui",
        style: { top: `${Math.round(marker.top)}px`, left: `${Math.round(marker.left)}px` },
        "data-active": activePinId === marker.id ? "true" : void 0,
        "aria-label": `${copy.pinBlock}: ${marker.label}`,
        title: marker.label,
        onClick: () => {
          const pin = pinsRef.current.find((candidate) => candidate.id === marker.id);
          if (pin !== void 0) void goToPin(pin);
        },
        children: marker.index + 1
      },
      marker.id
    )),
    panelOpen && panelStyle !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: panelRef, className: "dsh-pins-panel dsh-pins-ui", style: panelStyle, "data-dsh-pin-panel": "", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pins-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-headMark", children: pinIcon(15) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-pins-headCopy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-title", children: copy.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-subtitle", children: pins.length === 0 ? copy.hint : copy.count(pins.length) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-pins-close",
            "aria-label": copy.close,
            onClick: () => {
              setPanelOpen(false);
              setClearArmed(false);
            },
            children: closeIcon()
          }
        )
      ] }),
      pins.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pins-empty", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-emptyIcon", children: pinIcon(18) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-emptyTitle", children: copy.emptyTitle }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-emptyHint", children: copy.emptyHint })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pins-list", children: pins.map((pin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pins-item", "data-active": activePinId === pin.id ? "true" : void 0, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsh-pins-itemMain", onClick: () => {
          void goToPin(pin);
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-num", children: index + 1 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-pins-itemCopy", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-label", children: pin.label }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pins-snippet", children: pin.text })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-pins-delete",
            "aria-label": copy.delete,
            title: copy.delete,
            onClick: () => {
              removePin(pin.id);
            },
            children: trashIcon()
          }
        )
      ] }, pin.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pins-foot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copy.panelHint }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-pins-footActions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "dsh-pins-lang",
              onClick: toggleLanguage,
              title: copy === ZH ? "Switch to English" : "\u5207\u6362\u5230\u4E2D\u6587",
              children: copy === ZH ? "EN" : "\u4E2D\u6587"
            }
          ),
          pins.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-pins-clear", onClick: clearPins, children: clearArmed ? copy.clearConfirm : copy.clear })
        ] })
      ] })
    ] }),
    toast !== null && chatRect !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pins-toast", style: toastStyle, role: "status", children: toast })
  ] });
}
function installStyle() {
  if (document.getElementById(STYLE_ID) !== null) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.dataset.plugin = PLUGIN_ID;
  style.textContent = CSS;
  document.head.append(style);
}
var inject = ["slots", "sessions", "locale", "uiSession", "uiConversation"];
function apply(ctx) {
  installStyle();
  const { host, dispose } = createPinHost(ctx);
  ctx.effect(() => () => {
    dispose();
  }, "conversation-pins: active Session source");
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay",
    id: "conversation-pins",
    order: 500,
    inject: () => ({
      hooks: { activeSessionId: host.source, pinLocale: host.locale },
      anchorSeqFor: host.anchorSeqFor,
      jumpTo: host.jumpTo
    })
  }, PinOverlay));
}

return module.exports;
} });
