/* =====================================================
   ЯКарта.Про — landing scripts
   ===================================================== */

(() => {
  'use strict';

  /* ---------- 0. Yandex.Metrika goals ---------- */
  function reachGoal(name, params = {}) {
    if (typeof ym === 'function') ym(109336259, 'reachGoal', name, params);
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
  const menu = document.querySelector('.site-nav, .nav__menu');
  const servicesGroup = document.querySelector('.site-nav__group');
  const servicesToggle = document.getElementById('servicesMenuButton');
  const closeServices = (restoreFocus = false) => {
    servicesGroup?.classList.remove('is-open');
    servicesToggle?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) servicesToggle?.focus();
  };
  const closeMobileMenu = (restoreFocus = false) => {
    menu?.classList.remove('is-open');
    burger?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    burger?.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('menu-open');
    if (restoreFocus) burger?.focus();
  };
  servicesToggle?.addEventListener('click', () => {
    const open = !servicesGroup?.classList.contains('is-open');
    servicesGroup?.classList.toggle('is-open', open);
    servicesToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (servicesGroup && !servicesGroup.contains(event.target)) closeServices();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (servicesGroup?.classList.contains('is-open')) closeServices(true);
    else if (menu?.classList.contains('is-open')) closeMobileMenu(true);
  });
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    menu?.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
    if (open) window.requestAnimationFrame(() => servicesToggle?.focus());
  });
  menu?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      closeServices();
      closeMobileMenu();
    });
  });

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    const linkPath = url.pathname.replace(/\/+$/, '') || '/';
    if (url.origin === window.location.origin && linkPath !== '/' && linkPath === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });
  if (currentPath.startsWith('/services/')) servicesToggle?.setAttribute('aria-current', 'page');

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

  if (form) {
    const params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = params.get(key) || '';
    });
    const sourceInput = form.querySelector('[name="source_page"]');
    const requestedSource = params.get('from') || '';
    const sourcePath = /^\/[A-Za-z0-9_./-]*$/.test(requestedSource) && !requestedSource.startsWith('//')
      ? requestedSource
      : window.location.pathname;
    if (sourceInput) sourceInput.value = sourcePath;
    const offerInput = form.querySelector('[name="offer"]');
    if (offerInput && params.get('offer')) offerInput.value = params.get('offer').slice(0, 160);
    const locationInput = form.querySelector('[name="cta_location"]');
    if (locationInput && params.get('cta')) locationInput.value = params.get('cta').slice(0, 120);
  }

  // Anti-Bot: Set dynamic render timestamp
  const pageLoadTs = (Date.now() / 1000).toFixed(2);
  document.querySelectorAll('input[name="form_render_ts"]').forEach((el) => {
    el.value = pageLoadTs;
  });

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
    input.setAttribute('aria-invalid', 'true');
    let errEl = field.querySelector('.field__error-msg');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field__error-msg';
      errEl.id = `${input.id || input.name}-error`;
      errEl.setAttribute('role', 'alert');
      field.appendChild(errEl);
    }
    input.setAttribute('aria-describedby', errEl.id);
    errEl.textContent = msg;
  }

  function clearFieldErrors() {
    form.querySelectorAll('.field').forEach((f) => {
      f.classList.remove('field--error');
      const input = f.querySelector('input, textarea, select');
      input?.removeAttribute('aria-invalid');
      input?.removeAttribute('aria-describedby');
      const errEl = f.querySelector('.field__error-msg');
      if (errEl) errEl.textContent = '';
    });
  }

  function setFormStatus(message, kind = 'info') {
    const status = form?.querySelector('[data-form-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.kind = kind;
    status.hidden = !message;
    if (message && kind === 'error') status.focus({ preventScroll: true });
  }

  form?.addEventListener('input', () => {
    if (!form.dataset.started) {
      form.dataset.started = 'true';
      reachGoal('lead_form_start');
    }
  }, { once: true });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    reachGoal('lead_form_submit_attempt', {
      path: window.location.pathname,
      offer: form.querySelector('[name="offer"]')?.value || '',
      location: form.querySelector('[name="cta_location"]')?.value || 'lead-form'
    });
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

    // Validate card / website (optional)
    if (cardVal) {
      const cardInput = form.querySelector('[name="card"]');
      if (cardVal.length > 300) {
        setFieldError(cardInput, 'Ссылка не должна превышать 300 символов');
        valid = false;
      } else {
        const siteData = validateAndFormatWebsite(cardVal);
        if (!siteData) {
          setFieldError(cardInput, 'Укажите корректный адрес сайта (например, site.ru или https://site.ru)');
          valid = false;
        } else {
          cardInput.value = siteData.formatted;
        }
      }
    }

    if (!valid) {
      setFormStatus('Проверьте отмеченные поля.', 'error');
      form.querySelector('[aria-invalid="true"]')?.focus();
      reachGoal('lead_form_validation_error');
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.setAttribute('aria-busy', 'true');
      setFormStatus('Отправляем заявку…');

      const csrftoken = form.querySelector('[name="csrfmiddlewaretoken"]')?.value || '';
      // Re-read the form after normalization (for example, site.ru -> https://site.ru).
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.source_page = payload.source_page || window.location.pathname;

      // JSON is accepted by both the Django endpoint and the minimal production WSGI app.
      fetch(form.getAttribute('action') || '/leads/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(payload)
      })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
        return body;
      })
      .then((resData) => {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.removeAttribute('aria-busy');
        if (resData.success) {
          if (success) {
            success.hidden = false;
            success.focus({ preventScroll: true });
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            success.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
          }
          form.reset();
          form.dataset.started = '';
          setFormStatus('');
          reachGoal('lead_form_submit');
        } else {
          throw new Error(resData.error || 'Произошла ошибка при отправке заявки.');
        }
      })
      .catch((err) => {
        console.warn('Lead submit background sync:', err);
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.removeAttribute('aria-busy');
        setFormStatus(`${err.message || 'Не удалось отправить заявку.'} Можно написать напрямую в Telegram: @YaKartapro`, 'error');
        reachGoal('lead_form_submit_error');
      });
    } catch (err) {
      console.error('Form submit error:', err);
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------- 9. Floating action button ---------- */
  const fab = document.querySelector('.fab, .promo-float');
  const hero = document.querySelector('.hero, .yh-hero, .v2-hero, .hub-hero');

  if (fab && hero && 'IntersectionObserver' in window) {
    const fabObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        fab.classList.toggle('is-visible', !e.isIntersecting);
      });
    }, { threshold: 0.2 });
    fabObserver.observe(hero);
  }

  /* ---------- 9b. Testimonials: expand / collapse ---------- */
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach((card) => {
    const textEl = card.querySelector('.review-card__text');
    const toggle = card.querySelector('.review-toggle');
    if (!textEl || !toggle) return;

    if (textEl.scrollHeight > 105) {
      toggle.style.display = 'inline-block';
    }

    toggle.addEventListener('click', () => {
      const isExpanded = textEl.classList.toggle('is-expanded');
      toggle.textContent = isExpanded ? 'Свернуть' : 'Читать полностью';
    });
  });

  /* ---------- 10. Smooth anchors with offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('.site-header, .nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 11. Nav scrolled state ---------- */
  const navEl = document.querySelector('.site-header, .nav');
  window.addEventListener('scroll', () => {
    navEl?.classList.toggle('nav--scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ---------- 12. Website Validation Helper ---------- */
  function validateAndFormatWebsite(inputVal) {
    if (!inputVal) return null;
    let val = String(inputVal).trim().replace(/^[<"']+|[>"']+$/g, '');
    if (!val) return null;
    
    // Support international domains and Cyrillic (.рф, etc.)
    const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9А-Яа-яёЁ0-9_-]+\.)+[a-zA-ZА-Яа-яёЁ]{2,}(\/.*)?$/i;
    if (!domainRegex.test(val)) {
      return null;
    }
    
    const formattedUrl = /^https?:\/\//i.test(val) ? val : 'https://' + val;
    return {
      raw: val,
      formatted: formattedUrl
    };
  }

  /* ---------- 13. Hero quick form (Audit by Website) ---------- */
  const heroQuickSubmit = document.getElementById('heroQuickSubmit');
  const heroQuickForm  = document.getElementById('heroQuickForm');
  const heroQuickInput = heroQuickForm?.querySelector('input');

  function showQuickFormError(msg) {
    if (!heroQuickForm) return;
    heroQuickForm.classList.add('hero__quickform--error', 'hero__quickform--shake');
    setTimeout(() => heroQuickForm.classList.remove('hero__quickform--shake'), 500);
    
    const parentWrap = heroQuickForm.parentElement;
    let errEl = parentWrap?.querySelector('.hero__quickform-error-msg');
    if (!errEl && parentWrap) {
      errEl = document.createElement('div');
      errEl.className = 'hero__quickform-error-msg';
      parentWrap.appendChild(errEl);
    }
    if (errEl) errEl.textContent = msg;
    heroQuickInput?.focus();
  }

  function clearQuickFormError() {
    heroQuickForm?.classList.remove('hero__quickform--error');
    const errEl = heroQuickForm?.parentElement?.querySelector('.hero__quickform-error-msg');
    if (errEl) errEl.remove();
  }

  heroQuickInput?.addEventListener('input', clearQuickFormError);
  heroQuickInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      heroQuickSubmit?.click();
    }
  });

  heroQuickSubmit?.addEventListener('click', () => {
    clearQuickFormError();
    const rawVal = heroQuickInput?.value?.trim();
    if (!rawVal) {
      showQuickFormError('Пожалуйста, введите адрес вашего сайта (например, site.ru)');
      return;
    }

    const siteData = validateAndFormatWebsite(rawVal);
    if (!siteData) {
      showQuickFormError('Пожалуйста, укажите корректный адрес сайта (например, site.ru или https://site.ru)');
      return;
    }

    reachGoal('hero_quick_submit');

    // Fill the website field (name="card") in the lead form — NOT the phone field!
    const ctaSection = document.querySelector('#cta');
    const websiteField = document.querySelector('[name="card"]') || document.querySelector('[name="website"]');
    if (websiteField) {
      websiteField.value = siteData.formatted;
    }

    // Scroll smoothly to the CTA form
    const navHeight = navEl?.offsetHeight || 0;
    const top = (ctaSection?.getBoundingClientRect().top || 0) + window.scrollY - navHeight + 1;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });

    // Focus the next empty field (Name or Phone)
    setTimeout(() => {
      const nameField = document.querySelector('[name="name"]');
      if (nameField && !nameField.value) {
        nameField.focus();
      } else {
        const phoneField = document.querySelector('[name="phone"]');
        phoneField?.focus();
      }
    }, 550);

    // Show flash message in lead form
    const flash = document.createElement('p');
    flash.className = 'cta__success';
    flash.style.cssText = 'display:block; margin-bottom:12px; font-weight:600;';
    flash.textContent = `Сайт ${siteData.raw} добавлен в заявку. Укажите ваше имя и контакт для связи.`;
    const ctaForm = document.getElementById('leadForm');
    if (ctaForm) {
      const existingFlash = ctaForm.querySelector('.qf-flash');
      if (existingFlash) existingFlash.remove();
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

  /* ---------- Compact mobile sections ---------- */
  const bindSectionToggle = (sectionSelector, toggleSelector, collapsedLabel, expandedLabel) => {
    const section = document.querySelector(sectionSelector);
    const toggle = section?.querySelector(toggleSelector);
    if (!section || !toggle) return;
    toggle.addEventListener('click', () => {
      const expanded = section.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      if (toggle.firstChild) toggle.firstChild.nodeValue = `${expanded ? expandedLabel : collapsedLabel} `;
    });
  };
  bindSectionToggle('#showcase', '.yh-showcase-more-toggle', 'Показать ещё два примера', 'Скрыть дополнительные примеры');
  bindSectionToggle('#pricing', '.yh-pricing-more-toggle', 'Другие форматы работы', 'Скрыть дополнительные форматы');

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

  const promoFloat = document.getElementById('promoFloat');
  const promoTeaser = promoFloat?.querySelector('.promo-float__teaser');
  const promoClose = promoFloat?.querySelector('.promo-float__close');
  const promoAction = promoFloat?.querySelector('[data-promo-offer]');
  const setPromoState = (expanded) => {
    if (!promoFloat) return;
    promoFloat.dataset.state = expanded ? 'expanded' : 'compact';
    promoTeaser?.setAttribute('aria-expanded', String(expanded));
  };
  promoTeaser?.addEventListener('click', () => setPromoState(true));
  promoClose?.addEventListener('click', () => {
    setPromoState(false);
    promoTeaser?.focus();
  });
  const conversionSection = document.querySelector('#cta, #contact-form');
  if (promoFloat && conversionSection && 'IntersectionObserver' in window) {
    const promoObserver = new IntersectionObserver((entries) => {
      const contextHidden = entries.some((entry) => entry.isIntersecting);
      promoFloat.classList.toggle('is-context-hidden', contextHidden);
      promoFloat.toggleAttribute('inert', contextHidden);
      promoFloat.setAttribute('aria-hidden', String(contextHidden));
    }, { threshold: 0, rootMargin: '220px 0px 220px 0px' });
    promoObserver.observe(conversionSection);
  }
  promoAction?.addEventListener('click', () => {
    const message = document.querySelector('#cta textarea[name="message"], #cta input[name="message"]');
    if (message && !message.value) message.value = 'Хочу обсудить пилотный спринт за 20 000 ₽. Задача: ';
    reachGoal('promo_first_sprint');
  });
  promoFloat?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && promoFloat.dataset.state === 'expanded') {
      setPromoState(false);
      promoTeaser?.focus();
    }
  });

  document.querySelectorAll('a[href*="#cta"]').forEach((link) => {
    const container = link.closest('[data-cta-location], section[id], header, aside[id], footer');
    const location = link.dataset.ctaLocation || container?.dataset.ctaLocation || container?.id || container?.tagName?.toLowerCase() || 'content';
    const cardTitle = link.closest('.pricing-card, .yh-offer-card')?.querySelector('h3')?.textContent.trim();
    const heading = document.querySelector('h1');
    const pageTitle = (heading?.innerText || heading?.textContent || '').replace(/\s+/g, ' ').replace(/,([^\s])/g, ', $1').trim();
    const offer = link.dataset.offer || cardTitle || pageTitle || link.textContent.trim().slice(0, 80);
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#') && href.includes('/contacts/')) {
      const target = new URL(href, window.location.origin);
      target.searchParams.set('offer', offer);
      target.searchParams.set('cta', location);
      target.searchParams.set('from', window.location.pathname);
      link.setAttribute('href', `${target.pathname}${target.search}${target.hash}`);
    }
    link.addEventListener('click', () => {
      const offerInput = form?.querySelector('[name="offer"]');
      const locationInput = form?.querySelector('[name="cta_location"]');
      const messageInput = form?.querySelector('[name="message"]');
      if (offerInput) offerInput.value = offer;
      if (locationInput) locationInput.value = location.slice(0, 120);
      if (messageInput && !messageInput.value.trim() && document.body.classList.contains('service-page')) {
        messageInput.value = `Интересует: ${offer}. Нужна оценка стоимости и сроков.`;
      }
      reachGoal('cta_click', {
        location,
        offer,
        path: window.location.pathname
      });
    });
  });
})();
