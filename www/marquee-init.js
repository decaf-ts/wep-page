// Initializes marquee behavior on specific sections after content render
// Applies opposite directions to brands and modules (features) lists.
(function () {
  function applyMarquees() {
    if (!window.DecafMarquee) return;
    const brands = document.getElementById('brands-grid');
    if (brands && brands.children.length) {
      window.DecafMarquee.setup(brands, { direction: 'left', pxPerSec: 30, gapPx: 32, fade: true, fadeWidth: 64 });
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(() => {
    // If DecafContent is present, wrap its renderAll to re-apply marquees after rerenders
    if (window.DecafContent && typeof window.DecafContent.renderAll === 'function') {
      const orig = window.DecafContent.renderAll.bind(window.DecafContent);
      window.DecafContent.renderAll = function (dict) {
        const res = orig(dict);
        // Apply on next frame to ensure DOM nodes are in place
        requestAnimationFrame(applyMarquees);
        return res;
      };
    }
    // Also attempt once on load in case content is static/early
    requestAnimationFrame(applyMarquees);
  });
})();
