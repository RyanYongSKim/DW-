(() => {
  'use strict';

  class ScrollStack {
    constructor(root, options = {}) {
      this.root = root;
      this.options = {
        itemDistance: 34,
        itemScale: 0.018,
        itemStackDistance: 12,
        stackPosition: 18,
        baseScale: 0.92,
        blurAmount: 0,
        ...options
      };
      this.cards = [];
      this.frame = null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.update = this.update.bind(this);
      this.requestUpdate = this.requestUpdate.bind(this);
      root.classList.add('scroll-stack');
      root.style.setProperty('--scroll-stack-distance', `${this.options.itemDistance}px`);
      this.observer = new MutationObserver(() => this.refresh());
      this.observer.observe(root, { childList: true });
      window.addEventListener('scroll', this.requestUpdate, { passive: true });
      window.addEventListener('resize', this.requestUpdate, { passive: true });
      this.refresh();
    }

    refresh() {
      this.cards = [...this.root.querySelectorAll('.scroll-stack-card')];
      this.cards.forEach((card, index) => {
        card.style.setProperty('--scroll-stack-index', String(index + 1));
        card.style.setProperty('--scroll-stack-top', `${this.options.stackPosition + index * this.options.itemStackDistance}px`);
        card.style.setProperty('--scroll-stack-mobile-top', `${10 + index * 5}px`);
      });
      this.requestUpdate();
    }

    requestUpdate() {
      if (this.frame) return;
      this.frame = requestAnimationFrame(this.update);
    }

    update() {
      this.frame = null;
      if (this.reducedMotion.matches) return;
      this.cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const pinTop = this.options.stackPosition + index * this.options.itemStackDistance;
        const progress = Math.max(0, Math.min(1, (pinTop - rect.top + 90) / 180));
        const targetScale = Math.min(1, this.options.baseScale + index * this.options.itemScale);
        const scale = 1 - progress * (1 - targetScale);
        const depth = Math.max(0, this.cards.length - index - 1);
        const blur = progress * depth * this.options.blurAmount;
        card.style.transform = `translate3d(0, 0, 0) scale(${scale.toFixed(3)})`;
        card.style.filter = blur ? `blur(${blur.toFixed(2)}px)` : '';
      });
    }

    destroy() {
      this.observer.disconnect();
      window.removeEventListener('scroll', this.requestUpdate);
      window.removeEventListener('resize', this.requestUpdate);
      if (this.frame) cancelAnimationFrame(this.frame);
      this.cards.forEach(card => {
        card.style.transform = '';
        card.style.filter = '';
      });
    }
  }

  window.ScrollStack = ScrollStack;
})();
