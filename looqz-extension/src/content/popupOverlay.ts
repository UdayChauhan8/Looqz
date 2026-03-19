import { extractProductImageUrl } from './extractProductImage';

// ─── Configuration ───────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:8000';
const SIDEBAR_WIDTH = 380;

// ─── Design Tokens (matching tailwind.config.ts) ─────────────────────────────
const COLORS = {
  bg:          '#0A0A0F',
  surface:     '#13131A',
  elevated:    '#1C1C26',
  border:      '#2A2A38',
  primary:     '#7C6FFF',
  primaryHover:'#9B90FF',
  textPrimary: '#F0EFFF',
  textSecondary:'#8B8AA8',
  success:     '#4ADE80',
  error:       '#F87171',
};

// ─── State ───────────────────────────────────────────────────────────────────
let popupContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;

type ViewState = 'upload' | 'generating' | 'result' | 'error';

let state = {
  view: 'upload' as ViewState,
  productImageUrl: null as string | null,
  userImageBlob: null as Blob | null,
  userImagePreviewUrl: null as string | null,
  resultImageUrl: null as string | null,
  resultImages: [] as string[],
  variantIndex: 0,
  sliderPos: 50,
  isGenerating: false,
  error: null as string | null,
  msgIndex: 0,
};

let msgInterval: ReturnType<typeof setInterval> | null = null;

const GENERATING_MESSAGES = [
  'Analyzing your photo…',
  'Fitting the garment…',
  'Rendering the result…',
  'Almost done…',
];

// ─── CSS ─────────────────────────────────────────────────────────────────────
function getStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      all: initial;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${COLORS.textPrimary};
    }

    .looqz-sidebar {
      position: fixed;
      top: 0;
      right: -${SIDEBAR_WIDTH}px;
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      background: ${COLORS.bg};
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
      border-left: 1px solid ${COLORS.border};
      transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .looqz-sidebar.open {
      right: 0;
    }

    /* ── Header ──────────────────────────── */
    .looqz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid ${COLORS.border};
      background: ${COLORS.bg};
      flex-shrink: 0;
    }

    .looqz-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 20px;
      color: ${COLORS.textPrimary};
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .looqz-logo-dot {
      width: 8px; height: 8px;
      background: ${COLORS.primary};
      border-radius: 50%;
      box-shadow: 0 0 10px ${COLORS.primary};
    }

    .looqz-close {
      width: 32px; height: 32px;
      background: ${COLORS.elevated};
      border: 1px solid ${COLORS.border};
      border-radius: 8px;
      color: ${COLORS.textSecondary};
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .looqz-close:hover {
      background: ${COLORS.border};
      color: ${COLORS.textPrimary};
    }

    /* ── Scrollable Content ──────────────── */
    .looqz-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .looqz-body::-webkit-scrollbar { width: 4px; }
    .looqz-body::-webkit-scrollbar-track { background: transparent; }
    .looqz-body::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }

    /* ── Section ──────────────────────────── */
    .looqz-section {
      margin-bottom: 20px;
    }

    .looqz-label {
      font-size: 13px;
      font-weight: 600;
      color: ${COLORS.textPrimary};
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ── Upload Area ──────────────────────── */
    .looqz-upload {
      border: 2px dashed ${COLORS.border};
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s;
      background: ${COLORS.surface};
      position: relative;
    }
    .looqz-upload:hover {
      border-color: ${COLORS.primary};
      background: ${COLORS.elevated};
    }
    .looqz-upload.has-image {
      border-color: ${COLORS.primary}40;
      border-style: solid;
      padding: 12px;
    }
    .looqz-upload-icon {
      width: 36px; height: 36px;
      margin: 0 auto 10px;
      color: ${COLORS.textSecondary};
      opacity: 0.6;
    }
    .looqz-upload-text {
      font-size: 13px;
      color: ${COLORS.textSecondary};
      margin-bottom: 4px;
    }
    .looqz-upload-hint {
      font-size: 11px;
      color: ${COLORS.textSecondary};
      opacity: 0.6;
    }

    /* preview row when image is loaded */
    .looqz-preview-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }
    .looqz-preview-thumb {
      width: 52px; height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${COLORS.border};
      flex-shrink: 0;
    }
    .looqz-preview-info {
      flex: 1;
      overflow: hidden;
      text-align: left;
    }
    .looqz-preview-name {
      font-size: 13px;
      font-weight: 600;
      color: ${COLORS.textPrimary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .looqz-preview-size {
      font-size: 11px;
      color: ${COLORS.textSecondary};
    }
    .looqz-preview-clear {
      width: 28px; height: 28px;
      background: ${COLORS.elevated};
      border: 1px solid ${COLORS.border};
      border-radius: 50%;
      color: ${COLORS.textSecondary};
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .looqz-preview-clear:hover {
      background: ${COLORS.error}20;
      color: ${COLORS.error};
      border-color: ${COLORS.error}40;
    }

    /* clothing preview */
    .looqz-clothing-img {
      max-width: 100%;
      max-height: 160px;
      border-radius: 8px;
      object-fit: contain;
    }

    /* ── Buttons ──────────────────────────── */
    .looqz-btn-primary {
      width: 100%;
      height: 48px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, ${COLORS.primary} 0%, #5B4FCC 100%);
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
      margin-top: 8px;
    }
    .looqz-btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px ${COLORS.primary}40;
    }
    .looqz-btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: ${COLORS.elevated};
      color: ${COLORS.textSecondary};
    }
    .looqz-btn-primary .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
      transform: translateX(-100%);
      animation: shimmer 2s infinite;
    }

    .looqz-btn-secondary {
      width: 100%;
      height: 44px;
      border: 1px solid ${COLORS.border};
      border-radius: 8px;
      background: ${COLORS.elevated};
      color: ${COLORS.textPrimary};
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .looqz-btn-secondary:hover {
      background: ${COLORS.primary};
      border-color: ${COLORS.primary};
      color: white;
    }

    .looqz-btn-text {
      background: none;
      border: none;
      color: ${COLORS.textSecondary};
      font-size: 13px;
      cursor: pointer;
      transition: color 0.2s;
      padding: 8px 0;
    }
    .looqz-btn-text:hover {
      color: ${COLORS.textPrimary};
    }

    .looqz-btn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .looqz-btn-grid .looqz-btn-secondary {
      height: 40px;
    }

    /* ── Generating View ──────────────────── */
    .looqz-generating {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      gap: 24px;
    }

    .looqz-gen-images {
      position: relative;
      width: 200px;
      height: 150px;
    }
    .looqz-gen-card {
      position: absolute;
      width: 48%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid ${COLORS.border};
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .looqz-gen-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .looqz-gen-card.left {
      left: 0;
      transform: rotate(-6deg) translateX(4px);
    }
    .looqz-gen-card.right {
      right: 0;
      transform: rotate(6deg) translateX(-4px);
    }
    .looqz-gen-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: ${COLORS.primary}15;
      mix-blend-mode: overlay;
    }

    .looqz-gen-orb {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      background: ${COLORS.bg};
      border-radius: 50%;
      box-shadow: 0 0 30px ${COLORS.primary}80;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }
    .looqz-gen-ping {
      width: 14px; height: 14px;
      background: ${COLORS.primary};
      border-radius: 50%;
      animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    .looqz-progress-bar {
      width: 100%;
      height: 3px;
      background: ${COLORS.elevated};
      border-radius: 3px;
      overflow: hidden;
    }
    .looqz-progress-fill {
      height: 100%;
      width: 33%;
      background: ${COLORS.primary};
      border-radius: 3px;
      animation: progress 1.5s ease-in-out infinite;
    }

    .looqz-gen-msg {
      font-size: 14px;
      font-weight: 500;
      color: ${COLORS.textPrimary};
      animation: pulse 2s ease-in-out infinite;
    }

    /* ── Result View ──────────────────────── */
    .looqz-result-header {
      text-align: center;
      margin-bottom: 12px;
    }
    .looqz-result-title {
      font-family: 'DM Serif Display', serif;
      font-size: 22px;
      color: ${COLORS.textPrimary};
    }
    .looqz-result-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      padding: 2px 10px;
      border-radius: 999px;
      background: ${COLORS.success}20;
      color: ${COLORS.success};
      font-size: 12px;
      font-weight: 500;
    }

    .looqz-slider-container {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
      border-radius: 12px;
      overflow: hidden;
      cursor: ew-resize;
      touch-action: none;
      background: ${COLORS.surface};
      margin-bottom: 4px;
    }
    .looqz-slider-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .looqz-slider-layer img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
    }
    .looqz-slider-divider {
      position: absolute;
      top: 0; bottom: 0;
      width: 2px;
      background: rgba(255,255,255,0.4);
      pointer-events: none;
      filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));
    }
    .looqz-slider-handle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32px; height: 32px;
      background: ${COLORS.primary};
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      cursor: ew-resize;
    }
    .looqz-slider-handle svg {
      width: 16px; height: 16px;
      fill: none;
      stroke: white;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .looqz-slider-label {
      font-size: 11px;
      color: ${COLORS.textSecondary};
      text-align: center;
      margin-bottom: 12px;
    }

    .looqz-variant-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .looqz-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${COLORS.border};
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
    }
    .looqz-dot.active {
      background: ${COLORS.primary};
      transform: scale(1.3);
    }

    /* ── Error View ───────────────────────── */
    .looqz-error-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      gap: 16px;
    }
    .looqz-error-icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: ${COLORS.error}15;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: shake 400ms ease-in-out;
    }
    .looqz-error-icon svg {
      width: 28px; height: 28px;
      stroke: ${COLORS.error};
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
    }
    .looqz-error-title {
      font-family: 'DM Serif Display', serif;
      font-size: 20px;
      color: ${COLORS.textPrimary};
    }
    .looqz-error-msg {
      font-size: 13px;
      color: ${COLORS.textSecondary};
      max-width: 280px;
    }
    .looqz-error-actions {
      display: flex;
      gap: 10px;
      width: 100%;
      margin-top: 12px;
    }
    .looqz-error-actions button {
      flex: 1;
    }

    /* ── Error Banner (inline) ────────────── */
    .looqz-error-banner {
      background: ${COLORS.error}15;
      border: 1px solid ${COLORS.error}30;
      color: ${COLORS.error};
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      animation: slidein 0.2s ease-out;
    }

    /* ── Animations ───────────────────────── */
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
    @keyframes shake {
      0% { transform: translateX(-4px); }
      25% { transform: translateX(4px); }
      50% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
      100% { transform: translateX(0); }
    }
    @keyframes slidein {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes saturate-in {
      0% { filter: saturate(0) blur(2px) contrast(0.8); opacity: 0.8; }
      100% { filter: saturate(1) blur(0) contrast(1); opacity: 1; }
    }
  `;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function el<T extends HTMLElement>(tag: string, className?: string, html?: string): T {
  const e = document.createElement(tag) as T;
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
}

// ─── Sidebar Creation & Rendering ────────────────────────────────────────────
function createSidebar() {
  if (popupContainer) return;

  popupContainer = document.createElement('div');
  popupContainer.id = 'looqz-sidebar-host';
  shadowRoot = popupContainer.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = getStyles();
  shadowRoot.appendChild(style);

  const sidebar = el<HTMLDivElement>('div', 'looqz-sidebar');
  sidebar.id = 'looqz-sidebar';
  shadowRoot.appendChild(sidebar);

  document.body.appendChild(popupContainer);

  // Auto-detect product image
  const productImage = extractProductImageUrl();
  if (productImage) {
    state.productImageUrl = productImage;
  }

  // Rehydrate user image from storage
  rehydrateUserImage();

  render();
}

function render() {
  const sidebar = shadowRoot?.getElementById('looqz-sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = '';

  // ── Header ──
  const header = el<HTMLDivElement>('div', 'looqz-header');
  header.innerHTML = `
    <div class="looqz-logo"><div class="looqz-logo-dot"></div> Looqz</div>
  `;
  const closeBtn = el<HTMLButtonElement>('button', 'looqz-close', '×');
  closeBtn.addEventListener('click', hideSidebar);
  header.appendChild(closeBtn);
  sidebar.appendChild(header);

  // ── Body ──
  const body = el<HTMLDivElement>('div', 'looqz-body');

  switch (state.view) {
    case 'upload':
      renderUploadView(body);
      break;
    case 'generating':
      renderGeneratingView(body);
      break;
    case 'result':
      renderResultView(body);
      break;
    case 'error':
      renderErrorView(body);
      break;
  }

  sidebar.appendChild(body);
}

// ─── Upload View ─────────────────────────────────────────────────────────────
function renderUploadView(container: HTMLElement) {
  // Step indicator
  const stepRow = el<HTMLDivElement>('div', '', '');
  stepRow.style.cssText = `display:flex;gap:6px;margin-bottom:20px;`;
  for (let i = 0; i < 2; i++) {
    const dot = el<HTMLDivElement>('div');
    dot.style.cssText = `flex:1;height:3px;border-radius:3px;background:${i === 0 ? COLORS.primary : COLORS.border};transition:background 0.3s;`;
    stepRow.appendChild(dot);
  }
  container.appendChild(stepRow);

  // Title
  const titleWrap = el<HTMLDivElement>('div', '', `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-family:'DM Serif Display',serif;font-size:22px;color:${COLORS.textPrimary};">Virtual Try‑On</div>
      <div style="font-size:12px;color:${COLORS.textSecondary};margin-top:4px;">Try this on yourself in seconds</div>
    </div>
  `);
  container.appendChild(titleWrap);

  // ── Clothing Item Section ──
  const clothingSection = el<HTMLDivElement>('div', 'looqz-section');
  clothingSection.innerHTML = `<div class="looqz-label">👔 Clothing Item</div>`;

  const clothingUpload = el<HTMLDivElement>('div', `looqz-upload${state.productImageUrl ? ' has-image' : ''}`);

  if (state.productImageUrl) {
    clothingUpload.innerHTML = `<img class="looqz-clothing-img" src="${state.productImageUrl}" alt="Product">`;
  } else {
    clothingUpload.innerHTML = `
      <svg class="looqz-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:block;margin:0 auto 10px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10l2 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9l2-2z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
      </svg>
      <div class="looqz-upload-text">No clothing detected</div>
      <div class="looqz-upload-hint">Click to upload clothing image</div>
    `;
  }

  const clothingInput = document.createElement('input');
  clothingInput.type = 'file';
  clothingInput.accept = 'image/*';
  clothingInput.style.display = 'none';
  clothingInput.addEventListener('change', () => {
    const file = clothingInput.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        state.productImageUrl = e.target?.result as string;
        render();
      };
      reader.readAsDataURL(file);
    }
  });
  clothingUpload.appendChild(clothingInput);
  clothingUpload.addEventListener('click', () => clothingInput.click());

  clothingSection.appendChild(clothingUpload);
  container.appendChild(clothingSection);

  // ── Your Photo Section ──
  const photoSection = el<HTMLDivElement>('div', 'looqz-section');
  photoSection.innerHTML = `<div class="looqz-label">👤 Your Photo</div>`;

  const photoUpload = el<HTMLDivElement>('div', `looqz-upload${state.userImagePreviewUrl ? ' has-image' : ''}`);

  if (state.userImagePreviewUrl) {
    const row = el<HTMLDivElement>('div', 'looqz-preview-row');
    row.innerHTML = `
      <img class="looqz-preview-thumb" src="${state.userImagePreviewUrl}" alt="You">
      <div class="looqz-preview-info">
        <div class="looqz-preview-name">Photo ready</div>
        <div class="looqz-preview-size">${state.userImageBlob ? formatFileSize(state.userImageBlob.size) : ''}</div>
      </div>
    `;
    const clearBtn = el<HTMLButtonElement>('button', 'looqz-preview-clear', '×');
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.userImageBlob = null;
      state.userImagePreviewUrl = null;
      try {
        chrome.storage.local.remove(['looqz_user_image_b64', 'looqz_user_image_type', 'looqz_user_preview_url']);
      } catch (_) {}
      render();
    });
    row.appendChild(clearBtn);
    photoUpload.appendChild(row);
  } else {
    photoUpload.innerHTML = `
      <svg class="looqz-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:block;margin:0 auto 10px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <div class="looqz-upload-text">Drop photo here or click to upload</div>
      <div class="looqz-upload-hint">JPEG, PNG, WEBP · Max 10MB</div>
    `;
  }

  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.accept = 'image/jpeg,image/png,image/webp,image/avif,image/gif';
  photoInput.style.display = 'none';
  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);
      state.userImageBlob = file;
      state.userImagePreviewUrl = previewUrl;
      persistUserImage(file, previewUrl);
      render();
    }
  });
  photoUpload.appendChild(photoInput);
  if (!state.userImagePreviewUrl) {
    photoUpload.addEventListener('click', () => photoInput.click());
  } else {
    // Allow clicking the row area to re-upload
    photoUpload.addEventListener('click', () => photoInput.click());
  }

  // Drag & drop on the upload area
  photoUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUpload.style.borderColor = COLORS.primary;
  });
  photoUpload.addEventListener('dragleave', () => {
    photoUpload.style.borderColor = state.userImagePreviewUrl ? `${COLORS.primary}40` : COLORS.border;
  });
  photoUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUpload.style.borderColor = state.userImagePreviewUrl ? `${COLORS.primary}40` : COLORS.border;
    const file = e.dataTransfer?.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);
      state.userImageBlob = file;
      state.userImagePreviewUrl = previewUrl;
      persistUserImage(file, previewUrl);
      render();
    }
  });

  photoSection.appendChild(photoUpload);
  container.appendChild(photoSection);

  // ── Try It On Button ──
  const isReady = !!state.productImageUrl && !!state.userImageBlob;
  const tryBtn = el<HTMLButtonElement>('button', 'looqz-btn-primary');
  tryBtn.disabled = !isReady;
  tryBtn.innerHTML = `
    ${isReady ? '<div class="shimmer"></div>' : ''}
    <span>Try It On →</span>
  `;
  tryBtn.addEventListener('click', () => startTryOn());
  container.appendChild(tryBtn);
}

// ─── Generating View ─────────────────────────────────────────────────────────
function renderGeneratingView(container: HTMLElement) {
  const gen = el<HTMLDivElement>('div', 'looqz-generating');

  // Image cards
  const cards = el<HTMLDivElement>('div', 'looqz-gen-images');

  if (state.productImageUrl) {
    cards.innerHTML += `<div class="looqz-gen-card left"><img src="${state.productImageUrl}" alt="Product"></div>`;
  }
  if (state.userImagePreviewUrl) {
    cards.innerHTML += `<div class="looqz-gen-card right"><img src="${state.userImagePreviewUrl}" alt="You"></div>`;
  }
  cards.innerHTML += `<div class="looqz-gen-orb"><div class="looqz-gen-ping"></div></div>`;
  gen.appendChild(cards);

  // Progress bar
  const bar = el<HTMLDivElement>('div', 'looqz-progress-bar');
  bar.innerHTML = `<div class="looqz-progress-fill"></div>`;
  gen.appendChild(bar);

  // Message
  const msg = el<HTMLDivElement>('div', 'looqz-gen-msg');
  msg.textContent = GENERATING_MESSAGES[state.msgIndex];
  msg.id = 'looqz-gen-msg';
  gen.appendChild(msg);

  // Cancel
  const cancelBtn = el<HTMLButtonElement>('button', 'looqz-btn-text', 'Cancel');
  cancelBtn.addEventListener('click', () => {
    stopMsgInterval();
    state.view = 'upload';
    state.isGenerating = false;
    render();
  });
  gen.appendChild(cancelBtn);

  container.appendChild(gen);
}

// ─── Result View ─────────────────────────────────────────────────────────────
function renderResultView(container: HTMLElement) {
  // Step indicator
  const stepRow = el<HTMLDivElement>('div', '', '');
  stepRow.style.cssText = `display:flex;gap:6px;margin-bottom:16px;`;
  for (let i = 0; i < 2; i++) {
    const dot = el<HTMLDivElement>('div');
    dot.style.cssText = `flex:1;height:3px;border-radius:3px;background:${COLORS.primary};transition:background 0.3s;`;
    stepRow.appendChild(dot);
  }
  container.appendChild(stepRow);

  // Header
  const header = el<HTMLDivElement>('div', 'looqz-result-header', `
    <div class="looqz-result-title">Your Look</div>
    <div class="looqz-result-badge"><span>✓</span> Generated</div>
  `);
  container.appendChild(header);

  // Build image list
  const images = state.resultImages.length > 0 ? state.resultImages : (state.resultImageUrl ? [state.resultImageUrl] : []);
  const activeImg = images[state.variantIndex] || '';

  // Before/After Slider
  const sliderContainer = el<HTMLDivElement>('div', 'looqz-slider-container');
  sliderContainer.style.animation = 'saturate-in 600ms forwards';

  // After layer (result)
  const afterLayer = el<HTMLDivElement>('div', 'looqz-slider-layer');
  afterLayer.style.clipPath = `inset(0 0 0 ${state.sliderPos}%)`;
  afterLayer.innerHTML = `<img src="${activeImg}" alt="Try-on Result">`;

  // Before layer (user photo)
  const beforeLayer = el<HTMLDivElement>('div', 'looqz-slider-layer');
  beforeLayer.style.clipPath = `inset(0 ${100 - state.sliderPos}% 0 0)`;
  beforeLayer.style.borderRight = '1px solid rgba(255,255,255,0.2)';
  beforeLayer.innerHTML = `<img src="${state.userImagePreviewUrl || ''}" alt="Original Photo">`;

  // Divider
  const divider = el<HTMLDivElement>('div', 'looqz-slider-divider');
  divider.style.left = `${state.sliderPos}%`;
  divider.style.transform = 'translateX(-50%)';

  const handle = el<HTMLDivElement>('div', 'looqz-slider-handle');
  handle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M18 8L22 12L18 16M6 8L2 12L6 16M2 12H22"/></svg>`;
  divider.appendChild(handle);

  sliderContainer.appendChild(afterLayer);
  sliderContainer.appendChild(beforeLayer);
  sliderContainer.appendChild(divider);

  // Slider pointer events
  const onMove = (e: PointerEvent) => {
    const rect = sliderContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let pct = (x / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    state.sliderPos = pct;
    afterLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
    beforeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divider.style.left = `${pct}%`;
  };
  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
  };
  sliderContainer.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    // Jump to click position
    const rect = sliderContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let pct = (x / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    state.sliderPos = pct;
    afterLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
    beforeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divider.style.left = `${pct}%`;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });

  container.appendChild(sliderContainer);

  // Label
  container.appendChild(el<HTMLDivElement>('div', 'looqz-slider-label', 'Before / After'));

  // Variant dots
  if (images.length > 1) {
    const dotsWrap = el<HTMLDivElement>('div', 'looqz-variant-dots');
    images.forEach((_, i) => {
      const dot = el<HTMLButtonElement>('button', `looqz-dot${i === state.variantIndex ? ' active' : ''}`);
      dot.addEventListener('click', () => {
        state.variantIndex = i;
        render();
      });
      dotsWrap.appendChild(dot);
    });
    container.appendChild(dotsWrap);
  }

  // Action buttons
  const btnGrid = el<HTMLDivElement>('div', 'looqz-btn-grid');

  const downloadBtn = el<HTMLButtonElement>('button', 'looqz-btn-secondary', 'Download');
  downloadBtn.addEventListener('click', () => downloadResult(activeImg));
  btnGrid.appendChild(downloadBtn);

  const shareBtn = el<HTMLButtonElement>('button', 'looqz-btn-secondary', 'Share');
  shareBtn.addEventListener('click', () => shareResult(activeImg));
  btnGrid.appendChild(shareBtn);

  container.appendChild(btnGrid);

  // Try Another
  const tryAnotherBtn = el<HTMLButtonElement>('button', 'looqz-btn-secondary', 'Try Another Photo');
  tryAnotherBtn.style.marginBottom = '10px';
  tryAnotherBtn.addEventListener('click', () => {
    state.view = 'upload';
    state.resultImageUrl = null;
    state.resultImages = [];
    state.variantIndex = 0;
    state.sliderPos = 50;
    render();
  });
  container.appendChild(tryAnotherBtn);

  // Generate more variants
  const moreBtn = el<HTMLButtonElement>('button', 'looqz-btn-text', 'Generate more variants');
  moreBtn.style.textDecoration = 'underline';
  moreBtn.style.width = '100%';
  moreBtn.style.textAlign = 'center';
  moreBtn.addEventListener('click', () => startTryOn(4));
  container.appendChild(moreBtn);
}

// ─── Error View ──────────────────────────────────────────────────────────────
function renderErrorView(container: HTMLElement) {
  const view = el<HTMLDivElement>('div', 'looqz-error-view');
  view.innerHTML = `
    <div class="looqz-error-icon">
      <svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </div>
    <div class="looqz-error-title">Oops!</div>
    <div class="looqz-error-msg">${state.error || 'Something went wrong. Please try again.'}</div>
  `;

  const actions = el<HTMLDivElement>('div', 'looqz-error-actions');

  const retryBtn = el<HTMLButtonElement>('button', 'looqz-btn-primary', 'Try Again');
  retryBtn.style.height = '40px';
  retryBtn.style.fontSize = '13px';
  retryBtn.addEventListener('click', () => {
    state.view = 'upload';
    state.error = null;
    render();
  });
  actions.appendChild(retryBtn);

  const backBtn = el<HTMLButtonElement>('button', 'looqz-btn-secondary', 'Go Back');
  backBtn.addEventListener('click', () => {
    state.view = 'upload';
    state.error = null;
    state.resultImageUrl = null;
    state.resultImages = [];
    render();
  });
  actions.appendChild(backBtn);

  view.appendChild(actions);
  container.appendChild(view);
}

// ─── API Call ────────────────────────────────────────────────────────────────
async function resizeImageBlob(input: Blob, maxDim = 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(input);
  const { width, height } = bitmap;
  let targetW = width, targetH = height;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      targetW = maxDim;
      targetH = Math.round((height / width) * maxDim);
    } else {
      targetH = maxDim;
      targetW = Math.round((width / height) * maxDim);
    }
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context');
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
}

function startMsgInterval() {
  state.msgIndex = 0;
  msgInterval = setInterval(() => {
    state.msgIndex = (state.msgIndex + 1) % GENERATING_MESSAGES.length;
    const msgEl = shadowRoot?.getElementById('looqz-gen-msg');
    if (msgEl) msgEl.textContent = GENERATING_MESSAGES[state.msgIndex];
  }, 2500);
}

function stopMsgInterval() {
  if (msgInterval) {
    clearInterval(msgInterval);
    msgInterval = null;
  }
}

async function startTryOn(imageCount: 1 | 2 | 3 | 4 = 1) {
  if (!state.productImageUrl || !state.userImageBlob) return;

  state.view = 'generating';
  state.isGenerating = true;
  state.error = null;
  render();
  startMsgInterval();

  // Badge: generating
  try {
    chrome.runtime.sendMessage({ type: 'SET_BADGE', text: '·', color: COLORS.primary });
  } catch (_) {}

  try {
    const optimized = await resizeImageBlob(state.userImageBlob, 1024);

    const form = new FormData();
    form.append('product_image_url', state.productImageUrl);
    form.append('user_image', optimized, 'user-photo.jpg');
    form.append('image_count', String(imageCount));

    const response = await fetch(`${BACKEND_URL}/try-on`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      let errMsg = 'Request failed';
      try {
        const errJson = await response.json();
        if (errJson.detail) errMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      } catch (_) {}

      // Map error types
      if (response.status === 429) errMsg = 'Too many requests. Please wait a moment and try again.';
      else if (response.status === 402) errMsg = 'Looqz credits exhausted. Please top up your account.';
      else if (response.status === 401) errMsg = 'API key invalid — contact support.';
      else if (response.status >= 500) errMsg = 'Generation service is busy. Please try again.';

      throw new Error(errMsg);
    }

    const data = await response.json();

    state.resultImageUrl = data.image_url;
    state.resultImages = data.images || [];
    state.variantIndex = 0;
    state.sliderPos = 50;
    state.view = 'result';

    // Badge: success
    try {
      chrome.runtime.sendMessage({ type: 'SET_BADGE', text: '✓', color: COLORS.success });
      setTimeout(() => {
        try { chrome.runtime.sendMessage({ type: 'SET_BADGE', text: '', color: '' }); } catch (_) {}
      }, 3000);
    } catch (_) {}
  } catch (err: any) {
    state.error = err instanceof TypeError
      ? 'No internet connection. Please check your network.'
      : (err.message || 'Something went wrong. Please try again.');
    state.view = 'error';

    // Badge: error
    try {
      chrome.runtime.sendMessage({ type: 'SET_BADGE', text: '!', color: COLORS.error });
      setTimeout(() => {
        try { chrome.runtime.sendMessage({ type: 'SET_BADGE', text: '', color: '' }); } catch (_) {}
      }, 3000);
    } catch (_) {}
  } finally {
    state.isGenerating = false;
    stopMsgInterval();
    render();
  }
}

// ─── Download / Share ────────────────────────────────────────────────────────
async function downloadResult(url: string) {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'looqz-tryon.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  } catch (e) {
    console.error('Download failed', e);
  }
}

async function shareResult(url: string) {
  if (!url) return;

  // Try native share first (mobile / PWA contexts)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Looqz Virtual Try-On', text: 'Check out this virtual try-on!', url });
      return;
    } catch (_) {
      // User cancelled or not supported — fall through to copy
    }
  }

  // Copy to clipboard with multiple fallbacks
  let copied = false;
  try {
    await navigator.clipboard.writeText(url);
    copied = true;
  } catch (_) {
    // clipboard API may fail in content scripts — use execCommand fallback
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (_) {}
  }

  // Visual feedback on the share button
  const shareBtn = shadowRoot?.querySelector('.looqz-btn-grid .looqz-btn-secondary:last-child') as HTMLButtonElement | null;
  if (shareBtn) {
    const original = shareBtn.textContent;
    shareBtn.textContent = copied ? '✓ Copied!' : '✗ Failed';
    shareBtn.style.borderColor = copied ? COLORS.success : COLORS.error;
    shareBtn.style.color = copied ? COLORS.success : COLORS.error;
    setTimeout(() => {
      shareBtn.textContent = original;
      shareBtn.style.borderColor = '';
      shareBtn.style.color = '';
    }, 2000);
  }
}

// ─── Image Persistence ───────────────────────────────────────────────────────
function persistUserImage(blob: Blob, previewUrl: string) {
  try {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      chrome.storage.local.set({
        looqz_user_image_b64: base64,
        looqz_user_image_type: blob.type,
        looqz_user_preview_url: previewUrl,
      });
    };
    reader.readAsDataURL(blob);
  } catch (_) {}
}

async function rehydrateUserImage() {
  try {
    const data = await chrome.storage.local.get([
      'looqz_user_image_b64',
      'looqz_user_image_type',
      'looqz_user_preview_url',
    ]);
    if (data.looqz_user_image_b64 && data.looqz_user_image_type) {
      const res = await fetch(data.looqz_user_image_b64);
      const blob = await res.blob();
      state.userImageBlob = blob;
      state.userImagePreviewUrl = data.looqz_user_preview_url || URL.createObjectURL(blob);
      render();
    }
  } catch (_) {}
}

// ─── Show / Hide / Toggle ────────────────────────────────────────────────────
function showSidebar() {
  if (!popupContainer) createSidebar();
  const sidebar = shadowRoot?.getElementById('looqz-sidebar');
  if (sidebar) {
    // Force reflow before adding class for the animation to trigger
    sidebar.offsetHeight;
    sidebar.classList.add('open');
  }
}

function hideSidebar() {
  const sidebar = shadowRoot?.getElementById('looqz-sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

function toggleSidebar() {
  const sidebar = shadowRoot?.getElementById('looqz-sidebar');
  if (sidebar?.classList.contains('open')) {
    hideSidebar();
  } else {
    showSidebar();
  }
}

// ─── Message Listener ────────────────────────────────────────────────────────
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'TOGGLE_POPUP') {
      toggleSidebar();
      sendResponse({ success: true });
    } else if (msg.type === 'GET_PRODUCT_IMAGE') {
      sendResponse({ url: extractProductImageUrl() });
    }
    return true;
  });
}

export { showSidebar, hideSidebar, toggleSidebar };
