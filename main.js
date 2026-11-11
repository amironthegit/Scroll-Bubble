/* Scroll Info Bubble — وقتی اسکرول‌بار خود ابسیدین رو می‌گیری، درصد + هدینگ فعلی رو کنارش نشون میده.
   ظاهر و تنظیمات همه توی CSS snippet (fast-scroll.css) هست. */
const { Plugin, MarkdownView } = require('obsidian');

const SEL = '.cm-scroller, .markdown-preview-view';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function cleanHeading(t, max) {
  t = String(t || '')
    .replace(/<[^>]*>/g, '')
    .replace(/!?\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/!?\[\[([^\]]*)\]\]/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|==|~~|[`*])/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? t.slice(0, max) + '…' : t;
}

module.exports = class ScrollInfoBubble extends Plugin {
  async onload() {
    this.drag = null;       // {scroller, view, edge:'right'|'left', sbw}
    // FIX رگرسیون ویندوز: حالت خودکار فقط برای دستگاه لمسی (اندروید) است، نه دسکتاپ.
    // روی دسکتاپ (pointer: fine) اسکرول با چرخ موس / کیبورد / جابه‌جایی خط نباید حباب بیاورد.
    // فقط matchMedia، چون 'ontouchstart' در بعضی مرورگرهای ویندوز هم true است و گیت را خراب می‌کند
    this._isCoarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    this.cfg = {};

    this.bubble = document.body.createDiv({ cls: 'fs-bubble' });
    this.pct = this.bubble.createDiv({ cls: 'fs-pct' });
    this.sec = this.bubble.createDiv({ cls: 'fs-sec' });
    this.register(() => this.bubble.remove());

    this.readConfig();
    this.registerEvent(this.app.workspace.on('css-change', () => this.readConfig()));

    const on = (type, fn, opts) => {
      // capture=true + passive برای تاچ؛ بدون passive مرورگر موبایل اسکرول را قفل می‌کند
      const o = opts ? { ...opts, capture: true } : true;
      document.addEventListener(type, fn, o);
      this.register(() => document.removeEventListener(type, fn, o));
    };
    on('mousedown', (e) => this.onDown(e));
    on('pointerdown', (e) => this.onDown(e));
    on('touchstart', (e) => {
      this._lastTouch = Date.now();
      const t0 = e.touches && e.touches[0];
      if (t0) {
        // لمس روی 36px لبه‌ی راست/چپ = لمس اسکرول‌بار، بقیه = لمس متن
        const el = document.elementFromPoint ? document.elementFromPoint(t0.clientX, t0.clientY) : e.target;
        const sc = el instanceof HTMLElement ? el.closest(SEL) : null;
        if (sc) {
          const r = sc.getBoundingClientRect();
          if (t0.clientX >= r.right - 36) { this._touchKind = 'scrollbar'; this._touchEdge = 'right'; }
          else if (t0.clientX <= r.left + 36) { this._touchKind = 'scrollbar'; this._touchEdge = 'left'; }
          else { this._touchKind = 'content'; this._touchEdge = null; }
        } else this._touchKind = 'content';
      }
      this.onDown(e);
    }, { passive: true });
    on('mouseup', () => this.end());
    on('pointerup', () => this.end());
    on('touchend', () => { if (this._touchKind === 'content') this._contentTouchEnd = Date.now(); this._touchKind = null; this._touchEdge = null; this.end(); });
    on('touchcancel', () => { if (this._touchKind === 'content') this._contentTouchEnd = Date.now(); this._touchKind = null; this._touchEdge = null; this.end(); });
    on('pointercancel', () => this.end());
    on('dragend', () => this.end());
    on('mousemove', (e) => { if (this.drag && e.buttons === 0) this.end(); });
    on('scroll', (e) => this.onScroll(e));
    window.addEventListener('blur', () => this.end());
  }

  readConfig() {
    const cs = getComputedStyle(document.body);
    const num = (n, d) => { const v = parseFloat(cs.getPropertyValue(n)); return isNaN(v) ? d : v; };
    const str = (n, d) => {
      const v = cs.getPropertyValue(n).trim();
      return v ? v.replace(/^["']|["']$/g, '') : d;
    };
    this.cfg = {
      gap: num('--fs-bubble-gap', 10),
      locale: str('--fs-locale', 'fa-IR'),
      sign: str('--fs-percent-sign', '٪'),
      maxChars: num('--fs-heading-max-chars', 80),
      edgeHit: num('--fs-edge-hit', 0),
    };
  }

  /* ---- شروع: کلیک روی اسکرول‌بار خود ابسیدین ---- */
  onDown(e) {
    // روی موبایل e.button وجود ندارد / touch است؛ فقط کلیک راست موس را رد کن
    if (e.button !== undefined && e.button !== 0) return;
    // touchstart: اولین لمس را بگیر (تغییر touch به pointer در بعضی WebViewها)
    const pt = e.touches && e.touches[0] ? e.touches[0] : e;
    const raw = e.target;
    if (!(raw instanceof HTMLElement)) return;
    // FIX اصلی اندروید: روی دسکتاپ کلیک روی اسکرول‌بار target=خود اسکرولر است،
    // ولی روی موبایل لمس لبه معمولا به یک فرزند (.cm-content / .cm-line ...) می‌خورد
    // و matches(SEL) همیشه false می‌شد. پس اسکرولر را با closest پیدا می‌کنیم.
    const t = raw.closest(SEL);
    if (!t) return;
    if (t.closest('.markdown-embed, .popover, .canvas-node')) return;
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.containerEl.contains(t)) return;

    const cs = getComputedStyle(t);
    const borders = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
    let sbw = Math.max(t.offsetWidth - t.clientWidth - borders, this.cfg.edgeHit);
    // FIX اندروید: اسکرول‌بار overlay است -> sbw = 0 می‌شود و قبلاً همین‌جا return می‌شد.
    // روی تاچ، اگر sbw قابل تشخیص نبود، یک ناحیه‌ی لمس فرضی 24px کنار لبه در نظر بگیر.
    const isTouch = e.pointerType === 'touch' || !!e.touches || e.type === 'touchstart';
    if (sbw <= 0) {
      if (!isTouch) return;
      sbw = 24;
    }
    const r = t.getBoundingClientRect();
    let edge = null;
    if (pt.clientX >= r.right - sbw) edge = 'right';
    else if (pt.clientX <= r.left + sbw) edge = 'left';
    if (!edge) return;
    this.drag = { scroller: t, view, edge, sbw };
  }

  end() {
    clearTimeout(this._hideT);
    if (!this.drag) return;
    this.drag = null;
    this.bubble.classList.remove('show');
  }

  onScroll(e) {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const scroller = t.closest ? (t.closest(SEL) || (t.matches && t.matches(SEL) ? t : null)) : null;
    if (!scroller) return;

    // حالت ۱ - دسکتاپ / درگ موس: مثل سابق
    if (this.drag && !this.drag.auto) {
      if (e.target !== this.drag.scroller) return;
      this.update();
      return;
    }

    // حالت ۲ - لمس متن (درگ روی متن): هیچ‌وقت حباب نشان نده
    if (this._touchKind === 'content') { this.bubble.classList.remove('show'); return; }
    // fling بعد از رها کردن متن هم هنوز «اسکرول متن» است، نه اسکرول‌بار
    if (Date.now() - (this._contentTouchEnd || 0) < 500) { this.bubble.classList.remove('show'); return; }

    // گیت رگرسیون ویندوز: اگر دستگاه لمسی نیست، اینجا اسکرولِ چرخ موس / کیبورد /
    // جابه‌جایی خط است، نه درگ اسکرول‌بار. درگ موسِ اسکرول‌بار بالاتر (حالت ۱) پوشش داده شده.
    if (!this._isCoarse) return;

    // حالت ۳ - لمس اسکرول‌بار
    // روی اندروید مرورگر گاهی touchstartِ روی thumb را به صفحه نمی‌رساند،
    // پس این حالت را فقط با «اسکرول بدون لمسِ متن» هم تشخیص می‌دهیم.
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.containerEl.contains(scroller)) return;
    // لبه‌ی اسکرول‌بار: ۱) جای لمس (اگر touchstart رسیده باشد) ۲) جهت صفحه
    // در چیدمان RTL (مثل نوت فارسی / رابط فارسی) اسکرول‌بار معمولا سمت چپ است.
    let edge = this._touchEdge;
    if (!edge) {
      const dir = (getComputedStyle(scroller).direction || document.documentElement.dir || 'ltr').toLowerCase();
      edge = (dir === 'rtl') ? 'left' : 'right';
    }
    this.drag = { scroller, view, edge, sbw: 24, auto: true };
    this.update();
    clearTimeout(this._hideT);
    this._hideT = setTimeout(() => this.end(), 900);
  }

  update() {
    const d = this.drag;
    const s = d.scroller;
    if (!s.isConnected) { this.end(); return; }
    const max = s.scrollHeight - s.clientHeight;
    if (max <= 1) return;

    const ratio = clamp(s.scrollTop / max, 0, 1);
    this.pct.textContent = Math.round(ratio * 100).toLocaleString(this.cfg.locale) + this.cfg.sign;
    this.sec.textContent = this.headingAt(ratio);
    this.bubble.classList.add('show');

    // هم‌راستا با دستگیره‌ی native
    const r = s.getBoundingClientRect();
    const ch = s.clientHeight;
    const thumbH = clamp((ch * ch) / s.scrollHeight, 20, ch);
    const thumbY = r.top + ratio * (ch - thumbH);
    const bw = this.bubble.offsetWidth;
    const bh = this.bubble.offsetHeight;
    const top = clamp(thumbY + thumbH / 2 - bh / 2, r.top, Math.max(r.top, r.bottom - bh));
    const left = d.edge === 'right'
      ? r.right - d.sbw - this.cfg.gap - bw
      : r.left + d.sbw + this.cfg.gap;
    this.bubble.style.top = top + 'px';
    this.bubble.style.left = left + 'px';
  }

  headingAt(ratio) {
    try {
      const view = this.drag.view;
      if (!view || !view.file) return '';
      const hs = this.app.metadataCache.getFileCache(view.file)?.headings;
      if (!hs || !hs.length) return '';
      let line = view.currentMode && view.currentMode.getScroll ? view.currentMode.getScroll() : NaN;
      if (typeof line !== 'number' || isNaN(line)) {
        line = ratio * ((view.data || '').split('\n').length);
      }
      let cur = hs[0];
      for (const h of hs) {
        if (h.position.start.line <= line + 1) cur = h; else break;
      }
      return cleanHeading(cur.heading, this.cfg.maxChars);
    } catch (e) { return ''; }
  }
};
