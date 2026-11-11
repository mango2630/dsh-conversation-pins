/**
 * Conversation Pins — a Web client plugin for DeepSeek Harness.
 *
 * The browser half renders in the shell overlay, finds the active Chat target,
 * and lets the reader pin any block-level piece of rendered output. Pins are
 * stored per Session in localStorage, labelled with the first six visible
 * characters, and resolved back to their DOM block when the reader jumps.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

const PLUGIN_ID = 'dsh-conversation-pins'
const STYLE_ID = `${PLUGIN_ID}-style`
const STORAGE_PREFIX = 'dsh:conversation-pins:v1:'
const LANGUAGE_KEY = 'dsh:conversation-pins:language'
const MAX_PINS = 200
const PIN_TEXT_LIMIT = 600
const MAX_MARKERS = 80
const BLOCK_SELECTOR = 'p,li,h1,h2,h3,h4,h5,h6,blockquote,pre,td,th,dt,dd,figcaption'
const INTERACTIVE_SELECTOR = 'button,a,input,textarea,select,[contenteditable="true"],[contenteditable=""],[role="button"]'
const LABEL_LENGTH = 6

const CSS = `
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
.dsh-pins-delete { width: 26px; height: 26px; opacity: 0; }
.dsh-pins-close:hover, .dsh-pins-delete:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
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
`

interface Pin {
  readonly id: string
  readonly sessionId: string
  readonly flowKey: string
  readonly nodeKey: string
  readonly blockIndex: number
  readonly tag: string
  readonly label: string
  readonly text: string
  readonly createdAt: number
  readonly turn?: number
  readonly anchorSeq?: number
}

interface HoverTarget {
  readonly block: HTMLElement
  readonly flowKey: string
  readonly rect: DOMRect
  readonly label: string
}

interface MarkerLayout {
  readonly id: string
  readonly index: number
  readonly top: number
  readonly left: number
  readonly label: string
}

interface ChatRect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly width: number
  readonly height: number
}

interface Copy {
  readonly title: string
  readonly count: (n: number) => string
  readonly emptyTitle: string
  readonly emptyHint: string
  readonly hint: string
  readonly clear: string
  readonly clearConfirm: string
  readonly pinBlock: string
  readonly pinShortcut: string
  readonly panelShortcut: string
  readonly pinNeedHover: string
  readonly pinned: (label: string) => string
  readonly alreadyPinned: string
  readonly removed: string
  readonly jumpMissing: string
  readonly jumpHidden: string
  readonly close: string
  readonly delete: string
  readonly panelHint: string
}

const ZH: Copy = {
  title: '图钉',
  count: n => `${n} 个位置`,
  emptyTitle: '还没有图钉',
  emptyHint: '把鼠标移到任意一段输出上，按 Alt+P，或点击左侧图钉。',
  hint: '悬停输出，Alt+P 打钉',
  clear: '全部清除',
  clearConfirm: '再次点击确认清除',
  pinBlock: '在这里打一个图钉',
  pinShortcut: 'Alt + P',
  panelShortcut: 'Alt + Shift + P',
  pinNeedHover: '先把鼠标移到要固定的输出上，再按 Alt + P',
  pinned: label => `已固定「${label}」`,
  alreadyPinned: '这个位置已经固定过了',
  removed: '已移除图钉',
  jumpMissing: '找不到这个位置，可能还没加载到这段历史',
  jumpHidden: '这段内容当前被折叠了，展开对应的轮次后再点图钉',
  close: '关闭图钉面板',
  delete: '删除这个图钉',
  panelHint: 'Alt+P 打钉 · Alt+Shift+P 面板',
}

const EN: Copy = {
  title: 'Pins',
  count: n => `${n} ${n === 1 ? 'spot' : 'spots'}`,
  emptyTitle: 'No pins yet',
  emptyHint: 'Hover any part of the output, press Alt+P, or click the pin in the gutter.',
  hint: 'Hover output, Alt+P to pin',
  clear: 'Clear all',
  clearConfirm: 'Click again to clear',
  pinBlock: 'Pin this block',
  pinShortcut: 'Alt + P',
  panelShortcut: 'Alt + Shift + P',
  pinNeedHover: 'Hover the output you want to pin first, then press Alt + P',
  pinned: label => `Pinned “${label}”`,
  alreadyPinned: 'This spot is already pinned',
  removed: 'Pin removed',
  jumpMissing: 'Could not find this spot; its history may not be loaded',
  jumpHidden: 'This content is folded right now. Expand its turn, then try the pin again.',
  close: 'Close pins',
  delete: 'Delete this pin',
  panelHint: 'Alt+P pin · Alt+Shift+P panel',
}

function copyFor(language: string): Copy {
  return language.toLowerCase().startsWith('zh') ? ZH : EN
}

function pinIcon(size = 15): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 3.5h6l-.9 4.7 3.4 3.7v2.3H6.5v-2.3l3.4-3.7L9 3.5Z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 14.2v6.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function closeIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function trashIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M9 7V5h6v2m-8 0 .8 12h8.4L17 7M10 11v5m4-5v5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function normalizeSpace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim()
}

function firstGraphemes(value: string, count: number): string {
  const normalized = normalizeSpace(value)
  if (normalized === '') return ''
  const Segmenter = (Intl as unknown as {
    Segmenter?: new (locale?: string, options?: { granularity: 'grapheme' }) => {
      segment(input: string): Iterable<{ segment: string }>
    }
  }).Segmenter
  if (Segmenter === undefined) return Array.from(normalized).slice(0, count).join('')
  const out: string[] = []
  for (const part of new Segmenter(undefined, { granularity: 'grapheme' }).segment(normalized)) {
    out.push(part.segment)
    if (out.length === count) break
  }
  return out.join('')
}

function elementText(element: HTMLElement): string {
  const value = element.innerText
  return typeof value === 'string' ? value.trim() : (element.textContent ?? '').trim()
}

function isRendered(element: HTMLElement): boolean {
  if (element.hidden || element.closest('[hidden]') !== null) return false
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const editable = target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]')
  return editable !== null
}

function chatScroller(): HTMLElement | null {
  let best: { element: HTMLElement; area: number } | null = null
  for (const candidate of document.querySelectorAll<HTMLElement>('[data-conversation-scroll]')) {
    const flow = candidate.querySelector('[data-chat-flow]')
    if (flow === null) continue
    const rect = candidate.getBoundingClientRect()
    const area = rect.width * rect.height
    if (rect.width <= 0 || rect.height <= 0 || area <= 0) continue
    if (best === null || area > best.area) best = { element: candidate, area }
  }
  if (best !== null) return best.element
  return document.querySelector<HTMLElement>('[data-chat-flow]')?.closest<HTMLElement>('[data-conversation-scroll]') ?? null
}

function chatFlow(scroller: HTMLElement): HTMLElement | null {
  return scroller.querySelector<HTMLElement>('[data-chat-flow]')
}

function cssEscape(value: string): string {
  return globalThis.CSS?.escape?.(value) ?? value.replace(/["\\]/gu, '\\$&')
}

function flowElement(scroller: HTMLElement, flowKey: string): HTMLElement | null {
  const flow = chatFlow(scroller)
  if (flow === null) return null
  const direct = flow.querySelector<HTMLElement>(`[data-chat-flow-key="${cssEscape(flowKey)}"]`)
  if (direct !== null) return direct
  for (const element of flow.querySelectorAll<HTMLElement>('[data-chat-flow-key]')) {
    if (element.dataset.chatFlowKey === flowKey) return element
  }
  return null
}

function nearestBlock(target: EventTarget | null, flow: HTMLElement): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const block = target.closest<HTMLElement>(BLOCK_SELECTOR)
  if (block === null || !flow.contains(block)) return null
  if (block.closest(INTERACTIVE_SELECTOR) !== null) return null
  if (normalizeSpace(elementText(block)) === '') return null
  return block
}

function collectBlocks(flow: HTMLElement, renderedOnly = true): HTMLElement[] {
  const blocks: HTMLElement[] = []
  for (const element of flow.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)) {
    if (!flow.contains(element)) continue
    if (renderedOnly && !isRendered(element)) continue
    if (element.closest(INTERACTIVE_SELECTOR) !== null) continue
    if (normalizeSpace(elementText(element)) === '') continue
    blocks.push(element)
  }
  return blocks
}

function nodeKeyOf(flowKey: string): string {
  if (!flowKey.startsWith('[')) return flowKey
  try {
    const parsed: unknown = JSON.parse(flowKey)
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0]
  } catch {
    // A malformed flow key cannot identify a Chat node; use it verbatim.
  }
  return flowKey
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum))
}

function sameRect(left: ChatRect | null, right: ChatRect): boolean {
  return left !== null
    && Math.abs(left.left - right.left) < 0.5
    && Math.abs(left.top - right.top) < 0.5
    && Math.abs(left.right - right.right) < 0.5
    && Math.abs(left.bottom - right.bottom) < 0.5
}

function sameMarkers(left: readonly MarkerLayout[], right: readonly MarkerLayout[]): boolean {
  if (left.length !== right.length) return false
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a === undefined || b === undefined) return false
    if (a.id !== b.id || a.index !== b.index || a.label !== b.label) return false
    if (Math.abs(a.top - b.top) > 0.5 || Math.abs(a.left - b.left) > 0.5) return false
  }
  return true
}

function newPinId(): string {
  return `pin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function storageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}${sessionId}`
}

function readPins(sessionId: string): Pin[] {
  try {
    const raw = localStorage.getItem(storageKey(sessionId))
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const pins: Pin[] = []
    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue
      const record = entry as Record<string, unknown>
      if (typeof record.id !== 'string' || typeof record.flowKey !== 'string'
        || typeof record.label !== 'string' || typeof record.text !== 'string'
        || typeof record.createdAt !== 'number') continue
      const anchorSeq = typeof record.anchorSeq === 'number' && Number.isFinite(record.anchorSeq)
        ? record.anchorSeq
        : undefined
      const turn = typeof record.turn === 'number' && Number.isSafeInteger(record.turn) && record.turn >= 0
        ? record.turn
        : undefined
      pins.push({
        id: record.id,
        sessionId,
        flowKey: record.flowKey,
        nodeKey: typeof record.nodeKey === 'string' ? record.nodeKey : nodeKeyOf(record.flowKey),
        blockIndex: typeof record.blockIndex === 'number' && Number.isInteger(record.blockIndex)
          ? record.blockIndex
          : 0,
        tag: typeof record.tag === 'string' ? record.tag : '',
        label: record.label.slice(0, 24),
        text: record.text.slice(0, PIN_TEXT_LIMIT),
        createdAt: record.createdAt,
        ...(turn === undefined ? {} : { turn }),
        ...(anchorSeq === undefined ? {} : { anchorSeq }),
      })
      if (pins.length >= MAX_PINS) break
    }
    return pins
  } catch {
    return []
  }
}

function writePins(sessionId: string, pins: readonly Pin[]): void {
  try {
    localStorage.setItem(storageKey(sessionId), JSON.stringify(pins.slice(-MAX_PINS)))
  } catch {
    // Storage can be unavailable in a private or quota-exhausted window; the
    // in-memory list still works for this page.
  }
}

function resolveBlock(scroller: HTMLElement, pin: Pin): HTMLElement | null {
  const flow = flowElement(scroller, pin.flowKey)
  if (flow === null) return null
  const blocks = collectBlocks(flow)
  if (blocks.length === 0) return null
  const wanted = normalizeSpace(pin.text)
  const direct = blocks[pin.blockIndex]
  if (direct !== undefined) {
    const text = normalizeSpace(elementText(direct))
    if (text.startsWith(wanted.slice(0, 24)) || text.includes(wanted.slice(0, 24))) return direct
  }
  if (wanted.length > 0) {
    const exact = blocks.find((block) => normalizeSpace(elementText(block)) === wanted)
    if (exact !== undefined) return exact
    const prefix = blocks.find((block) => normalizeSpace(elementText(block)).startsWith(wanted.slice(0, 24)))
    if (prefix !== undefined) return prefix
  }
  return direct ?? null
}

/** Resolve a folded/hidden block when a normal visible lookup cannot. */
function resolveAnyBlock(scroller: HTMLElement, pin: Pin): HTMLElement | null {
  const flow = flowElement(scroller, pin.flowKey)
  if (flow === null) return null
  const blocks = collectBlocks(flow, false)
  if (blocks.length === 0) return null
  const wanted = normalizeSpace(pin.text)
  const direct = blocks[pin.blockIndex]
  if (direct !== undefined) {
    const text = normalizeSpace(elementText(direct))
    if (text.startsWith(wanted.slice(0, 24)) || text.includes(wanted.slice(0, 24))) return direct
  }
  if (wanted.length === 0) return direct ?? null
  return blocks.find((block) => normalizeSpace(elementText(block)) === wanted)
    ?? blocks.find((block) => normalizeSpace(elementText(block)).startsWith(wanted.slice(0, 24)))
    ?? direct
    ?? null
}

/** Whether a block sits inside a collapsed process body or a hidden ancestor. */
function isFoldedBlock(block: HTMLElement): boolean {
  for (let node = block.parentElement; node !== null && node !== document.body; node = node.parentElement) {
    if (node.hasAttribute('hidden')) return true
    if (node.matches('[data-step-process-body]') && node.getBoundingClientRect().height < 2) return true
  }
  return false
}

/** Turn number encoded by a pin's node key, when the older record lacks it. */
function pinTurn(pin: Pin): number | undefined {
  if (pin.turn !== undefined) return pin.turn
  const nodeKey = nodeKeyOf(pin.flowKey)
  const match = /^[^:]+:(\d+):/u.exec(nodeKey)
  if (match?.[1] === undefined) return undefined
  const turn = Number(match[1])
  return Number.isSafeInteger(turn) && turn >= 0 ? turn : undefined
}

/**
 * Open the visible disclosures for one Turn. A target inside a folded process
 * body still has layout, so a plain scroll would land on clipped content.
 */
function expandTurn(scroller: HTMLElement, turn: number): boolean {
  let changed = false
  const show = (button: HTMLButtonElement | null): void => {
    if (button === null || button.getAttribute('aria-expanded') !== 'false') return
    if (button.getClientRects().length === 0) return
    button.click()
    changed = true
  }
  for (const button of scroller.querySelectorAll<HTMLButtonElement>(`button[data-turn-process="${turn}"]`)) {
    show(button)
  }
  for (const group of scroller.querySelectorAll<HTMLElement>(`[data-chat-turn="${turn}"][data-step-process]`)) {
    show(group.querySelector<HTMLButtonElement>('button[aria-expanded="false"]'))
  }
  return changed
}

interface PinHost {
  readonly source: ObservableSnapshot<string | undefined>
  readonly locale: ObservableSnapshot<string>
  readonly anchorSeqFor: (sessionId: string, flowKey: string) => number | undefined
  readonly jumpTo: (pin: Pin) => Promise<boolean>
}

function createPinHost(ctx: Context): { host: PinHost; dispose: () => void } {
  let activeSession: string | undefined
  const listeners = new Set<() => void>()
  const source: ObservableSnapshot<string | undefined> = {
    getSnapshot: () => activeSession,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  const locale: ObservableSnapshot<string> = {
    getSnapshot: () => ctx.locale.getLocale().active,
    subscribe: (listener) => ctx.locale.subscribe(listener),
  }
  const publish = (next: string | undefined): void => {
    if (next === activeSession) return
    activeSession = next
    for (const listener of [...listeners]) listener()
  }

  const sync = (): void => {
    const binding = ctx.uiSession.adapter.current.getSnapshot()
    publish(binding.key as string | undefined)
  }
  const disposeSession = ctx.uiSession.adapter.current.subscribe(sync)
  sync()

  const anchorSeqFor = (sessionId: string, flowKey: string): number | undefined => {
    try {
      const chat = ctx.uiConversation.binding(sessionId as SessionId).target('chat').getSnapshot()
      return chat?.nodes.get(nodeKeyOf(flowKey))?.anchorSeq
    } catch {
      return undefined
    }
  }

  const jumpTo = async (pin: Pin): Promise<boolean> => {
    if (activeSession !== pin.sessionId) return false
    try {
      const binding = ctx.sessions.binding(pin.sessionId as SessionId)
      if (binding === undefined) return false
      let anchorSeq = pin.anchorSeq ?? anchorSeqFor(pin.sessionId, pin.flowKey)
      if (anchorSeq === undefined) {
        await binding.session.loadOlder()
        anchorSeq = anchorSeqFor(pin.sessionId, pin.flowKey)
      }
      // A load failure must not hide a target that is already in the DOM; the
      // reveal pass owns the final outcome.
      if (anchorSeq !== undefined) {
        try { await binding.session.loadThrough(anchorSeq) } catch { /* reveal still tries */ }
      }
      return true
    } catch {
      return false
    }
  }

  return {
    host: { source, locale, anchorSeqFor, jumpTo },
    dispose: () => {
      disposeSession()
      listeners.clear()
    },
  }
}

interface OverlayProps {
  readonly useActiveSessionId: <T>(selector: (value: string | undefined) => T) => T
  readonly usePinLocale: <T>(selector: (value: string) => T) => T
  readonly anchorSeqFor: (sessionId: string, flowKey: string) => number | undefined
  readonly jumpTo: (pin: Pin) => Promise<boolean>
}

/**
 * Shell overlay UI. It owns only view state; pin persistence and history
 * loading cross the inject face above.
 * @param props - active Session hook and the two host actions.
 * @returns the global pin surface.
 */
export function PinOverlay({ useActiveSessionId, usePinLocale, anchorSeqFor, jumpTo }: OverlayProps): ReactElement | null {
  const activeSessionId = useActiveSessionId(value => value)
  const locale = usePinLocale(value => value)
  const [language, setLanguage] = useState<'zh' | 'en' | null>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY)
      return stored === 'zh' || stored === 'en' ? stored : null
    } catch {
      return null
    }
  })
  const copy = useMemo(() => copyFor(language ?? locale), [language, locale])
  const toggleLanguage = useCallback(() => {
    const next = copy === ZH ? 'en' : 'zh'
    setLanguage(next)
    try { localStorage.setItem(LANGUAGE_KEY, next) } catch {
      // The choice remains in memory when storage is unavailable.
    }
  }, [copy])
  const [pins, setPins] = useState<Pin[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [hover, setHover] = useState<HoverTarget | null>(null)
  const [markers, setMarkers] = useState<MarkerLayout[]>([])
  const [chatRect, setChatRect] = useState<ChatRect | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [activePinId, setActivePinId] = useState<string | null>(null)
  const [clearArmed, setClearArmed] = useState(false)

  const pinsRef = useRef<Pin[]>([])
  const chatRectRef = useRef<ChatRect | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const hoverRef = useRef<HoverTarget | null>(null)
  const lastBlockRef = useRef<{ block: HTMLElement; flowKey: string } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const flashTimer = useRef<number | undefined>(undefined)
  const frame = useRef<number | undefined>(undefined)
  const mutationTimer = useRef<number | undefined>(undefined)

  pinsRef.current = pins
  chatRectRef.current = chatRect
  hoverRef.current = hover

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => { setToast(null) }, 2400)
  }, [])

  const commitPins = useCallback((next: Pin[]) => {
    setPins(next)
    pinsRef.current = next
    if (activeSessionId !== undefined) writePins(activeSessionId, next)
  }, [activeSessionId])

  useEffect(() => {
    const next = activeSessionId === undefined ? [] : readPins(activeSessionId)
    setPins(next)
    pinsRef.current = next
    setPanelOpen(false)
    setHover(null)
    setMarkers([])
    setActivePinId(null)
    setClearArmed(false)
    lastBlockRef.current = null
  }, [activeSessionId])

  useEffect(() => () => {
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current)
    if (flashTimer.current !== undefined) window.clearTimeout(flashTimer.current)
    if (frame.current !== undefined) window.cancelAnimationFrame(frame.current)
    if (mutationTimer.current !== undefined) window.clearTimeout(mutationTimer.current)
    document.querySelectorAll('[data-dsh-pin]').forEach((element) => {
      delete (element as HTMLElement).dataset.dshPin
    })
    document.querySelectorAll('[data-dsh-pin-flash]').forEach((element) => {
      delete (element as HTMLElement).dataset.dshPinFlash
    })
  }, [])

  const measure = useCallback(() => {
    const scroller = chatScroller()
    if (scroller === null) {
      setChatRect(null)
      setMarkers([])
      return
    }
    const scrollerRect = scroller.getBoundingClientRect()
    const nextRect: ChatRect = {
      left: scrollerRect.left,
      top: scrollerRect.top,
      right: scrollerRect.right,
      bottom: scrollerRect.bottom,
      width: scrollerRect.width,
      height: scrollerRect.height,
    }
    setChatRect(current => sameRect(current, nextRect) ? current : nextRect)

    const nextMarkers: MarkerLayout[] = []
    const marked = new Set<HTMLElement>()
    const stack = new Map<HTMLElement, number>()
    const current = pinsRef.current.slice(0, MAX_MARKERS)
    for (const [index, pin] of current.entries()) {
      const block = resolveBlock(scroller, pin)
      if (block === null) continue
      const rect = block.getBoundingClientRect()
      if (rect.bottom < scrollerRect.top || rect.top > scrollerRect.bottom) continue
      marked.add(block)
      const depth = stack.get(block) ?? 0
      stack.set(block, depth + 1)
      // Keep every marker in the text column's left rail. A table cell or an
      // indented list item must not pull its marker into the content.
      const contentLeft = flowElement(scroller, pin.flowKey)?.getBoundingClientRect().left ?? rect.left
      const left = clamp(contentLeft - 29, scrollerRect.left + 8, scrollerRect.right - 22)
      const top = clamp(rect.top + 2 + depth * 22, scrollerRect.top + 4, scrollerRect.bottom - 26)
      nextMarkers.push({ id: pin.id, index, top, left, label: pin.label })
    }
    setMarkers(current => sameMarkers(current, nextMarkers) ? current : nextMarkers)

    for (const element of document.querySelectorAll<HTMLElement>('[data-dsh-pin]')) {
      if (!marked.has(element)) delete element.dataset.dshPin
    }
    for (const element of marked) element.dataset.dshPin = ''
  }, [])

  const scheduleMeasure = useCallback(() => {
    if (frame.current !== undefined) return
    frame.current = window.requestAnimationFrame(() => {
      frame.current = undefined
      measure()
    })
  }, [measure])

  useEffect(() => {
    scheduleMeasure()
  }, [pins, panelOpen, activeSessionId, scheduleMeasure])

  useEffect(() => {
    const onResize = (): void => { scheduleMeasure() }
    const onScroll = (event: Event): void => {
      if (event.target instanceof Element && event.target.closest('[data-dsh-pin-panel]') !== null) return
      setHover(null)
      scheduleMeasure()
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('scroll', onScroll, true)
    const observer = new ResizeObserver(onResize)
    const scroller = chatScroller()
    if (scroller !== null) observer.observe(scroller)
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('scroll', onScroll, true)
      observer.disconnect()
    }
  }, [scheduleMeasure, activeSessionId])

  useEffect(() => {
    const scroller = chatScroller()
    if (scroller === null) return
    const observer = new MutationObserver(() => {
      if (mutationTimer.current !== undefined) window.clearTimeout(mutationTimer.current)
      mutationTimer.current = window.setTimeout(() => { scheduleMeasure() }, 120)
    })
    observer.observe(scroller, { subtree: true, childList: true, characterData: true })
    return () => {
      observer.disconnect()
      if (mutationTimer.current !== undefined) window.clearTimeout(mutationTimer.current)
    }
  }, [scheduleMeasure, activeSessionId])

  useEffect(() => {
    if (activeSessionId === undefined) return
    let showTimer: number | undefined
    let hideTimer: number | undefined
    const clearShow = (): void => {
      if (showTimer !== undefined) window.clearTimeout(showTimer)
      showTimer = undefined
    }
    const clearHide = (): void => {
      if (hideTimer !== undefined) window.clearTimeout(hideTimer)
      hideTimer = undefined
    }
    const hideNow = (): void => {
      clearShow()
      clearHide()
      setHover(null)
    }
    const scheduleHide = (): void => {
      clearShow()
      if (hideTimer !== undefined) return
      hideTimer = window.setTimeout(() => {
        hideTimer = undefined
        setHover(null)
      }, 220)
    }
    const onMove = (event: PointerEvent): void => {
      if (!(event.target instanceof Element)) { scheduleHide(); return }
      // The trigger wrapper overlaps the text edge, so crossing the gutter
      // stays inside our UI and never drops the hover intent.
      if (event.target.closest('[data-dsh-pin-ui]') !== null) { clearHide(); return }
      const scroller = chatScroller()
      if (scroller === null || !scroller.contains(event.target)) {
        lastBlockRef.current = null
        scheduleHide()
        return
      }
      if (event.target.closest(INTERACTIVE_SELECTOR) !== null) {
        // Moving into the composer or another control drops the remembered
        // block, so a stale shortcut cannot pin something the pointer left.
        lastBlockRef.current = null
        scheduleHide()
        return
      }
      if (event.target.closest('[data-text-interaction-surface]') !== null) { scheduleHide(); return }
      const flow = event.target.closest<HTMLElement>('[data-chat-flow-key]')
      if (flow === null || !scroller.contains(flow)) { scheduleHide(); return }
      const block = nearestBlock(event.target, flow)
      if (block === null) {
        // A block's pin sits in the left gutter. Keep the hover alive while
        // the pointer crosses that gutter at any height inside the block, not
        // only while it happens to be on the 26px button.
        const current = hoverRef.current
        if (current !== null) {
          const rect = current.block.getBoundingClientRect()
          if (event.clientX >= rect.left - 48 && event.clientX <= rect.right + 8
            && event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8) {
            clearHide()
            return
          }
        }
        scheduleHide()
        return
      }
      const flowKey = flow.dataset.chatFlowKey
      if (flowKey === undefined || flowKey === '') { scheduleHide(); return }
      clearHide()
      lastBlockRef.current = { block, flowKey }
      const current = hoverRef.current
      if (current?.block === block) return
      clearShow()
      showTimer = window.setTimeout(() => {
        showTimer = undefined
        const text = normalizeSpace(elementText(block))
        setHover({
          block,
          flowKey,
          rect: block.getBoundingClientRect(),
          label: firstGraphemes(text, LABEL_LENGTH) || copy.title,
        })
      }, 90)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        hideNow()
        lastBlockRef.current = null
        setPanelOpen(false)
        setClearArmed(false)
        return
      }
      if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey
        && (event.code === 'KeyP' || event.key.toLowerCase() === 'p')) {
        const overOutput = hoverRef.current !== null || lastBlockRef.current !== null
        if (isEditable(event.target) && !overOutput) return
        event.preventDefault()
        setPanelOpen(open => !open)
        setClearArmed(false)
        hideNow()
      }
    }
    const onLeave = (event: MouseEvent): void => {
      if (event.relatedTarget === null) {
        hideNow()
        lastBlockRef.current = null
      }
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mouseout', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mouseout', onLeave)
      clearShow()
      clearHide()
    }
  }, [activeSessionId, copy.title])

  const flash = useCallback((block: HTMLElement) => {
    if (flashTimer.current !== undefined) window.clearTimeout(flashTimer.current)
    document.querySelectorAll('[data-dsh-pin-flash]').forEach((element) => {
      delete (element as HTMLElement).dataset.dshPinFlash
    })
    block.dataset.dshPinFlash = ''
    flashTimer.current = window.setTimeout(() => { delete block.dataset.dshPinFlash }, 1550)
  }, [])

  const addPin = useCallback((block: HTMLElement, flowKey: string) => {
    if (activeSessionId === undefined) return
    const text = normalizeSpace(elementText(block))
    if (text === '') return
    const label = firstGraphemes(text, LABEL_LENGTH) || copy.title
    const flow = block.closest<HTMLElement>('[data-chat-flow-key]')
    const directFlowKey = flow?.dataset.chatFlowKey ?? flowKey
    const blocks = flow === null ? [] : collectBlocks(flow)
    const blockIndex = Math.max(0, blocks.indexOf(block))
    const existing = pinsRef.current.find(pin => pin.flowKey === directFlowKey
      && pin.blockIndex === blockIndex
      && pin.text.slice(0, 80) === text.slice(0, 80))
    if (existing !== undefined) {
      setActivePinId(existing.id)
      showToast(copy.alreadyPinned)
      setPanelOpen(true)
      setHover(null)
      return
    }
    const anchorSeq = anchorSeqFor(activeSessionId, directFlowKey)
    const turnValue = block.closest<HTMLElement>('[data-chat-turn]')?.dataset.chatTurn
    const turn = turnValue === undefined ? undefined : Number(turnValue)
    const pin: Pin = {
      id: newPinId(),
      sessionId: activeSessionId,
      flowKey: directFlowKey,
      nodeKey: nodeKeyOf(directFlowKey),
      blockIndex,
      tag: block.tagName.toLowerCase(),
      label,
      text: text.slice(0, PIN_TEXT_LIMIT),
      createdAt: Date.now(),
      ...(turn === undefined || !Number.isSafeInteger(turn) || turn < 0 ? {} : { turn }),
      ...(anchorSeq === undefined ? {} : { anchorSeq }),
    }
    commitPins([...pinsRef.current, pin].slice(-MAX_PINS))
    flash(block)
    setActivePinId(pin.id)
    setHover(null)
    showToast(copy.pinned(label))
    scheduleMeasure()
  }, [activeSessionId, anchorSeqFor, commitPins, copy, flash, scheduleMeasure, showToast])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return
      if (event.code !== 'KeyP' && event.key.toLowerCase() !== 'p') return
      const target = hoverRef.current ?? lastBlockRef.current
      if (target === null || !target.block.isConnected) {
        // The composer normally keeps focus while reading. Only explain when
        // the key was not ordinary typing, and never steal π / ∏ input.
        if (isEditable(event.target)) return
        showToast(copy.pinNeedHover)
        return
      }
      // A valid hovered block is explicit intent even when the composer still
      // owns focus, so the shortcut works without clicking back into the flow.
      event.preventDefault()
      addPin(target.block, target.flowKey)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [addPin, copy.pinNeedHover, showToast])

  const removePin = useCallback((id: string) => {
    commitPins(pinsRef.current.filter(pin => pin.id !== id))
    setActivePinId(current => current === id ? null : current)
    setClearArmed(false)
    showToast(copy.removed)
    scheduleMeasure()
  }, [commitPins, copy.removed, scheduleMeasure, showToast])

  const clearPins = useCallback(() => {
    if (!clearArmed) {
      setClearArmed(true)
      window.setTimeout(() => { setClearArmed(false) }, 2600)
      return
    }
    commitPins([])
    setActivePinId(null)
    setClearArmed(false)
    scheduleMeasure()
  }, [clearArmed, commitPins, scheduleMeasure])

  const goToPin = useCallback(async (pin: Pin, retry = 0) => {
    setActivePinId(pin.id)
    setHover(null)
    setClearArmed(false)

    const revealTarget = (block: HTMLElement, hidden = false): void => {
      setPanelOpen(false)
      const scroller = chatScroller()
      if (scroller === null) {
        block.scrollIntoView({ behavior: 'smooth', block: 'center' })
        flash(block)
        return
      }
      if (hidden) {
        // A hidden="until-found" ancestor is revealed by the browser's own
        // scrollIntoView path; display:none cannot be, and gets a clear notice.
        block.scrollIntoView({ behavior: 'smooth', block: 'center' })
        window.setTimeout(() => {
          const rect = block.getBoundingClientRect()
          const view = scroller.getBoundingClientRect()
          const onScreen = rect.width > 0 && rect.height > 0
            && rect.bottom > view.top + 4 && rect.top < view.bottom - 4
          if (onScreen && !isFoldedBlock(block)) flash(block)
          else showToast(copy.jumpHidden)
        }, 450)
        return
      }
      // Leave tail-follow before moving the viewport. DSH otherwise treats a
      // programmatic scroll as content movement and can pull the reader back.
      try {
        scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true }))
      } catch {
        // Older engines without a WheelEvent constructor still get the direct scroll.
      }
      const scrollerRect = scroller.getBoundingClientRect()
      const rect = block.getBoundingClientRect()
      const visible = rect.top >= scrollerRect.top + 8 && rect.bottom <= scrollerRect.bottom - 8
      if (!visible) {
        const target = scroller.scrollTop + rect.top - scrollerRect.top
          - Math.max(32, scroller.clientHeight * 0.28)
        scroller.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
      }
      flash(block)
      // Smooth scrolling can be interrupted by a streaming render. Verify and
      // finish with an instant correction if the block did not land in view.
      window.setTimeout(() => {
        const after = block.getBoundingClientRect()
        const view = scroller.getBoundingClientRect()
        if (after.bottom <= view.top + 8 || after.top >= view.bottom - 8) {
          const target = scroller.scrollTop + after.top - view.top
            - Math.max(32, scroller.clientHeight * 0.28)
          scroller.scrollTo({ top: Math.max(0, target), behavior: 'auto' })
        }
      }, 650)
    }

    const turn = pinTurn(pin)

    // Prefer the loaded DOM. A history round-trip is unnecessary for the common
    // case and can be refused or delayed while the Session is streaming.
    const scroller = chatScroller()
    const immediate = scroller === null ? null : resolveBlock(scroller, pin)
    if (immediate !== null) {
      if (scroller !== null && isFoldedBlock(immediate)) {
        if (retry < 2 && turn !== undefined && expandTurn(scroller, turn)) {
          window.setTimeout(() => { void goToPin(pin, retry + 1) }, 380)
          return
        }
        revealTarget(immediate, true)
        return
      }
      revealTarget(immediate)
      return
    }

    const jumped = await jumpTo(pin)
    if (!jumped) {
      showToast(copy.jumpMissing)
      return
    }
    const started = performance.now()
    let expands = 0
    const poll = (): void => {
      const current = chatScroller()
      if (current !== null) {
        const block = resolveBlock(current, pin)
        if (block !== null) {
          if (isFoldedBlock(block)) {
            if (expands < 2 && turn !== undefined && expandTurn(current, turn)) {
              expands += 1
              window.setTimeout(poll, 380)
              return
            }
            revealTarget(block, true)
            return
          }
          revealTarget(block)
          return
        }
        const hidden = resolveAnyBlock(current, pin)
        if (hidden !== null) {
          if (expands < 2 && turn !== undefined && expandTurn(current, turn)) {
            expands += 1
            window.setTimeout(poll, 380)
            return
          }
          revealTarget(hidden, true)
          return
        }
        if (expands < 2 && turn !== undefined && expandTurn(current, turn)) {
          expands += 1
          window.setTimeout(poll, 380)
          return
        }
      }
      if (performance.now() - started < 4000) {
        window.setTimeout(poll, 120)
        return
      }
      showToast(copy.jumpMissing)
    }
    window.setTimeout(poll, 30)
  }, [copy.jumpHidden, copy.jumpMissing, flash, jumpTo, showToast])
  const onTriggerClick = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const target = hoverRef.current
    if (target !== null) addPin(target.block, target.flowKey)
  }, [addPin])

  useEffect(() => {
    if (!panelOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      if (!(event.target instanceof Node)) return
      if (panelRef.current?.contains(event.target) === true) return
      if (toggleRef.current?.contains(event.target) === true) return
      if ((event.target instanceof Element) && event.target.closest('[data-dsh-pin-ui]') !== null) return
      setPanelOpen(false)
      setClearArmed(false)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => { document.removeEventListener('pointerdown', onPointerDown, true) }
  }, [panelOpen])

  if (activeSessionId === undefined) return null

  const triggerPosition = (() => {
    if (hover === null || chatRect === null) return null
    if (!hover.block.isConnected) return null
    const rect = hover.block.getBoundingClientRect()
    if (rect.bottom < chatRect.top || rect.top > chatRect.bottom) return null
    // Sit immediately beside the block under the pointer. For a right-hand
    // table cell this is the neighbouring cell's edge, which is still far more
    // discoverable than the transcript's outer rail.
    let left = rect.left - 34
    if (left < chatRect.left + 8) left = rect.right - 34
    return {
      top: clamp(rect.top - 2, chatRect.top + 4, chatRect.bottom - 32),
      left: clamp(left, chatRect.left + 8, chatRect.right - 34),
    }
  })()

  const panelStyle = chatRect === null
    ? undefined
    : {
      right: `calc(100vw - ${Math.round(chatRect.right)}px + 16px)`,
      top: `${Math.round(Math.max(chatRect.top + 16, 64))}px`,
      width: `${Math.round(clamp(chatRect.width - 32, 248, 320))}px`,
      maxHeight: `${Math.round(Math.max(220, chatRect.height - 32))}px`,
    }

  const toggleStyle = chatRect === null
    ? { display: 'none' }
    : {
      right: `calc(100vw - ${Math.round(chatRect.right)}px + 14px)`,
      top: `${Math.round(Math.max(chatRect.top + 14, 62))}px`,
    }

  const toastStyle = chatRect === null
    ? { display: 'none' }
    : {
      left: `${Math.round(chatRect.left + chatRect.width / 2)}px`,
      top: `${Math.round(Math.max(chatRect.top + 16, 66))}px`,
    }

  return (
    <div className="dsh-pins-root" data-dsh-pin-ui="root">
      {chatRect !== null && !panelOpen && (
        <button
          ref={toggleRef}
          type="button"
          className="dsh-pins-toggle dsh-pins-ui"
          style={toggleStyle}
          data-open={panelOpen ? 'true' : 'false'}
          aria-label={copy.title}
          aria-expanded={panelOpen}
          title={`${copy.title} · ${copy.panelShortcut}`}
          aria-keyshortcuts="Alt+Shift+P"
          onClick={() => { setPanelOpen(open => !open); setClearArmed(false); setHover(null) }}
        >
          {pinIcon(16)}
          {pins.length > 0 && <span className="dsh-pins-count">{pins.length > 99 ? '99+' : pins.length}</span>}
        </button>
      )}

      {triggerPosition !== null && hover !== null && (
        <div
          className="dsh-pins-triggerSlot dsh-pins-ui"
          style={{ top: `${Math.round(triggerPosition.top)}px`, left: `${Math.round(triggerPosition.left)}px` }}
          data-dsh-pin-trigger=""
        >
          <button
            type="button"
            className="dsh-pins-trigger"
            aria-label={`${copy.pinBlock} (${copy.pinShortcut})`}
            aria-keyshortcuts="Alt+P"
            title={`${copy.pinBlock} · ${copy.pinShortcut} · ${hover.label}`}
            onClick={onTriggerClick}
          >
            {pinIcon(14)}
          </button>
        </div>
      )}

      {markers.map(marker => (
        <button
          key={marker.id}
          type="button"
          className="dsh-pins-marker dsh-pins-ui"
          style={{ top: `${Math.round(marker.top)}px`, left: `${Math.round(marker.left)}px` }}
          data-active={activePinId === marker.id ? 'true' : undefined}
          aria-label={`${copy.pinBlock}: ${marker.label}`}
          title={marker.label}
          onClick={() => {
            const pin = pinsRef.current.find(candidate => candidate.id === marker.id)
            if (pin !== undefined) void goToPin(pin)
          }}
        >
          {marker.index + 1}
        </button>
      ))}

      {panelOpen && panelStyle !== undefined && (
        <div ref={panelRef} className="dsh-pins-panel dsh-pins-ui" style={panelStyle} data-dsh-pin-panel="">
          <div className="dsh-pins-head">
            <span className="dsh-pins-headMark">{pinIcon(15)}</span>
            <span className="dsh-pins-headCopy">
              <span className="dsh-pins-title">{copy.title}</span>
              <span className="dsh-pins-subtitle">
                {pins.length === 0 ? copy.hint : copy.count(pins.length)}
              </span>
            </span>
            <button type="button" className="dsh-pins-close" aria-label={copy.close}
              onClick={() => { setPanelOpen(false); setClearArmed(false) }}>
              {closeIcon()}
            </button>
          </div>

          {pins.length === 0 ? (
            <div className="dsh-pins-empty">
              <span className="dsh-pins-emptyIcon">{pinIcon(18)}</span>
              <span className="dsh-pins-emptyTitle">{copy.emptyTitle}</span>
              <span className="dsh-pins-emptyHint">{copy.emptyHint}</span>
            </div>
          ) : (
            <div className="dsh-pins-list">
              {pins.map((pin, index) => (
                <div key={pin.id} className="dsh-pins-item" data-active={activePinId === pin.id ? 'true' : undefined}>
                  <button type="button" className="dsh-pins-itemMain" onClick={() => { void goToPin(pin) }}>
                    <span className="dsh-pins-num">{index + 1}</span>
                    <span className="dsh-pins-itemCopy">
                      <span className="dsh-pins-label">{pin.label}</span>
                      <span className="dsh-pins-snippet">{pin.text}</span>
                    </span>
                  </button>
                  <button type="button" className="dsh-pins-delete" aria-label={copy.delete}
                    onClick={() => { removePin(pin.id) }}>
                    {trashIcon()}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="dsh-pins-foot">
            <span>{copy.panelHint}</span>
            <span className="dsh-pins-footActions">
              <button type="button" className="dsh-pins-lang" onClick={toggleLanguage}
                title={copy === ZH ? 'Switch to English' : '切换到中文'}>
                {copy === ZH ? 'EN' : '中文'}
              </button>
              {pins.length > 0 && (
                <button type="button" className="dsh-pins-clear" onClick={clearPins}>
                  {clearArmed ? copy.clearConfirm : copy.clear}
                </button>
              )}
            </span>
          </div>
        </div>
      )}

      {toast !== null && chatRect !== null && (
        <div className="dsh-pins-toast" style={toastStyle} role="status">{toast}</div>
      )}
    </div>
  )
}

function installStyle(): void {
  if (document.getElementById(STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.dataset.plugin = PLUGIN_ID
  style.textContent = CSS
  document.head.append(style)
}

export const inject = ['slots', 'sessions', 'locale', 'uiSession', 'uiConversation']

/**
 * Install Conversation Pins into the Web shell.
 * @param ctx - Web client plugin context.
 */
export function apply(ctx: Context): void {
  installStyle()
  const { host, dispose } = createPinHost(ctx)
  ctx.effect(() => () => { dispose() }, 'conversation-pins: active Session source')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'conversation-pins',
    order: 500,
    inject: () => ({
      hooks: { activeSessionId: host.source, pinLocale: host.locale },
      anchorSeqFor: host.anchorSeqFor,
      jumpTo: host.jumpTo,
    }),
  }, PinOverlay))
}
