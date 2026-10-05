/* =====================================================
   ЯКарта.Про — landing scripts
   ===================================================== */

(() => {
  'use strict';

  /* ---------- 0. Yandex.Metrika goals ---------- */
  function reachGoal(name) {
    if (typeof ym === 'function') ym(109336259, 'reachGoal', name);
  }

  /* ---------- 1. Year in footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('yakarta-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('yakarta-theme', next);
  });

  /* ---------- 3. Mobile burger ---------- */
  const burger = document.getElementById('burger');
  const menu = document.querySelector('.nav__menu');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    menu?.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger?.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 4. Scroll reveal ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 5. Counters: final value immediately (no RAF) ---------- */
  const counters = document.querySelectorAll('.num[data-count]');
  counters.forEach((el) => {
    const target = el.dataset.count;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = prefix + target + suffix;
  });

  /* ---------- 5b. Before/after compare slider ---------- */
  const baRange = document.getElementById('baRange');
  const baClip = document.getElementById('baClip');
  const baHandle = document.getElementById('baHandle');
  if (baRange && baClip && baHandle) {
    const syncBa = (v) => {
      const pct = Math.max(0, Math.min(100, Number(v)));
      baClip.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      baHandle.style.left = pct + '%';
    };
    baRange.addEventListener('input', () => syncBa(baRange.value));
    syncBa(baRange.value);
  }

  /* ---------- 6. Compare tabs (mobile) ---------- */
  const compareTabsEl  = document.getElementById('compareTabs');
  const compareTabs    = document.querySelectorAll('.compare-tab');
  const comparePanes   = document.querySelectorAll('[data-tab-pane]');
  const compareHint    = document.getElementById('compareHint');
  let   hintDismissed  = false;
  let   currentTab     = 'bad'; // track current to decide slide direction

  const enterPaneAnimation = (pane, direction) => {
    const cls = direction === 'right' ? 'pane-enter-right' : 'pane-enter-left';
    pane.classList.remove('pane-enter-right', 'pane-enter-left');
    void pane.offsetWidth; // reflow to restart animation
    pane.classList.add(cls);
    pane.addEventListener('animationend', () => pane.classList.remove(cls), { once: true });
  };

  const dismissHint = () => {
    if (hintDismissed) return;
    hintDismissed = true;
    compareTabsEl?.classList.remove('tabs-hint-active');
    if (compareHint) {
      compareHint.classList.remove('hint-visible');
      compareHint.classList.add('hint-hidden');
      compareHint.addEventListener('animationend', () => {
        compareHint.style.display = 'none';
      }, { once: true });
    }
  };

  const setActiveCompare = (key, fromClick = false) => {
    const isMobile = window.innerWidth <= 820;
    const direction = key === 'good' ? 'right' : 'left';

    compareTabs.forEach((t) => {
      const active = t.dataset.tab === key;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });

    comparePanes.forEach((p) => {
      const willBeActive = p.dataset.tabPane === key;
      p.classList.toggle('is-active', willBeActive);
      if (willBeActive && isMobile && fromClick) {
        enterPaneAnimation(p, direction);
      }
    });

    currentTab = key;
    if (fromClick) dismissHint();
  };

  compareTabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveCompare(tab.dataset.tab, true));
  });

  /* Hint: fires when compare section scrolls into view on mobile */
  const triggerHint = () => {
    if (hintDismissed || window.innerWidth > 820) return;
    compareTabsEl?.classList.add('tabs-hint-active');
    if (compareHint) {
      compareHint.classList.add('hint-visible');
    }
    // Auto-dismiss after 6s
    setTimeout(() => {
      if (!hintDismissed) dismissHint();
    }, 6000);
  };

  const compareSection = document.getElementById('compare');
  if (compareSection && 'IntersectionObserver' in window) {
    const hintObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !hintDismissed) {
          // Small delay so user sees the section first
          setTimeout(triggerHint, 800);
          hintObserver.unobserve(compareSection);
        }
      });
    }, { threshold: 0.4 });
    hintObserver.observe(compareSection);
  }

  const syncCompareForViewport = () => {
    if (window.innerWidth <= 820) {
      const active = document.querySelector('.compare-tab.is-active');
      setActiveCompare(active?.dataset.tab || 'bad');
    } else {
      comparePanes.forEach((p) => p.classList.remove('is-active'));
      dismissHint();
    }
  };
  syncCompareForViewport();
  window.addEventListener('resize', syncCompareForViewport, { passive: true });

  /* ---------- 7. FAQ — animated accordion ---------- */
  const faqItems = document.querySelectorAll('.faq__item');

  // CSS grid-template-rows trick works natively in modern browsers for <details>
  // but we also need to close others and add a brief scale pop to summary
  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');

    summary?.addEventListener('click', (e) => {
      e.preventDefault(); // we'll control open ourselves

      const isOpen = item.open;

      // Close all others first
      faqItems.forEach((other) => {
        if (other !== item && other.open) {
          other.open = false;
        }
      });

      if (!isOpen) {
        item.open = true;
        // micro pop on the icon
        const icon = item.querySelector('.faq__icon');
        if (icon) {
          icon.style.transform = 'scale(1.25)';
          setTimeout(() => { icon.style.transform = ''; }, 200);
        }
      } else {
        item.open = false;
      }
    });
  });

  /* ---------- 8. Lead form ---------- */
  const form = document.getElementById('leadForm');
  const success = document.getElementById('formSuccess');

  function sanitize(str) {
    return String(str)
      .replace(/[<>"'`;]/g, '')
      .trim()
      .slice(0, 500);
  }

  function setFieldError(input, msg) {
    const field = input.closest('.field');
    if (!field) return;
    field.classList.add('field--error');
    let errEl = field.querySelector('.field__error-msg');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field__error-msg';
      field.appendChild(errEl);
    }
    errEl.textContent = msg;
  }

  function clearFieldErrors() {
    form.querySelectorAll('.field').forEach((f) => {
      f.classList.remove('field--error');
      const errEl = f.querySelector('.field__error-msg');
      if (errEl) errEl.textContent = '';
    });
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors();

    const submitBtn = form.querySelector('[type="submit"]');
    const data = new FormData(form);

    const nameVal    = (data.get('name')    || '').trim();
    const phoneVal   = (data.get('phone')   || '').trim();
    const messageVal = (data.get('message') || '').trim();
    const cardVal    = (data.get('card')    || '').trim();

    let valid = true;

    // Validate name
    const nameInput = form.querySelector('[name="name"]');
    if (!nameVal) {
      setFieldError(nameInput, 'Пожалуйста, введите ваше имя');
      valid = false;
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]{2,60}$/.test(nameVal)) {
      setFieldError(nameInput, 'Имя должно содержать только буквы, пробелы и дефис (2–60 символов)');
      valid = false;
    }

    // Validate phone
    const phoneInput = form.querySelector('[name="phone"]');
    if (!phoneVal) {
      setFieldError(phoneInput, 'Пожалуйста, введите телефон или Telegram-ник');
      valid = false;
    } else if (phoneVal.startsWith('@')) {
      if (!/^@[a-zA-Z0-9_]{3,32}$/.test(phoneVal)) {
        setFieldError(phoneInput, 'Telegram-ник должен содержать 3–32 символа (буквы, цифры, _)');
        valid = false;
      }
    } else if (!/^[\+]?[0-9\s\-\(\)]{6,20}$/.test(phoneVal)) {
      setFieldError(phoneInput, 'Введите номер телефона или Telegram-ник (начиная с @)');
      valid = false;
    }

    // Validate message (optional)
    if (messageVal) {
      const messageInput = form.querySelector('[name="message"]');
      if (messageVal.length > 500) {
        setFieldError(messageInput, 'Сообщение не должно превышать 500 символов');
        valid = false;
      } else if (/[<>]/.test(messageVal) || /;|--/.test(messageVal)) {
        setFieldError(messageInput, 'Сообщение содержит недопустимые символы');
        valid = false;
      }
    }

    // Validate card (optional)
    if (cardVal) {
      const cardInput = form.querySelector('[name="card"]');
      if (cardVal.length > 200) {
        setFieldError(cardInput, 'Ссылка не должна превышать 200 символов');
        valid = false;
      } else if (!/^https?:\/\//i.test(cardVal)) {
        setFieldError(cardInput, 'Ссылка должна начинаться с http:// или https://');
        valid = false;
      }
    }

    if (!valid) return;

    try {
      if (submitBtn) submitBtn.disabled = true;

      // Show success immediately, do not wait for Telegram
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
      reachGoal('lead_form_submit');

      // Fire-and-forget Telegram send
      const t1 = '8515497401';
      const t2 = 'AAHNEG2-BY8d0qwWwl7SQfuwAzyBgtG1sWM';
      const tgUrl = `https://api.telegram.org/bot${t1}:${t2}/sendMessage`;

      const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
      const cardLine = cardVal ? `\n🔗 Карточка: ${sanitize(cardVal)}` : '';
      const text = `🔔 *Новая заявка с сайта yakarta.pro*\n\n👤 Имя: ${sanitize(nameVal)}\n📞 Телефон: ${sanitize(phoneVal)}\n💬 Сообщение: ${sanitize(messageVal) || '—'}${cardLine}\n\n🕐 Время: ${now}`;

      const tgParams = new URLSearchParams({
        chat_id: '685758117',
        text: text,
        parse_mode: 'Markdown'
      });

      fetch(`${tgUrl}?${tgParams.toString()}`)
        .then((r) => r.json())
        .then((r) => { if (!r.ok) console.warn('Telegram error:', r); })
        .catch((err) => console.warn('Telegram send failed:', err));

      // Fire-and-forget email через Flask
      fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sanitize(nameVal), phone: sanitize(phoneVal), message: sanitize(messageVal) })
      }).catch(e => console.warn('Email send failed:', e));
    } catch (err) {
      console.error('Form submit error:', err);
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------- 9. Floating action button ---------- */
  const fab = document.querySelector('.fab');
  const hero = document.querySelector('.hero');

  if (fab && hero && 'IntersectionObserver' in window) {
    const fabObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        fab.classList.toggle('is-visible', !e.isIntersecting);
      });
    }, { threshold: 0.2 });
    fabObserver.observe(hero);
  }

  /* ---------- 10. Smooth anchors with offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- 11. Nav scrolled state ---------- */
  const navEl = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    navEl?.classList.toggle('nav--scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ---------- 12. Hero quick form ---------- */
  const heroQuickSubmit = document.getElementById('heroQuickSubmit');
  const heroQuickForm  = document.getElementById('heroQuickForm');

  heroQuickSubmit?.addEventListener('click', () => {
    const input = heroQuickForm?.querySelector('input');
    const val = input?.value?.trim();
    if (!val) {
      input?.focus();
      heroQuickForm?.classList.add('hero__quickform--shake');
      setTimeout(() => heroQuickForm?.classList.remove('hero__quickform--shake'), 500);
      return;
    }

    reachGoal('hero_quick_submit');

    const ctaSection = document.querySelector('#cta');
    const contactField = document.querySelector('[name="phone"]');
    if (contactField) contactField.value = val;

    const navHeight = navEl?.offsetHeight || 0;
    const top = (ctaSection?.getBoundingClientRect().top || 0) + window.scrollY - navHeight + 1;
    window.scrollTo({ top, behavior: 'smooth' });

    const flash = document.createElement('p');
    flash.className = 'cta__success';
    flash.style.cssText = 'display:block; margin-bottom:12px;';
    flash.textContent = 'Отлично! Уточните детали в форме ниже.';
    const ctaForm = document.getElementById('leadForm');
    if (ctaForm && !ctaForm.querySelector('.qf-flash')) {
      flash.classList.add('qf-flash');
      ctaForm.prepend(flash);
      setTimeout(() => flash.remove(), 5000);
    }
  });

  /* ---------- 13. Video modal ---------- */
  const videoTrigger = document.getElementById('videoTrigger');
  const videoModal   = document.getElementById('videoModal');
  const videoPlayer  = document.getElementById('videoModalPlayer');
  const videoClose   = document.getElementById('videoModalClose');

  const openVideoModal = () => {
    if (!videoModal) return;
    videoModal.showModal();
    videoPlayer?.play();
  };
  const closeVideoModal = () => {
    if (!videoModal) return;
    videoModal.close();
    if (videoPlayer) { videoPlayer.pause(); videoPlayer.currentTime = 0; }
  };

  videoTrigger?.addEventListener('click', () => {
    reachGoal('video_open');
    openVideoModal();
  });
  videoClose?.addEventListener('click', closeVideoModal);

  videoModal?.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideoModal();
  });

  videoModal?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });

  /* ---------- 14. Goal tracking: plans, messengers, phone, CTA ---------- */
  document.querySelectorAll('.plan .btn').forEach((btn) => {
    btn.addEventListener('click', () => reachGoal('click_plan'));
  });

  document.querySelectorAll('a[href^="https://t.me/"]').forEach((a) => {
    a.addEventListener('click', () => reachGoal('click_telegram'));
  });

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
    a.addEventListener('click', () => reachGoal('click_whatsapp'));
  });

  document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    a.addEventListener('click', () => reachGoal('click_phone'));
  });

  document.querySelector('.fab')?.addEventListener('click', () => reachGoal('fab_click'));
})();
