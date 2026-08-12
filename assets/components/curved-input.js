(() => {
  'use strict';

  const THEMES = {
    dark: { background: '#1B1722', text: '#f5f5f5', placeholder: '#a1a1aa', border: '#392e4e', accent: '#A855F7' },
    light: { background: '#ffffff', text: '#1d2050', placeholder: '#737a75', border: '#262a56', accent: '#4763eb' }
  };

  class CurvedInput {
    constructor(root, options = {}) {
      this.root = root;
      this.options = {
        placeholder: 'Enter your email', type: 'email', theme: 'dark', bend: 28,
        height: 64, width: 450, fontSize: 16, borderWidth: 1.5, ...options
      };
      this.value = '';
      this.renderShell();
      this.observer = new ResizeObserver(() => this.draw());
      this.observer.observe(root);
      this.draw();
    }

    renderShell() {
      this.root.classList.add('curved-input');
      this.root.style.width = typeof this.options.width === 'number' ? `${this.options.width}px` : this.options.width;
      this.root.innerHTML = '<svg class="curved-input__svg" aria-hidden="true"></svg><input class="curved-input__field">';
      this.svg = this.root.querySelector('svg');
      this.input = this.root.querySelector('input');
      this.input.type = ['text', 'search', 'email', 'tel', 'url', 'password'].includes(this.options.type) ? this.options.type : 'text';
      this.input.setAttribute('aria-label', this.options.ariaLabel || this.options.placeholder);
      this.input.autocomplete = 'off';
      this.input.spellcheck = false;
      this.input.addEventListener('input', () => {
        this.value = this.input.value;
        this.draw();
        this.root.dispatchEvent(new CustomEvent('curved-input-change', { bubbles: true, detail: { value: this.value } }));
      });
      this.input.addEventListener('focus', () => { this.root.classList.add('curved-input--focused'); this.draw(); });
      this.input.addEventListener('blur', () => { this.root.classList.remove('curved-input--focused'); this.draw(); });
    }

    draw() {
      const width = Math.max(240, Math.round(this.root.getBoundingClientRect().width || this.options.width));
      const height = this.options.height;
      const bend = Math.max(-width * .25, Math.min(Number(this.options.bend), width * .25));
      const pad = 8;
      const svgHeight = height + Math.abs(bend) + pad * 2;
      const topY = bend >= 0 ? pad + Math.abs(bend) : pad;
      const bottomY = topY + height;
      const middleY = topY + height / 2;
      const curve = `M 1 ${middleY + bend} Q ${width / 2} ${middleY - bend} ${width - 1} ${middleY + bend}`;
      const band = `M 18 ${topY + bend} Q ${width / 2} ${topY - bend} ${width - 18} ${topY + bend} Q ${width - 1} ${topY + bend} ${width - 1} ${topY + 18 + bend} L ${width - 1} ${bottomY - 18 + bend} Q ${width - 1} ${bottomY + bend} ${width - 18} ${bottomY + bend} Q ${width / 2} ${bottomY - bend} 18 ${bottomY + bend} Q 1 ${bottomY + bend} 1 ${bottomY - 18 + bend} L 1 ${topY + 18 + bend} Q 1 ${topY + bend} 18 ${topY + bend} Z`;
      const palette = THEMES[this.options.theme] || THEMES.dark;
      const shown = this.value || this.options.placeholder;
      const color = this.value ? palette.text : palette.placeholder;
      const caretX = Math.min(width - 28, 24 + this.value.length * this.options.fontSize * .56);
      this.svg.setAttribute('viewBox', `0 0 ${width} ${svgHeight}`);
      this.svg.innerHTML = `
        <path class="curved-input__ring" d="${band}" fill="none" stroke="${palette.accent}" stroke-width="8"></path>
        <path d="${band}" fill="${palette.background}" stroke="${palette.border}" stroke-width="${this.options.borderWidth}"></path>
        <path id="curved-input-path" d="${curve}" fill="none"></path>
        <text fill="${color}" font-size="${this.options.fontSize}" font-weight="500">
          <textPath href="#curved-input-path" startOffset="24">${this.escape(shown)}</textPath>
        </text>
        ${this.root.classList.contains('curved-input--focused') ? `<line x1="${caretX}" x2="${caretX}" y1="${middleY - 11}" y2="${middleY + 11}" stroke="${palette.text}" stroke-width="1.5"><animate attributeName="opacity" values="1;0" dur="1.06s" calcMode="discrete" repeatCount="indefinite"></animate></line>` : ''}`;
    }

    escape(value) {
      return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
    }
  }

  window.CurvedInput = CurvedInput;
})();
