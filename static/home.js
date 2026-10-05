(() => {
  'use strict';

  const heroVideo = document.querySelector('[data-hero-video]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection?.saveData);

  const configureHeroVideo = () => {
    if (!heroVideo) return;
    if (reducedMotion.matches || saveData) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
      return;
    }

    const start = () => {
      heroVideo.defaultPlaybackRate = 0.4;
      heroVideo.playbackRate = 0.4;
      heroVideo.play().catch(() => {});
    };

    if (heroVideo.readyState >= 1) start();
    else heroVideo.addEventListener('loadedmetadata', start, { once: true });
  };

  configureHeroVideo();
  reducedMotion.addEventListener?.('change', configureHeroVideo);
  document.addEventListener('visibilitychange', () => {
    if (!heroVideo || reducedMotion.matches || saveData) return;
    if (document.hidden) heroVideo.pause();
    else heroVideo.play().catch(() => {});
  });

  const control = document.querySelector('.yh-control');
  const canAnimate = window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (control && canAnimate) {
    control.addEventListener('pointermove', (event) => {
      const rect = control.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      control.style.transform = `perspective(900px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg)`;
    });
    control.addEventListener('pointerleave', () => {
      control.style.transform = '';
    });
  }

  document.querySelectorAll('.yh-pricing-layout a, .yh-service').forEach((link) => {
    link.addEventListener('click', () => {
      if (typeof window.ym === 'function') window.ym(109336259, 'reachGoal', 'service_interest');
    });
  });

  const leadMessage = document.getElementById('lead-message');
  const leadName = document.getElementById('lead-name');

  document.querySelectorAll('[data-offer]').forEach((link) => {
    link.addEventListener('click', () => {
      if (leadMessage && !leadMessage.value.trim()) {
        leadMessage.value = `Интересует: ${link.dataset.offer}. Нужна оценка стоимости и сроков.`;
      }
      window.setTimeout(() => leadName?.focus({ preventScroll: true }), 650);
    });
  });

  document.getElementById('promoApply')?.addEventListener('click', () => {
    if (leadMessage) {
      leadMessage.value = 'Хочу воспользоваться скидкой 15% на первый спринт. Нужна предварительная оценка задачи.';
    }
    if (typeof window.ym === 'function') window.ym(109336259, 'reachGoal', 'promo_first_sprint');
    window.setTimeout(() => leadName?.focus({ preventScroll: true }), 650);
  });
})();
