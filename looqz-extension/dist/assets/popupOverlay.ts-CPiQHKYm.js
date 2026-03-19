import{extractProductImageUrl as P}from"./extractProductImage.ts-1gzlAw_L.js";const S="http://localhost:8000",_=380,e={bg:"#0A0A0F",surface:"#13131A",elevated:"#1C1C26",border:"#2A2A38",primary:"#7C6FFF",primaryHover:"#9B90FF",textPrimary:"#F0EFFF",textSecondary:"#8B8AA8",success:"#4ADE80",error:"#F87171"};let q=null,g=null,o={view:"upload",productImageUrl:null,userImageBlob:null,userImagePreviewUrl:null,resultImageUrl:null,resultImages:[],variantIndex:0,sliderPos:50,isGenerating:!1,error:null,msgIndex:0},C=null;const L=["Analyzing your photo…","Fitting the garment…","Rendering the result…","Almost done…"];function T(){return`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      all: initial;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${e.textPrimary};
    }

    .looqz-sidebar {
      position: fixed;
      top: 0;
      right: -${_}px;
      width: ${_}px;
      height: 100vh;
      background: ${e.bg};
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
      border-left: 1px solid ${e.border};
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
      border-bottom: 1px solid ${e.border};
      background: ${e.bg};
      flex-shrink: 0;
    }

    .looqz-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 20px;
      color: ${e.textPrimary};
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .looqz-logo-dot {
      width: 8px; height: 8px;
      background: ${e.primary};
      border-radius: 50%;
      box-shadow: 0 0 10px ${e.primary};
    }

    .looqz-close {
      width: 32px; height: 32px;
      background: ${e.elevated};
      border: 1px solid ${e.border};
      border-radius: 8px;
      color: ${e.textSecondary};
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .looqz-close:hover {
      background: ${e.border};
      color: ${e.textPrimary};
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
    .looqz-body::-webkit-scrollbar-thumb { background: ${e.border}; border-radius: 4px; }

    /* ── Section ──────────────────────────── */
    .looqz-section {
      margin-bottom: 20px;
    }

    .looqz-label {
      font-size: 13px;
      font-weight: 600;
      color: ${e.textPrimary};
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ── Upload Area ──────────────────────── */
    .looqz-upload {
      border: 2px dashed ${e.border};
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s;
      background: ${e.surface};
      position: relative;
    }
    .looqz-upload:hover {
      border-color: ${e.primary};
      background: ${e.elevated};
    }
    .looqz-upload.has-image {
      border-color: ${e.primary}40;
      border-style: solid;
      padding: 12px;
    }
    .looqz-upload-icon {
      width: 36px; height: 36px;
      margin: 0 auto 10px;
      color: ${e.textSecondary};
      opacity: 0.6;
    }
    .looqz-upload-text {
      font-size: 13px;
      color: ${e.textSecondary};
      margin-bottom: 4px;
    }
    .looqz-upload-hint {
      font-size: 11px;
      color: ${e.textSecondary};
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
      border: 2px solid ${e.border};
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
      color: ${e.textPrimary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .looqz-preview-size {
      font-size: 11px;
      color: ${e.textSecondary};
    }
    .looqz-preview-clear {
      width: 28px; height: 28px;
      background: ${e.elevated};
      border: 1px solid ${e.border};
      border-radius: 50%;
      color: ${e.textSecondary};
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .looqz-preview-clear:hover {
      background: ${e.error}20;
      color: ${e.error};
      border-color: ${e.error}40;
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
      background: linear-gradient(135deg, ${e.primary} 0%, #5B4FCC 100%);
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
      box-shadow: 0 6px 20px ${e.primary}40;
    }
    .looqz-btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: ${e.elevated};
      color: ${e.textSecondary};
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
      border: 1px solid ${e.border};
      border-radius: 8px;
      background: ${e.elevated};
      color: ${e.textPrimary};
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .looqz-btn-secondary:hover {
      background: ${e.primary};
      border-color: ${e.primary};
      color: white;
    }

    .looqz-btn-text {
      background: none;
      border: none;
      color: ${e.textSecondary};
      font-size: 13px;
      cursor: pointer;
      transition: color 0.2s;
      padding: 8px 0;
    }
    .looqz-btn-text:hover {
      color: ${e.textPrimary};
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
      border: 1px solid ${e.border};
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
      background: ${e.primary}15;
      mix-blend-mode: overlay;
    }

    .looqz-gen-orb {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      background: ${e.bg};
      border-radius: 50%;
      box-shadow: 0 0 30px ${e.primary}80;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }
    .looqz-gen-ping {
      width: 14px; height: 14px;
      background: ${e.primary};
      border-radius: 50%;
      animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    .looqz-progress-bar {
      width: 100%;
      height: 3px;
      background: ${e.elevated};
      border-radius: 3px;
      overflow: hidden;
    }
    .looqz-progress-fill {
      height: 100%;
      width: 33%;
      background: ${e.primary};
      border-radius: 3px;
      animation: progress 1.5s ease-in-out infinite;
    }

    .looqz-gen-msg {
      font-size: 14px;
      font-weight: 500;
      color: ${e.textPrimary};
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
      color: ${e.textPrimary};
    }
    .looqz-result-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      padding: 2px 10px;
      border-radius: 999px;
      background: ${e.success}20;
      color: ${e.success};
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
      background: ${e.surface};
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
      background: ${e.primary};
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
      color: ${e.textSecondary};
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
      background: ${e.border};
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
    }
    .looqz-dot.active {
      background: ${e.primary};
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
      background: ${e.error}15;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: shake 400ms ease-in-out;
    }
    .looqz-error-icon svg {
      width: 28px; height: 28px;
      stroke: ${e.error};
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
    }
    .looqz-error-title {
      font-family: 'DM Serif Display', serif;
      font-size: 20px;
      color: ${e.textPrimary};
    }
    .looqz-error-msg {
      font-size: 13px;
      color: ${e.textSecondary};
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
      background: ${e.error}15;
      border: 1px solid ${e.error}30;
      color: ${e.error};
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
  `}function A(t){return t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:`${(t/(1024*1024)).toFixed(1)} MB`}function a(t,i,r){const n=document.createElement(t);return i&&(n.className=i),r&&(n.innerHTML=r),n}function j(){if(q)return;q=document.createElement("div"),q.id="looqz-sidebar-host",g=q.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=T(),g.appendChild(t);const i=a("div","looqz-sidebar");i.id="looqz-sidebar",g.appendChild(i),document.body.appendChild(q);const r=P();r&&(o.productImageUrl=r),N(),f()}function f(){const t=g==null?void 0:g.getElementById("looqz-sidebar");if(!t)return;t.innerHTML="";const i=a("div","looqz-header");i.innerHTML=`
    <div class="looqz-logo"><div class="looqz-logo-dot"></div> Looqz</div>
  `;const r=a("button","looqz-close","×");r.addEventListener("click",B),i.appendChild(r),t.appendChild(i);const n=a("div","looqz-body");switch(o.view){case"upload":D(n);break;case"generating":H(n);break;case"result":G(n);break;case"error":F(n);break}t.appendChild(n)}function D(t){const i=a("div","","");i.style.cssText="display:flex;gap:6px;margin-bottom:20px;";for(let d=0;d<2;d++){const p=a("div");p.style.cssText=`flex:1;height:3px;border-radius:3px;background:${d===0?e.primary:e.border};transition:background 0.3s;`,i.appendChild(p)}t.appendChild(i);const r=a("div","",`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-family:'DM Serif Display',serif;font-size:22px;color:${e.textPrimary};">Virtual Try‑On</div>
      <div style="font-size:12px;color:${e.textSecondary};margin-top:4px;">Try this on yourself in seconds</div>
    </div>
  `);t.appendChild(r);const n=a("div","looqz-section");n.innerHTML='<div class="looqz-label">👔 Clothing Item</div>';const l=a("div",`looqz-upload${o.productImageUrl?" has-image":""}`);o.productImageUrl?l.innerHTML=`<img class="looqz-clothing-img" src="${o.productImageUrl}" alt="Product">`:l.innerHTML=`
      <svg class="looqz-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:block;margin:0 auto 10px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10l2 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9l2-2z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
      </svg>
      <div class="looqz-upload-text">No clothing detected</div>
      <div class="looqz-upload-hint">Click to upload clothing image</div>
    `;const s=document.createElement("input");s.type="file",s.accept="image/*",s.style.display="none",s.addEventListener("change",()=>{var p;const d=(p=s.files)==null?void 0:p[0];if(d&&d.size<=10*1024*1024){const x=new FileReader;x.onload=z=>{var y;o.productImageUrl=(y=z.target)==null?void 0:y.result,f()},x.readAsDataURL(d)}}),l.appendChild(s),l.addEventListener("click",()=>s.click()),n.appendChild(l),t.appendChild(n);const u=a("div","looqz-section");u.innerHTML='<div class="looqz-label">👤 Your Photo</div>';const c=a("div",`looqz-upload${o.userImagePreviewUrl?" has-image":""}`);if(o.userImagePreviewUrl){const d=a("div","looqz-preview-row");d.innerHTML=`
      <img class="looqz-preview-thumb" src="${o.userImagePreviewUrl}" alt="You">
      <div class="looqz-preview-info">
        <div class="looqz-preview-name">Photo ready</div>
        <div class="looqz-preview-size">${o.userImageBlob?A(o.userImageBlob.size):""}</div>
      </div>
    `;const p=a("button","looqz-preview-clear","×");p.addEventListener("click",x=>{x.stopPropagation(),o.userImageBlob=null,o.userImagePreviewUrl=null;try{chrome.storage.local.remove(["looqz_user_image_b64","looqz_user_image_type","looqz_user_preview_url"])}catch{}f()}),d.appendChild(p),c.appendChild(d)}else c.innerHTML=`
      <svg class="looqz-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:block;margin:0 auto 10px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <div class="looqz-upload-text">Drop photo here or click to upload</div>
      <div class="looqz-upload-hint">JPEG, PNG, WEBP · Max 10MB</div>
    `;const m=document.createElement("input");m.type="file",m.accept="image/jpeg,image/png,image/webp,image/avif,image/gif",m.style.display="none",m.addEventListener("change",()=>{var p;const d=(p=m.files)==null?void 0:p[0];if(d&&d.size<=10*1024*1024){const x=URL.createObjectURL(d);o.userImageBlob=d,o.userImagePreviewUrl=x,E(d,x),f()}}),c.appendChild(m),o.userImagePreviewUrl?c.addEventListener("click",()=>m.click()):c.addEventListener("click",()=>m.click()),c.addEventListener("dragover",d=>{d.preventDefault(),c.style.borderColor=e.primary}),c.addEventListener("dragleave",()=>{c.style.borderColor=o.userImagePreviewUrl?`${e.primary}40`:e.border}),c.addEventListener("drop",d=>{var x,z;d.preventDefault(),c.style.borderColor=o.userImagePreviewUrl?`${e.primary}40`:e.border;const p=(z=(x=d.dataTransfer)==null?void 0:x.files)==null?void 0:z[0];if(p&&p.size<=10*1024*1024){const y=URL.createObjectURL(p);o.userImageBlob=p,o.userImagePreviewUrl=y,E(p,y),f()}}),u.appendChild(c),t.appendChild(u);const k=!!o.productImageUrl&&!!o.userImageBlob,w=a("button","looqz-btn-primary");w.disabled=!k,w.innerHTML=`
    ${k?'<div class="shimmer"></div>':""}
    <span>Try It On →</span>
  `,w.addEventListener("click",()=>U()),t.appendChild(w)}function H(t){const i=a("div","looqz-generating"),r=a("div","looqz-gen-images");o.productImageUrl&&(r.innerHTML+=`<div class="looqz-gen-card left"><img src="${o.productImageUrl}" alt="Product"></div>`),o.userImagePreviewUrl&&(r.innerHTML+=`<div class="looqz-gen-card right"><img src="${o.userImagePreviewUrl}" alt="You"></div>`),r.innerHTML+='<div class="looqz-gen-orb"><div class="looqz-gen-ping"></div></div>',i.appendChild(r);const n=a("div","looqz-progress-bar");n.innerHTML='<div class="looqz-progress-fill"></div>',i.appendChild(n);const l=a("div","looqz-gen-msg");l.textContent=L[o.msgIndex],l.id="looqz-gen-msg",i.appendChild(l);const s=a("button","looqz-btn-text","Cancel");s.addEventListener("click",()=>{M(),o.view="upload",o.isGenerating=!1,f()}),i.appendChild(s),t.appendChild(i)}function G(t){const i=a("div","","");i.style.cssText="display:flex;gap:6px;margin-bottom:16px;";for(let b=0;b<2;b++){const v=a("div");v.style.cssText=`flex:1;height:3px;border-radius:3px;background:${e.primary};transition:background 0.3s;`,i.appendChild(v)}t.appendChild(i);const r=a("div","looqz-result-header",`
    <div class="looqz-result-title">Your Look</div>
    <div class="looqz-result-badge"><span>✓</span> Generated</div>
  `);t.appendChild(r);const n=o.resultImages.length>0?o.resultImages:o.resultImageUrl?[o.resultImageUrl]:[],l=n[o.variantIndex]||"",s=a("div","looqz-slider-container");s.style.animation="saturate-in 600ms forwards";const u=a("div","looqz-slider-layer");u.style.clipPath=`inset(0 0 0 ${o.sliderPos}%)`,u.innerHTML=`<img src="${l}" alt="Try-on Result">`;const c=a("div","looqz-slider-layer");c.style.clipPath=`inset(0 ${100-o.sliderPos}% 0 0)`,c.style.borderRight="1px solid rgba(255,255,255,0.2)",c.innerHTML=`<img src="${o.userImagePreviewUrl||""}" alt="Original Photo">`;const m=a("div","looqz-slider-divider");m.style.left=`${o.sliderPos}%`,m.style.transform="translateX(-50%)";const k=a("div","looqz-slider-handle");k.innerHTML='<svg viewBox="0 0 24 24"><path d="M18 8L22 12L18 16M6 8L2 12L6 16M2 12H22"/></svg>',m.appendChild(k),s.appendChild(u),s.appendChild(c),s.appendChild(m);const w=b=>{const v=s.getBoundingClientRect();let h=(b.clientX-v.left)/v.width*100;h=Math.max(5,Math.min(95,h)),o.sliderPos=h,u.style.clipPath=`inset(0 0 0 ${h}%)`,c.style.clipPath=`inset(0 ${100-h}% 0 0)`,m.style.left=`${h}%`},d=()=>{document.removeEventListener("pointermove",w),document.removeEventListener("pointerup",d)};if(s.addEventListener("pointerdown",b=>{b.preventDefault();const v=s.getBoundingClientRect();let h=(b.clientX-v.left)/v.width*100;h=Math.max(5,Math.min(95,h)),o.sliderPos=h,u.style.clipPath=`inset(0 0 0 ${h}%)`,c.style.clipPath=`inset(0 ${100-h}% 0 0)`,m.style.left=`${h}%`,document.addEventListener("pointermove",w),document.addEventListener("pointerup",d)}),t.appendChild(s),t.appendChild(a("div","looqz-slider-label","Before / After")),n.length>1){const b=a("div","looqz-variant-dots");n.forEach((v,I)=>{const h=a("button",`looqz-dot${I===o.variantIndex?" active":""}`);h.addEventListener("click",()=>{o.variantIndex=I,f()}),b.appendChild(h)}),t.appendChild(b)}const p=a("div","looqz-btn-grid"),x=a("button","looqz-btn-secondary","Download");x.addEventListener("click",()=>X(l)),p.appendChild(x);const z=a("button","looqz-btn-secondary","Share");z.addEventListener("click",()=>V(l)),p.appendChild(z),t.appendChild(p);const y=a("button","looqz-btn-secondary","Try Another Photo");y.style.marginBottom="10px",y.addEventListener("click",()=>{o.view="upload",o.resultImageUrl=null,o.resultImages=[],o.variantIndex=0,o.sliderPos=50,f()}),t.appendChild(y);const $=a("button","looqz-btn-text","Generate more variants");$.style.textDecoration="underline",$.style.width="100%",$.style.textAlign="center",$.addEventListener("click",()=>U(4)),t.appendChild($)}function F(t){const i=a("div","looqz-error-view");i.innerHTML=`
    <div class="looqz-error-icon">
      <svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </div>
    <div class="looqz-error-title">Oops!</div>
    <div class="looqz-error-msg">${o.error||"Something went wrong. Please try again."}</div>
  `;const r=a("div","looqz-error-actions"),n=a("button","looqz-btn-primary","Try Again");n.style.height="40px",n.style.fontSize="13px",n.addEventListener("click",()=>{o.view="upload",o.error=null,f()}),r.appendChild(n);const l=a("button","looqz-btn-secondary","Go Back");l.addEventListener("click",()=>{o.view="upload",o.error=null,o.resultImageUrl=null,o.resultImages=[],f()}),r.appendChild(l),i.appendChild(r),t.appendChild(i)}async function R(t,i=1024){const r=await createImageBitmap(t),{width:n,height:l}=r;let s=n,u=l;(n>i||l>i)&&(n>l?(s=i,u=Math.round(l/n*i)):(u=i,s=Math.round(n/l*i)));const c=new OffscreenCanvas(s,u),m=c.getContext("2d");if(!m)throw new Error("No 2D context");return m.drawImage(r,0,0,s,u),r.close(),c.convertToBlob({type:"image/jpeg",quality:.85})}function O(){o.msgIndex=0,C=setInterval(()=>{o.msgIndex=(o.msgIndex+1)%L.length;const t=g==null?void 0:g.getElementById("looqz-gen-msg");t&&(t.textContent=L[o.msgIndex])},2500)}function M(){C&&(clearInterval(C),C=null)}async function U(t=1){if(!(!o.productImageUrl||!o.userImageBlob)){o.view="generating",o.isGenerating=!0,o.error=null,f(),O();try{chrome.runtime.sendMessage({type:"SET_BADGE",text:"·",color:e.primary})}catch{}try{const i=await R(o.userImageBlob,1024),r=new FormData;r.append("product_image_url",o.productImageUrl),r.append("user_image",i,"user-photo.jpg"),r.append("image_count",String(t));const n=await fetch(`${S}/try-on`,{method:"POST",body:r});if(!n.ok){let s="Request failed";try{const u=await n.json();u.detail&&(s=typeof u.detail=="string"?u.detail:JSON.stringify(u.detail))}catch{}throw n.status===429?s="Too many requests. Please wait a moment and try again.":n.status===402?s="Looqz credits exhausted. Please top up your account.":n.status===401?s="API key invalid — contact support.":n.status>=500&&(s="Generation service is busy. Please try again."),new Error(s)}const l=await n.json();o.resultImageUrl=l.image_url,o.resultImages=l.images||[],o.variantIndex=0,o.sliderPos=50,o.view="result";try{chrome.runtime.sendMessage({type:"SET_BADGE",text:"✓",color:e.success}),setTimeout(()=>{try{chrome.runtime.sendMessage({type:"SET_BADGE",text:"",color:""})}catch{}},3e3)}catch{}}catch(i){o.error=i instanceof TypeError?"No internet connection. Please check your network.":i.message||"Something went wrong. Please try again.",o.view="error";try{chrome.runtime.sendMessage({type:"SET_BADGE",text:"!",color:e.error}),setTimeout(()=>{try{chrome.runtime.sendMessage({type:"SET_BADGE",text:"",color:""})}catch{}},3e3)}catch{}}finally{o.isGenerating=!1,M(),f()}}}async function X(t){if(t)try{const r=await(await fetch(t)).blob(),n=URL.createObjectURL(r),l=document.createElement("a");l.href=n,l.download="looqz-tryon.jpg",document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(n)}catch(i){console.error("Download failed",i)}}async function V(t){if(!t)return;if(navigator.share)try{await navigator.share({title:"Looqz Virtual Try-On",text:"Check out this virtual try-on!",url:t});return}catch{}let i=!1;try{await navigator.clipboard.writeText(t),i=!0}catch{try{const l=document.createElement("textarea");l.value=t,l.style.cssText="position:fixed;left:-9999px;top:-9999px;opacity:0;",document.body.appendChild(l),l.select(),i=document.execCommand("copy"),document.body.removeChild(l)}catch{}}const r=g==null?void 0:g.querySelector(".looqz-btn-grid .looqz-btn-secondary:last-child");if(r){const n=r.textContent;r.textContent=i?"✓ Copied!":"✗ Failed",r.style.borderColor=i?e.success:e.error,r.style.color=i?e.success:e.error,setTimeout(()=>{r.textContent=n,r.style.borderColor="",r.style.color=""},2e3)}}function E(t,i){try{const r=new FileReader;r.onloadend=()=>{const n=r.result;chrome.storage.local.set({looqz_user_image_b64:n,looqz_user_image_type:t.type,looqz_user_preview_url:i})},r.readAsDataURL(t)}catch{}}async function N(){try{const t=await chrome.storage.local.get(["looqz_user_image_b64","looqz_user_image_type","looqz_user_preview_url"]);if(t.looqz_user_image_b64&&t.looqz_user_image_type){const r=await(await fetch(t.looqz_user_image_b64)).blob();o.userImageBlob=r,o.userImagePreviewUrl=t.looqz_user_preview_url||URL.createObjectURL(r),f()}}catch{}}function Y(){q||j();const t=g==null?void 0:g.getElementById("looqz-sidebar");t&&(t.offsetHeight,t.classList.add("open"))}function B(){const t=g==null?void 0:g.getElementById("looqz-sidebar");t&&t.classList.remove("open")}function W(){const t=g==null?void 0:g.getElementById("looqz-sidebar");t!=null&&t.classList.contains("open")?B():Y()}typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((t,i,r)=>(t.type==="TOGGLE_POPUP"?(W(),r({success:!0})):t.type==="GET_PRODUCT_IMAGE"&&r({url:P()}),!0));export{B as hideSidebar,Y as showSidebar,W as toggleSidebar};
