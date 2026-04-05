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
    updateTabIndicator(tab.dataset.tab);
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

  // Password toggle
  document.querySelectorAll('.auth-pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.auth-input-wrap');
      const input = wrap.querySelector('input');
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');
      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = '';
      } else {
        input.type = 'password';
        eyeOpen.style.display = '';
        eyeClosed.style.display = 'none';
      }
    });
  });

  // Tab indicator animation
  const tabIndicator = document.querySelector('.auth-tab-indicator');
  function updateTabIndicator(tabName) {
    if (!tabIndicator) return;
    if (tabName === 'register') {
      tabIndicator.style.transform = 'translateX(100%)';
    } else {
      tabIndicator.style.transform = 'translateX(0)';
    }
  }

  /* ---------- Login Form (with real auth + redirect) ---------- */
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = formLogin.querySelector('input[name="login-role"]:checked')?.value;
      const account = document.getElementById('login-account').value.trim();
      const password = document.getElementById('login-password').value;

      if (!account || !password) {
        XF.toast('请填写账号和密码', 'error');
        return;
      }

      const user = XF.login(account, password, role);
      if (user) {
        closeAuth();
        XF.toast(`欢迎回来，${user.name}！`);
        // Redirect based on role
        setTimeout(() => {
          if (role === 'admin') {
            location.href = 'admin.html';
          } else if (role === 'student') {
            location.href = 'student.html';
          } else {
            updateLoginState();
          }
        }, 600);
      } else {
        XF.toast('账号或密码错误', 'error');
      }
    });
  }

  /* ---------- Register Form (with real auth + redirect) ---------- */
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      if (pw !== confirm) {
        XF.toast('两次输入的密码不一致', 'error');
        return;
      }
      const role = formRegister.querySelector('input[name="reg-role"]:checked')?.value;
      const name = document.getElementById('reg-name').value.trim();
      const account = document.getElementById('reg-account').value.trim();

      if (!name || !account) {
        XF.toast('请填写姓名和账号', 'error');
        return;
      }

      const result = XF.register(name, account, pw, role);
      if (result.error) {
        XF.toast(result.error, 'error');
        return;
      }
      closeAuth();
      XF.toast(`注册成功！欢迎，${result.name}！`);
      setTimeout(() => {
        if (role === 'admin') {
          location.href = 'admin.html';
        } else if (role === 'student') {
          location.href = 'student.html';
        } else {
          updateLoginState();
        }
      }, 600);
    });
  }

  /* ---------- Homepage Login State ---------- */
  function updateLoginState() {
    const currentUser = XF.currentUser();
    const loggedInDiv = document.getElementById('user-logged-in');
    const loginBtn = document.getElementById('btn-open-auth');

    if (currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (loggedInDiv) {
        loggedInDiv.style.display = 'flex';
        loggedInDiv.style.alignItems = 'center';
        loggedInDiv.style.gap = '0.8rem';
        document.getElementById('home-user-name').textContent = currentUser.name;
      }
    } else {
      if (loginBtn) loginBtn.style.display = '';
      if (loggedInDiv) loggedInDiv.style.display = 'none';
    }
  }

  // Go to dashboard button
  const goDashBtn = document.getElementById('btn-go-dashboard');
  if (goDashBtn) {
    goDashBtn.addEventListener('click', () => {
      const u = XF.currentUser();
      if (!u) return;
      if (u.role === 'admin') location.href = 'admin.html';
      else if (u.role === 'student') location.href = 'student.html';
    });
  }

  // Logout from home
  const logoutHomeBtn = document.getElementById('btn-logout-home');
  if (logoutHomeBtn) {
    logoutHomeBtn.addEventListener('click', () => {
      XF.logout();
      updateLoginState();
      XF.toast('已退出登录');
    });
  }

  /* ---------- Dynamic Hot Ranking on Homepage ---------- */
  function renderHomeHotRanking() {
    if (typeof XF === 'undefined') return;
    const ranking = XF.getHotRanking(10);
    const section = document.getElementById('home-hot-section');
    const container = document.getElementById('home-hot-ranking');
    if (!section || !container) return;

    if (ranking.length > 0) {
      section.style.display = '';
      container.innerHTML = ranking.map((dish, i) => {
        const numClass = i < 3 ? `dash-rank-num--${i+1}` : 'dash-rank-num--default';
        return `
          <div class="dash-rank-card" style="background:var(--bg-card);border:1px solid var(--border);border-radius:1.6rem;padding:1.6rem;display:flex;align-items:center;gap:1.6rem;transition:all 0.25s ease;">
            <div class="dash-rank-num ${numClass}" style="width:3.6rem;height:3.6rem;border-radius:1rem;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.6rem;flex-shrink:0;">${i + 1}</div>
            <div style="flex:1;">
              <div style="font-size:1.5rem;font-weight:600;margin-bottom:0.4rem;">${XF.esc(dish.name)}</div>
              <div style="display:flex;gap:1.2rem;font-size:1.2rem;color:var(--text-secondary);">
                <span>👍 ${dish.likes?.length || 0}</span>
                <span>💬 ${dish.comments?.length || 0}</span>
                <span style="display:inline-flex;align-items:center;padding:0.2rem 0.8rem;border-radius:10rem;font-size:1.1rem;font-weight:600;background:linear-gradient(135deg,rgba(239,68,68,.12),rgba(245,158,11,.12));color:#ef4444;">${XF.mealLabel(dish.mealType)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /* ---------- Dynamic Notices on Homepage ---------- */
  function renderHomeNotices() {
    if (typeof XF === 'undefined') return;
    const notices = XF.getNotices();
    const section = document.getElementById('home-notices-section');
    const container = document.getElementById('home-notices-list');
    if (!section || !container) return;

    if (notices.length > 0) {
      section.style.display = '';
      container.innerHTML = notices.slice(0, 5).map(n => `
        <a href="#" class="story-item reveal visible" style="--delay:0s">
          <div class="story-inner">
            <h3 class="story-title">${XF.esc(n.title)}</h3>
            <div class="story-desc">${XF.esc(n.content)}</div>
            <div class="story-preview">
              ${n.imageUrl ? `<img loading="lazy" alt="${XF.esc(n.title)}" src="${XF.esc(n.imageUrl)}" onerror="this.style.display='none'">` : ''}
            </div>
            <svg class="story-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="7 7 17 7 17 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </a>
      `).join('');
    }
  }

  /* ---------- Initialize ---------- */
  updateLoginState();
  renderHomeHotRanking();
  renderHomeNotices();

});
