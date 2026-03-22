/* ============================================
   学府膳智 — script.js
   Pure Vanilla JS — No dependencies
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Hero Character Random Font + Push Effect ---------- */
  const heroChars = document.querySelectorAll('.hero-char');
  const funFonts = [
    '"ZCOOL KuaiLe", cursive',
    '"ZCOOL XiaoWei", serif',
    '"Ma Shan Zheng", cursive',
    '"Liu Jian Mao Cao", cursive',
    '"Zhi Mang Xing", cursive',
    '"Long Cang", cursive',
    '"ZCOOL QingKe HuangYou", sans-serif',
    '"Noto Serif SC", serif',
    '"Kalam", cursive',
    '"Pacifico", cursive'
  ];

  heroChars.forEach((char, idx) => {
    char.addEventListener('mouseenter', () => {
      // Random font on hovered char
      const randomFont = funFonts[Math.floor(Math.random() * funFonts.length)];
      char.style.fontFamily = randomFont;

      // Push siblings away
      heroChars.forEach((sibling, sIdx) => {
        if (sIdx === idx) return;
        const distance = Math.abs(sIdx - idx);
        const pushPx = Math.max(15, 80 - distance * 20); // closer = more push
        sibling.style.setProperty('--push-distance', pushPx + 'px');
        sibling.classList.add('pushed');
        if (sIdx < idx) {
          sibling.classList.add('pushed-left');
          sibling.classList.remove('pushed-right');
        } else {
          sibling.classList.add('pushed-right');
          sibling.classList.remove('pushed-left');
        }
      });
    });

    char.addEventListener('mouseleave', () => {
      char.style.fontFamily = '';
      heroChars.forEach(sibling => {
        sibling.classList.remove('pushed', 'pushed-left', 'pushed-right');
      });
    });
  });

  /* ---------- Theme Toggle ---------- */
  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('xf-theme');

  if (stored) {
    html.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('xf-theme', next);
    });
  }

  /* ---------- Mobile Menu ---------- */
  const menuBtn = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll Reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');

  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Swiper / Carousel ---------- */
  const track = document.querySelector('.swiper-track');
  const prevBtn = document.querySelector('.swiper-prev');
  const nextBtn = document.querySelector('.swiper-next');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const cards = track.querySelectorAll('.card');
    const totalCards = cards.length;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 860) return 3;
      if (w >= 600) return 2;
      return 1;
    }

    function getCardWidth() {
      if (!cards.length) return 0;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.gap) || 24;
      return cards[0].offsetWidth + gap;
    }

    function updateSwiper() {
      const max = Math.max(0, totalCards - getVisibleCount());
      currentIndex = Math.min(currentIndex, max);
      track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= max;
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSwiper();
    });

    nextBtn.addEventListener('click', () => {
      const max = Math.max(0, totalCards - getVisibleCount());
      currentIndex = Math.min(max, currentIndex + 1);
      updateSwiper();
    });

    // Touch / drag support
    let startX = 0;
    let isDragging = false;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX;
      isDragging = true;
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) {
          nextBtn.click();
        } else {
          prevBtn.click();
        }
      }
    });

    track.addEventListener('pointercancel', () => { isDragging = false; });

    window.addEventListener('resize', updateSwiper);
    updateSwiper();
  }

  /* ---------- Hero Typing Effect ---------- */
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const phrases = [
      '让每一餐都充满智慧与营养',
      '科学配餐，健康成长',
      '学生的食堂，大家的厨房'
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
      const current = phrases[phraseIdx];
      if (isDeleting) {
        typingEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
      } else {
        typingEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
      }

      let delay = isDeleting ? 40 : 100;

      if (!isDeleting && charIdx === current.length) {
        delay = 2500;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(type, delay);
    }

    setTimeout(type, 800);
  }

  /* ---------- Auth Modal ---------- */
  const authOverlay = document.getElementById('auth-overlay');
  const btnOpenAuth = document.getElementById('btn-open-auth');
  const btnCloseAuth = document.getElementById('auth-close');
  const authTabs = document.querySelectorAll('.auth-tab');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const gotoRegister = document.getElementById('goto-register');
  const gotoLogin = document.getElementById('goto-login');

  function openAuth() {
    authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAuth() {
    authOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function switchTab(tab) {
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.tab === 'login') {
      formLogin.style.display = '';
      formRegister.style.display = 'none';
    } else {
      formLogin.style.display = 'none';
      formRegister.style.display = '';
    }
  }

  if (btnOpenAuth) btnOpenAuth.addEventListener('click', openAuth);
  if (btnCloseAuth) btnCloseAuth.addEventListener('click', closeAuth);

  // Close on overlay click
  if (authOverlay) {
    authOverlay.addEventListener('click', (e) => {
      if (e.target === authOverlay) closeAuth();
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authOverlay?.classList.contains('active')) closeAuth();
  });

  // Tab switching
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // Footer link switching
  if (gotoRegister) {
    gotoRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(document.querySelector('[data-tab="register"]'));
    });
  }
  if (gotoLogin) {
    gotoLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(document.querySelector('[data-tab="login"]'));
    });
  }

  // Role selector
  document.querySelectorAll('.auth-role-select').forEach(group => {
    group.querySelectorAll('.auth-role').forEach(role => {
      role.addEventListener('click', () => {
        group.querySelectorAll('.auth-role').forEach(r => r.classList.remove('active'));
        role.classList.add('active');
      });
    });
  });

  // Form submissions (demo — just show alert)
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = formLogin.querySelector('input[name="login-role"]:checked')?.value;
      const account = document.getElementById('login-account').value;
      alert(`登录成功！\n身份：${role}\n账号：${account}`);
      closeAuth();
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      if (pw !== confirm) {
        alert('两次输入的密码不一致，请重新输入。');
        return;
      }
      const role = formRegister.querySelector('input[name="reg-role"]:checked')?.value;
      const name = document.getElementById('reg-name').value;
      alert(`注册成功！\n身份：${role}\n姓名：${name}`);
      closeAuth();
    });
  }

});
