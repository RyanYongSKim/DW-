(() => {
  'use strict';

  class OrbitingItems3D {
    constructor(root, options = {}) {
      this.root = root;
      this.options = { radiusX: 37, radiusY: 22, tiltAngle: -12, duration: 18000, ...options };
      this.items = [];
      this.frame = null;
      this.startTime = performance.now();
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      root.classList.add('orbiting-items-3d');
      this.center = root.querySelector('.orbiting-items-3d__center');
      this.animate = this.animate.bind(this);
      this.frame = requestAnimationFrame(this.animate);
    }

    update(items) {
      this.items = items;
      this.root.querySelectorAll('.orbiting-items-3d__item').forEach(item => item.remove());
      items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'orbiting-items-3d__item';
        element.dataset.status = item.status;
        element.setAttribute('aria-label', `${item.label} ${item.value}건`);
        element.innerHTML = `<span>${this.escape(item.label)}<strong>${Number(item.value) || 0}</strong></span>`;
        this.root.append(element);
      });
      this.position(performance.now());
    }

    animate(time) {
      this.position(time);
      this.frame = requestAnimationFrame(this.animate);
    }

    position(time) {
      const elements = [...this.root.querySelectorAll('.orbiting-items-3d__item')];
      const total = Math.max(1, elements.length);
      const elapsed = this.reducedMotion.matches ? 0 : (time - this.startTime) / this.options.duration;
      const tilt = this.options.tiltAngle * Math.PI / 180;
      elements.forEach((element, index) => {
        const angle = (elapsed * Math.PI * 2) + (index * Math.PI * 2 / total);
        const x = this.options.radiusX * Math.cos(angle);
        const y = this.options.radiusY * Math.sin(angle);
        const xTilted = x * Math.cos(tilt) - y * Math.sin(tilt);
        const yTilted = x * Math.sin(tilt) + y * Math.cos(tilt);
        const front = Math.sin(angle) >= 0;
        element.style.left = `${50 + xTilted}%`;
        element.style.top = `${50 + yTilted}%`;
        element.style.zIndex = front ? '4' : '1';
        element.style.transform = `translate(-50%, -50%) scale(${front ? 1.06 : .88})`;
        element.style.opacity = front ? '1' : '.68';
      });
    }

    escape(value) {
      return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
    }

    destroy() {
      if (this.frame) cancelAnimationFrame(this.frame);
    }
  }

  window.OrbitingItems3D = OrbitingItems3D;
})();
