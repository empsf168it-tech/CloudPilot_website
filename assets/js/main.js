/**
 * CLOUDPILOT — CORE INTERACTIVITY & UI ENGINE
 * File: assets/js/main.js
 * Vanilla JavaScript (ES6+)
 */

(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'cloudpilot_theme';

  /* ========================================================================
     1. THEME MANAGEMENT (DARK / LIGHT PERSISTENCE)
     ======================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    applyTheme(savedTheme);

    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_STORAGE_KEY, next);
      });
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach((btn) => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
      }
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
      btn.setAttribute(
        'title',
        theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
      );
    });
  }

  /* ========================================================================
     2. STICKY HEADER & MOBILE HAMBURGER MENU
     ======================================================================== */
  function initNavigation() {
    const header = document.querySelector('.cp-header');
    const mobileToggle = document.getElementById('cpMobileToggle');
    const navCollapse = document.getElementById('cpNavCollapse');

    // Scroll elevation state
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu toggle
    if (mobileToggle && navCollapse) {
      const toggleMenu = (forceState) => {
        const isOpen =
          typeof forceState === 'boolean'
            ? forceState
            : !navCollapse.classList.contains('open');

        navCollapse.classList.toggle('open', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.className = isOpen ? 'bi bi-x-lg' : 'bi bi-list';
        }
      };

      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      // Close when clicking a link
      navCollapse.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => toggleMenu(false));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (
          navCollapse.classList.contains('open') &&
          !navCollapse.contains(e.target) &&
          !mobileToggle.contains(e.target)
        ) {
          toggleMenu(false);
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navCollapse.classList.contains('open')) {
          toggleMenu(false);
        }
      });
    }

    // Active navigation state verification
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.cp-nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ========================================================================
     3. SCROLL REVEAL & ANIMATED STATISTICS COUNTERS
     ======================================================================== */
  function initScrollRevealAndCounters() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealElements = document.querySelectorAll('.reveal-up');
    if (prefersReducedMotion) {
      revealElements.forEach((el) => el.classList.add('revealed'));
    } else if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealElements.forEach((el) => revealObserver.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('revealed'));
    }

    // Animated statistics counters
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-counter'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';

      if (prefersReducedMotion || isNaN(target)) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }

      const duration = 1600;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
      };

      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      counters.forEach((c) => counterObserver.observe(c));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ========================================================================
     4. PRICING TOGGLE & COST ESTIMATOR (pricing.html)
     ======================================================================== */
  function initPricingInteractions() {
    const toggleBtns = document.querySelectorAll('[data-billing-cycle]');
    const priceEls = document.querySelectorAll('[data-price-monthly]');
    const periodEls = document.querySelectorAll('[data-price-period]');
    const billedNoteEls = document.querySelectorAll('[data-billed-note]');

    if (toggleBtns.length) {
      toggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const cycle = btn.getAttribute('data-billing-cycle');
          toggleBtns.forEach((b) => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', String(active));
          });

          priceEls.forEach((el) => {
            const monthly = el.getAttribute('data-price-monthly');
            const yearly = el.getAttribute('data-price-yearly');
            el.textContent = cycle === 'yearly' ? yearly : monthly;
          });

          periodEls.forEach((el) => {
            el.textContent = '/ month';
          });

          billedNoteEls.forEach((el) => {
            const monthlyNote = el.getAttribute('data-note-monthly');
            const yearlyNote = el.getAttribute('data-note-yearly');
            el.textContent = cycle === 'yearly' ? yearlyNote : monthlyNote;
          });
        });
      });
    }

    // Plan selection buttons on pricing cards -> pre-fill inquiry form
    const planSelectBtns = document.querySelectorAll('[data-select-plan]');
    const planSelectDropdown = document.getElementById('cpSupportPlan');
    const supportSection = document.getElementById('support-contact');

    planSelectBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const planName = btn.getAttribute('data-select-plan');
        if (planSelectDropdown && planName) {
          planSelectDropdown.value = planName;
        }
        if (supportSection) {
          e.preventDefault();
          supportSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            const nameInput = document.getElementById('cpFullName');
            if (nameInput) nameInput.focus();
          }, 550);
        }
      });
    });

    // Interactive Cloud Cost Estimator Slider (if present on pricing.html)
    const vcpuSlider = document.getElementById('estVcpu');
    const storageSlider = document.getElementById('estStorage');
    const bandwidthSlider = document.getElementById('estBandwidth');
    const estTotalOut = document.getElementById('estTotalCost');

    if (vcpuSlider && storageSlider && bandwidthSlider && estTotalOut) {
      const updateEstimator = () => {
        const vcpu = parseInt(vcpuSlider.value, 10) || 8;
        const storage = parseInt(storageSlider.value, 10) || 500;
        const bw = parseInt(bandwidthSlider.value, 10) || 5;

        const vcpuVal = document.getElementById('estVcpuVal');
        const storageVal = document.getElementById('estStorageVal');
        const bwVal = document.getElementById('estBandwidthVal');

        if (vcpuVal) vcpuVal.textContent = `${vcpu} Dedicated vCPUs`;
        if (storageVal) storageVal.textContent = `${storage} GB NVMe Block`;
        if (bwVal) bwVal.textContent = `${bw} TB Anycast Egress`;

        const total = Math.round(vcpu * 14 + storage * 0.12 + bw * 8);
        estTotalOut.textContent = `$${total.toLocaleString()}`;
      };

      [vcpuSlider, storageSlider, bandwidthSlider].forEach((input) => {
        input.addEventListener('input', updateEstimator);
      });
      updateEstimator();
    }
  }

  /* ========================================================================
     5. CLIENT-SIDE FORM VALIDATION (Support Form & Console Modal)
     ======================================================================== */
  function initFormsValidation() {
    const forms = document.querySelectorAll('.cp-needs-validation');

    forms.forEach((form) => {
      const inputs = form.querySelectorAll('.cp-form-control[required]');

      const validateInput = (input) => {
        let valid = true;
        const val = input.value.trim();

        if (!val) {
          valid = false;
        } else if (input.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          valid = emailRegex.test(val);
        } else if (input.hasAttribute('minlength')) {
          const min = parseInt(input.getAttribute('minlength'), 10);
          valid = val.length >= min;
        }

        input.classList.toggle('is-invalid', !valid);
        input.setAttribute('aria-invalid', String(!valid));
        return valid;
      };

      inputs.forEach((input) => {
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            validateInput(input);
          }
        });
        input.addEventListener('blur', () => validateInput(input));
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let allValid = true;

        inputs.forEach((input) => {
          if (!validateInput(input)) {
            allValid = false;
          }
        });

        const statusBox = form.querySelector('.cp-form-status');
        if (!allValid) {
          if (statusBox) {
            statusBox.className = 'cp-form-status mt-3 p-3 rounded-3 border border-danger text-danger bg-danger bg-opacity-10';
            statusBox.innerHTML =
              '<i class="bi bi-exclamation-triangle-fill me-2"></i>Please complete all required fields with valid information.';
            statusBox.hidden = false;
          }
          const firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // Valid client-side preview state (honest static frontend disclosure)
        const userName = form.querySelector('[name="fullName"]')?.value || 'Engineer';
        const selectedPlan = form.querySelector('[name="plan"]')?.value || 'Enterprise Cloud';

        if (statusBox) {
          statusBox.className = 'cp-form-status mt-3 p-3 rounded-3 border border-info text-info bg-info bg-opacity-10';
          statusBox.innerHTML = `
            <div class="d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill fs-5 text-info mt-1"></i>
              <div>
                <strong class="d-block text-white">Validation Complete — Ready for Dispatch (${escapeHtml(userName)})</strong>
                <span class="small text-secondary d-block mt-1">
                  Your inquiry regarding <strong>${escapeHtml(selectedPlan)}</strong> passed client-side verification.
                  (Note: This static frontend preview validates inputs locally in your browser without transmitting data to an external server.)
                </span>
              </div>
            </div>
          `;
          statusBox.hidden = false;
        }
        form.reset();
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  /* ========================================================================
     6. BACK TO TOP BUTTON
     ======================================================================== */
  function initBackToTop() {
    const btn = document.getElementById('cpBackToTop');
    if (!btn) return;

    const toggleVisibility = () => {
      if (window.scrollY > 420) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ========================================================================
     INITIALIZE ON DOM READY
     ======================================================================== */
  // Apply saved theme immediately if possible
  const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', initialTheme);

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initScrollRevealAndCounters();
    initPricingInteractions();
    initFormsValidation();
    initBackToTop();
  });
})();

