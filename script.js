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

  // Dish-specific image mapping — each dish gets a unique photo
  const dishImageMap = {
    '红烧排骨': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    '宫保鸡丁': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80',
    '糖醋里脊': 'https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=400&q=80',
    '番茄炒蛋': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    '鱼香肉丝': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    '红烧牛腩': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80',
    '麻婆豆腐': 'https://images.unsplash.com/photo-1541379889336-70f26e4f42c0?w=400&q=80',
    '清炒西兰花': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80',
    '酸菜鱼': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80',
    '牛肉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    '炒河粉': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80',
    '水饺': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80',
    '砂锅粥': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    '豆浆油条': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80',
    '小米粥': 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80',
    '煎饼果子': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    '鸡蛋灌饼': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
    '八宝粥+馒头': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  };

  // Dish-specific emoji mapping as fallback
  const dishEmojiMap = {
    '红烧排骨': '🍖', '宫保鸡丁': '🍗', '糖醋里脊': '🥩', '番茄炒蛋': '🍳',
    '鱼香肉丝': '🐟', '红烧牛腩': '🥘', '麻婆豆腐': '🫘', '清炒西兰花': '🥦',
    '酸菜鱼': '🐠', '牛肉面': '🍜', '炒河粉': '🍝', '水饺': '🥟',
    '砂锅粥': '🍲', '豆浆油条': '🥛', '小米粥': '🥣', '煎饼果子': '🫓',
    '鸡蛋灌饼': '🥞', '八宝粥+馒头': '🍚',
  };

  // Fallback images for unmapped dishes (cycled)
  const fallbackImages = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&q=80',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80',
  ];

  function getDishImage(name, index) {
    return dishImageMap[name] || fallbackImages[index % fallbackImages.length];
  }

  function getDishEmoji(name) {
    return dishEmojiMap[name] || '🍽️';
  }

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
        const imgUrl = getDishImage(dish.name, i);
        const emoji = getDishEmoji(dish.name);
        return `
          <div class="dash-rank-card" data-feature="dish-${XF.esc(dish.name)}" style="cursor:pointer;background:var(--bg-card);border:1px solid var(--border);border-radius:1.6rem;padding:1.2rem;display:flex;align-items:center;gap:1.4rem;transition:all 0.25s ease;overflow:hidden;">
            <div style="position:relative;width:6.4rem;height:6.4rem;border-radius:1.2rem;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(239,68,68,.12));">
              <img src="${imgUrl}" alt="${XF.esc(dish.name)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
              <div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:2.8rem;">${emoji}</div>
              <div class="dash-rank-num ${numClass}" style="position:absolute;top:0.3rem;left:0.3rem;width:2.2rem;height:2.2rem;border-radius:0.6rem;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.2);">${i + 1}</div>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:1.5rem;font-weight:600;margin-bottom:0.4rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${XF.esc(dish.name)}</div>
              <div style="display:flex;gap:1.2rem;font-size:1.2rem;color:var(--text-secondary);flex-wrap:wrap;">
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
        <a href="#" class="story-item reveal visible" style="--delay:0s" data-notice-id="${n.id}">
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

      // Notice click handler
      container.addEventListener('click', (e) => {
        const item = e.target.closest('[data-notice-id]');
        if (!item) return;
        e.preventDefault();
        const id = item.dataset.noticeId;
        const notice = notices.find(n => n.id === id);
        if (!notice) return;
        openFeatureModal(`
          <div class="fm-header" style="background:linear-gradient(135deg,#6366f1,#818cf8,#a5b4fc);">
            <span class="fm-tag">📢 通知公告</span>
            <h2 class="fm-title">${XF.esc(notice.title)}</h2>
          </div>
          <div class="fm-body">
            <div class="fm-announce-time">📅 发布时间：${XF.formatTime(notice.time)}</div>
            ${notice.imageUrl ? `<img class="fm-announce-img" src="${XF.esc(notice.imageUrl)}" alt="${XF.esc(notice.title)}" onerror="this.style.display='none'">` : ''}
            <p style="font-size:1.5rem;line-height:1.9;">${XF.esc(notice.content)}</p>
          </div>
        `);
      });
    }
  }

  /* ============================================
     FEATURE MODAL SYSTEM
     ============================================ */
  const fOverlay = document.getElementById('feature-overlay');
  const fClose = document.getElementById('feature-close');
  const fContent = document.getElementById('feature-modal-content');

  function openFeatureModal(html) {
    if (!fOverlay || !fContent) return;
    fContent.innerHTML = html;
    fOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFeatureModal() {
    if (!fOverlay) return;
    fOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (fClose) fClose.addEventListener('click', closeFeatureModal);
  if (fOverlay) fOverlay.addEventListener('click', (e) => {
    if (e.target === fOverlay) closeFeatureModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fOverlay?.classList.contains('active')) closeFeatureModal();
  });

  /* ---------- Initialize ---------- */
  updateLoginState();
  renderHomeHotRanking();
  renderHomeNotices();


  /* ---------- Feature content generators ---------- */
  const featureContent = {

    'daily-menu': () => {
      const menu = XF.getWeeklyMenu();
      const days = ['monday','tuesday','wednesday','thursday','friday'];
      const dayNames = ['周一','周二','周三','周四','周五'];
      const today = Math.min(Math.max(new Date().getDay() - 1, 0), 4);
      const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
      const mealNames = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
      const dayMenu = menu[days[today]] || {};

      let tabsHtml = days.map((d,i) => `<button class="fm-day-tab ${i===today?'active':''}" data-day="${d}">${dayNames[i]}</button>`).join('');

      function renderDayContent(day) {
        const dm = menu[day] || {};
        return ['breakfast','lunch','dinner'].map(meal => {
          const items = dm[meal] || [];
          if (!items.length) return `<div style="padding:1.6rem;color:var(--text-secondary);font-size:1.4rem;">暂无${mealNames[meal]}安排</div>`;
          return `
            <div style="margin-bottom:2rem;">
              <h4 style="font-size:1.6rem;font-weight:700;margin-bottom:1.2rem;">${mealIcons[meal]} ${mealNames[meal]}</h4>
              <div style="display:grid;gap:0.8rem;">
                ${items.map(it => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.6rem;background:var(--bg);border-radius:1.2rem;border:1px solid var(--border);">
                    <span style="font-weight:600;font-size:1.5rem;">${XF.esc(it.name)}</span>
                    <span style="font-size:1.3rem;color:var(--text-secondary);">${XF.esc(it.floor)} · ${XF.esc(it.window)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('');
      }

      return `
        <div class="fm-header" style="background:linear-gradient(135deg,#fb923c,#f97316,#ea580c);">
          <span class="fm-tag">📅 每日食谱</span>
          <h2 class="fm-title">今日食谱安排</h2>
          <p class="fm-desc">查看本周每天的早中晚餐安排</p>
        </div>
        <div class="fm-body">
          <div style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-bottom:2rem;" id="fm-day-tabs">${tabsHtml}</div>
          <div id="fm-day-content">${renderDayContent(days[today])}</div>
          <div class="fm-divider"></div>
          <a class="fm-cta" href="#" onclick="event.preventDefault();var u=XF.currentUser();if(!u){XF.toast('请先登录','error');return;}location.href=u.role==='admin'?'admin.html':'student.html';">
            进入系统查看完整食谱 →
          </a>
        </div>
      `;
    },

    'nutrition': () => {
      const bars = [
        { label: '蛋白质', pct: 88, color: '#10b981' },
        { label: '碳水化合物', pct: 75, color: '#f59e0b' },
        { label: '膳食纤维', pct: 62, color: '#8b5cf6' },
        { label: '维生素', pct: 80, color: '#ec4899' },
        { label: '矿物质', pct: 70, color: '#06b6d4' },
        { label: '脂肪（控制）', pct: 45, color: '#ef4444' }
      ];
      return `
        <div class="fm-header" style="background:linear-gradient(135deg,#10b981,#059669,#047857);">
          <span class="fm-tag">📊 营养分析</span>
          <h2 class="fm-title">本周营养配餐报告</h2>
          <p class="fm-desc">科学配比，守护每一份成长能量</p>
        </div>
        <div class="fm-body">
          <div class="fm-stats-grid">
            <div class="fm-stat-card"><div class="fm-stat-value" style="color:#10b981;">2,150</div><div class="fm-stat-label">日均热量(kcal)</div></div>
            <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">96%</div><div class="fm-stat-label">营养达标率</div></div>
            <div class="fm-stat-card"><div class="fm-stat-value" style="color:#8b5cf6;">18</div><div class="fm-stat-label">菜品种类</div></div>
          </div>
          <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">📈 各营养素达标情况</h3>
          <div class="fm-bar-chart">
            ${bars.map(b => `
              <div class="fm-bar-row">
                <span class="fm-bar-label">${b.label}</span>
                <div class="fm-bar-track"><div class="fm-bar-fill" style="--bar-pct:${b.pct}%;background:${b.color};"></div></div>
                <span class="fm-bar-value">${b.pct}%</span>
              </div>
            `).join('')}
          </div>
          <div class="fm-divider"></div>
          <p style="font-size:1.4rem;color:var(--text-secondary);line-height:1.8;">
            本周食谱由营养师团队精心设计，确保每餐蛋白质、碳水化合物、膳食纤维的比例符合青少年成长需求。
            脂肪摄入量严格控制在推荐范围内，同时保证口味不打折。
          </p>
        </div>
      `;
    },

    'survey': () => {
      const ranking = XF.getHotRanking(5);
      return `
        <div class="fm-header" style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa);">
          <span class="fm-tag">📋 学生评价</span>
          <h2 class="fm-title">学生满意度调查结果</h2>
          <p class="fm-desc">基于全体学生反馈的真实数据</p>
        </div>
        <div class="fm-body">
          <div style="text-align:center;margin-bottom:3rem;">
            <div class="fm-big-number">92%</div>
            <div class="fm-big-label">本月总体满意度</div>
          </div>
          <div class="fm-stats-grid">
            <div class="fm-stat-card"><div class="fm-stat-value" style="color:#10b981;">95%</div><div class="fm-stat-label">口味满意度</div></div>
            <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">89%</div><div class="fm-stat-label">卫生满意度</div></div>
            <div class="fm-stat-card"><div class="fm-stat-value" style="color:#8b5cf6;">91%</div><div class="fm-stat-label">服务满意度</div></div>
          </div>
          <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">🏆 最受欢迎菜品 TOP 5</h3>
          <div class="fm-rank-list">
            ${ranking.length ? ranking.map((d,i) => `
              <div class="fm-rank-item">
                <span class="fm-rank-medal">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                <span class="fm-rank-name">${XF.esc(d.name)}</span>
                <span class="fm-rank-score">👍 ${d.likes?.length||0} · 💬 ${d.comments?.length||0}</span>
              </div>
            `).join('') : '<p style="color:var(--text-secondary);">暂无排名数据</p>'}
          </div>
        </div>
      `;
    },

    'traceability': () => `
      <div class="fm-header" style="background:linear-gradient(135deg,#059669,#10b981,#34d399);">
        <span class="fm-tag">🔍 食材溯源</span>
        <h2 class="fm-title">食材从农场到餐桌的旅程</h2>
        <p class="fm-desc">全流程透明可查，让每一口都吃得放心</p>
      </div>
      <div class="fm-body">
        <div class="fm-step-flow">
          <div class="fm-step"><div class="fm-step-num">1</div><div class="fm-step-content"><div class="fm-step-title">产地直采</div><div class="fm-step-desc">与 12 家绿色认证农场合作，所有蔬菜、肉类均产地直供，减少中间环节。</div></div></div>
          <div class="fm-step"><div class="fm-step-num">2</div><div class="fm-step-content"><div class="fm-step-title">入库检验</div><div class="fm-step-desc">每批食材到货后经过农残检测、新鲜度检验等 6 项质检流程，不合格立即退回。</div></div></div>
          <div class="fm-step"><div class="fm-step-num">3</div><div class="fm-step-content"><div class="fm-step-title">冷链储存</div><div class="fm-step-desc">采用全程冷链储存系统，温度实时监控在 0~4°C，确保食材新鲜度。</div></div></div>
          <div class="fm-step"><div class="fm-step-num">4</div><div class="fm-step-content"><div class="fm-step-title">标准化烹饪</div><div class="fm-step-desc">厨师团队严格按照标准化流程操作，每道菜的用料、火候、时间均有记录。</div></div></div>
          <div class="fm-step"><div class="fm-step-num">5</div><div class="fm-step-content"><div class="fm-step-title">端上餐桌</div><div class="fm-step-desc">菜品出锅后 15 分钟内送达窗口，保证温度和口感最佳状态。</div></div></div>
        </div>
        <div class="fm-stats-grid">
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#10b981;">12</div><div class="fm-stat-label">合作农场</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">100%</div><div class="fm-stat-label">检测合格率</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#8b5cf6;">6项</div><div class="fm-stat-label">质检流程</div></div>
        </div>
      </div>
    `,

    'chefs': () => `
      <div class="fm-header" style="background:linear-gradient(135deg,#f97316,#fb923c,#fbbf24);">
        <span class="fm-tag">👨‍🍳 厨师风采</span>
        <h2 class="fm-title">幕后英雄：我们的大厨团队</h2>
        <p class="fm-desc">6 位星级主厨，用心烹饪每一道菜</p>
      </div>
      <div class="fm-body">
        <div class="fm-chef-grid">
          <div class="fm-chef-card"><div class="fm-chef-avatar">👨‍🍳</div><div class="fm-chef-name">王大厨</div><div class="fm-chef-role">行政主厨 · 25年经验</div><div class="fm-chef-desc">擅长川菜与粤菜，获全国烹饪金奖。</div></div>
          <div class="fm-chef-card"><div class="fm-chef-avatar">👩‍🍳</div><div class="fm-chef-name">李师傅</div><div class="fm-chef-role">面点主管 · 18年经验</div><div class="fm-chef-desc">手工面点专家，她的馒头被学生称为"云朵馒头"。</div></div>
          <div class="fm-chef-card"><div class="fm-chef-avatar">👨‍🍳</div><div class="fm-chef-name">张师傅</div><div class="fm-chef-role">中餐主厨 · 20年经验</div><div class="fm-chef-desc">红烧排骨的秘方传承三代，是食堂的招牌菜。</div></div>
          <div class="fm-chef-card"><div class="fm-chef-avatar">👩‍🍳</div><div class="fm-chef-name">刘师傅</div><div class="fm-chef-role">营养配餐师 · 12年经验</div><div class="fm-chef-desc">持有国家二级营养师证书，负责每周食谱的营养平衡。</div></div>
          <div class="fm-chef-card"><div class="fm-chef-avatar">👨‍🍳</div><div class="fm-chef-name">陈师傅</div><div class="fm-chef-role">甜品师 · 10年经验</div><div class="fm-chef-desc">曾在五星酒店工作，带来了专业级的甜品制作工艺。</div></div>
          <div class="fm-chef-card"><div class="fm-chef-avatar">👨‍🍳</div><div class="fm-chef-name">赵师傅</div><div class="fm-chef-role">西餐主厨 · 15年经验</div><div class="fm-chef-desc">意面和沙拉是他的拿手好戏，让校园也能吃到正宗西餐。</div></div>
        </div>
        <p style="font-size:1.4rem;color:var(--text-secondary);line-height:1.8;">
          我们的厨师团队来自全国各地，每个人都带着对烹饪的热爱和对学生健康的责任感。他们每天凌晨 5 点到岗，为全校师生准备三餐。
        </p>
      </div>
    `,

    'dessert': () => `
      <div class="fm-header" style="background:linear-gradient(135deg,#ec4899,#f472b6,#f9a8d4);">
        <span class="fm-tag">🍰 甜品站</span>
        <h2 class="fm-title">新增甜品窗口正式营业</h2>
        <p class="fm-desc">课后的小确幸，现在从食堂开始</p>
      </div>
      <div class="fm-body">
        <div class="fm-dessert-grid">
          <div class="fm-dessert-card"><span class="fm-dessert-icon">🍰</span><div><div class="fm-dessert-name">手工蛋糕</div><div class="fm-dessert-price">¥8</div></div></div>
          <div class="fm-dessert-card"><span class="fm-dessert-icon">🍮</span><div><div class="fm-dessert-name">红豆双皮奶</div><div class="fm-dessert-price">¥6</div></div></div>
          <div class="fm-dessert-card"><span class="fm-dessert-icon">🥤</span><div><div class="fm-dessert-name">鲜果酸奶</div><div class="fm-dessert-price">¥7</div></div></div>
          <div class="fm-dessert-card"><span class="fm-dessert-icon">🍡</span><div><div class="fm-dessert-name">芝麻汤圆</div><div class="fm-dessert-price">¥5</div></div></div>
          <div class="fm-dessert-card"><span class="fm-dessert-icon">🧁</span><div><div class="fm-dessert-name">抹茶杯子蛋糕</div><div class="fm-dessert-price">¥10</div></div></div>
          <div class="fm-dessert-card"><span class="fm-dessert-icon">🍨</span><div><div class="fm-dessert-name">芒果冰淇淋</div><div class="fm-dessert-price">¥8</div></div></div>
        </div>
        <div class="fm-divider"></div>
        <div class="fm-stats-grid">
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#ec4899;">📍</div><div class="fm-stat-label">1楼 C1窗口</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">⏰</div><div class="fm-stat-label">14:00-17:00</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#8b5cf6;">🎉</div><div class="fm-stat-label">开业特惠8折</div></div>
        </div>
      </div>
    `,

    'vote': () => {
      const v = XF.getVotes();
      const maxVotes = Math.max(...v.dishes.map(d => d.votes), 1);
      const sorted = [...v.dishes].sort((a, b) => b.votes - a.votes);
      return `
        <div class="fm-header" style="background:linear-gradient(135deg,#6366f1,#818cf8,#a5b4fc);">
          <span class="fm-tag">🗳️ 投票评价</span>
          <h2 class="fm-title">${XF.esc(v.title || '下周食谱由你做主！')}</h2>
          <p class="fm-desc">投票选出你最想吃的菜品，${v.active ? '投票进行中 🟢' : '投票已结束 🔴'}</p>
        </div>
        <div class="fm-body">
          ${sorted.length ? `
            <div class="fm-vote-list">
              ${sorted.map((d,i) => `
                <div class="fm-vote-item" style="--vote-pct:${(d.votes/maxVotes*100).toFixed(1)}%">
                  <span class="fm-vote-rank">${i+1}</span>
                  <span class="fm-vote-name">${XF.esc(d.name)}</span>
                  <span class="fm-vote-count">${d.votes} 票</span>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color:var(--text-secondary);">暂无投票数据</p>'}
          <div class="fm-divider"></div>
          <a class="fm-cta" href="#" onclick="event.preventDefault();var u=XF.currentUser();if(!u){document.getElementById('feature-close')?.click();document.getElementById('btn-open-auth')?.click();XF.toast('请先登录后参与投票','info');return;}location.href=u.role==='admin'?'admin.html':'student.html';">
            ${v.active ? '立即参与投票 →' : '查看详细结果 →'}
          </a>
        </div>
      `;
    },

    'about': () => `
      <div class="fm-header" style="background:linear-gradient(135deg,#e8590c,#f97316,#fbbf24);">
        <span class="fm-tag">🏫 关于我们</span>
        <h2 class="fm-title">关于食堂 · 学府膳智</h2>
        <p class="fm-desc">让校园饮食更健康、更透明</p>
      </div>
      <div class="fm-body">
        <p style="font-size:1.5rem;line-height:2;margin-bottom:2.4rem;">
          「学府膳智」是由学校信息技术社团开发的智慧食堂管理平台。我们致力于用科技改善校园饮食体验，
          让每一位师生都能吃上安全、营养、美味的餐食。
        </p>
        <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">🎯 我们的使命</h3>
        <div class="fm-stats-grid" style="margin-bottom:2.4rem;">
          <div class="fm-stat-card"><div class="fm-stat-value" style="font-size:2.4rem;">🍽️</div><div class="fm-stat-label">科学配餐<br>营养均衡</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="font-size:2.4rem;">🔍</div><div class="fm-stat-label">食材透明<br>安全可溯</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="font-size:2.4rem;">💬</div><div class="fm-stat-label">民主参与<br>师生共建</div></div>
        </div>
        <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">📊 数据一览</h3>
        <div class="fm-stats-grid">
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#10b981;">3,000+</div><div class="fm-stat-label">日均供餐</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">6</div><div class="fm-stat-label">专业厨师</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#8b5cf6;">50+</div><div class="fm-stat-label">菜品种类</div></div>
        </div>
      </div>
    `,

    'weekly-update': () => {
      const menu = XF.getWeeklyMenu();
      const wed = menu['wednesday'] || {};
      const newDishes = (wed.lunch || []).slice(0, 3);
      return `
        <div class="fm-header" style="background:linear-gradient(135deg,#f97316,#fb923c,#fbbf24);">
          <span class="fm-tag">📰 通知</span>
          <h2 class="fm-title">本周食谱更新通知</h2>
          <p class="fm-desc">新增三款地方特色菜品，周三起供应</p>
        </div>
        <div class="fm-body">
          <div class="fm-announce-time">📅 发布时间：${XF.formatTime(Date.now() - 86400000)}</div>
          <img class="fm-announce-img" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80" alt="新菜品" onerror="this.style.display='none'">
          <p style="font-size:1.5rem;line-height:1.9;margin-bottom:2rem;">
            亲爱的同学们，经过厨师团队的精心准备和营养师的科学配比，本周起食堂将新增以下特色菜品：
          </p>
          ${newDishes.length ? `
            <div style="display:grid;gap:0.8rem;margin-bottom:2rem;">
              ${newDishes.map(d => `
                <div style="display:flex;align-items:center;gap:1.2rem;padding:1.4rem 1.6rem;background:var(--bg);border-radius:1.2rem;border:1px solid var(--border);">
                  <span style="font-size:2rem;">🆕</span>
                  <span style="font-size:1.5rem;font-weight:600;">${XF.esc(d.name)}</span>
                  <span style="font-size:1.3rem;color:var(--text-secondary);margin-left:auto;">${XF.esc(d.floor)} · ${XF.esc(d.window)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <p style="font-size:1.4rem;color:var(--text-secondary);line-height:1.8;">
            欢迎同学们品尝并在论坛或建议栏给出反馈，你们的意见是我们改进的动力！
          </p>
        </div>
      `;
    },

    'safety': () => `
      <div class="fm-header" style="background:linear-gradient(135deg,#059669,#10b981,#34d399);">
        <span class="fm-tag">🛡️ 安全报告</span>
        <h2 class="fm-title">食品安全月度报告</h2>
        <p class="fm-desc">三月份食材检测全部合格</p>
      </div>
      <div class="fm-body">
        <div class="fm-announce-time">📅 报告周期：2026年3月1日 — 3月31日</div>
        <div style="text-align:center;margin:2rem 0 3rem;">
          <div class="fm-big-number" style="background:linear-gradient(135deg,#10b981,#06d6a0);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">100%</div>
          <div class="fm-big-label">食材检测合格率</div>
        </div>
        <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">📋 检测项目结果</h3>
        <div class="fm-bar-chart">
          <div class="fm-bar-row"><span class="fm-bar-label">农药残留</span><div class="fm-bar-track"><div class="fm-bar-fill" style="--bar-pct:100%;background:#10b981;"></div></div><span class="fm-bar-value">✅ 合格</span></div>
          <div class="fm-bar-row"><span class="fm-bar-label">微生物</span><div class="fm-bar-track"><div class="fm-bar-fill" style="--bar-pct:100%;background:#10b981;"></div></div><span class="fm-bar-value">✅ 合格</span></div>
          <div class="fm-bar-row"><span class="fm-bar-label">重金属</span><div class="fm-bar-track"><div class="fm-bar-fill" style="--bar-pct:100%;background:#10b981;"></div></div><span class="fm-bar-value">✅ 合格</span></div>
          <div class="fm-bar-row"><span class="fm-bar-label">添加剂</span><div class="fm-bar-track"><div class="fm-bar-fill" style="--bar-pct:100%;background:#10b981;"></div></div><span class="fm-bar-value">✅ 合格</span></div>
          <div class="fm-bar-row"><span class="fm-bar-label">新鲜度</span><div class="fm-bar-track"><div class="fm-bar-fill" style="--bar-pct:98%;background:#10b981;"></div></div><span class="fm-bar-value">✅ 98%</span></div>
        </div>
        <div class="fm-divider"></div>
        <div class="fm-stats-grid">
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#10b981;">326</div><div class="fm-stat-label">批次检测</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">0</div><div class="fm-stat-label">不合格批次</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#8b5cf6;">A级</div><div class="fm-stat-label">卫生评级</div></div>
        </div>
      </div>
    `,

    'contest': () => `
      <div class="fm-header" style="background:linear-gradient(135deg,#f59e0b,#fbbf24,#fcd34d);">
        <span class="fm-tag">🏆 活动</span>
        <h2 class="fm-title">厨艺大赛报名开始</h2>
        <p class="fm-desc">师生同台竞技，用创意烹出最美味的佳肴</p>
      </div>
      <div class="fm-body">
        <img class="fm-announce-img" src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80" alt="厨艺大赛" onerror="this.style.display='none'">
        <div class="fm-stats-grid" style="margin-bottom:2.4rem;">
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">📅</div><div class="fm-stat-label">4月20日</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#10b981;">📍</div><div class="fm-stat-label">食堂2楼</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#ec4899;">🎁</div><div class="fm-stat-label">丰富奖品</div></div>
        </div>
        <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">📝 比赛规则</h3>
        <div style="font-size:1.4rem;line-height:1.9;color:var(--text-secondary);margin-bottom:2rem;">
          <p>1. 参赛选手分为「师生混合组」和「学生个人组」两个组别</p>
          <p>2. 每组选手在 60 分钟内完成 2 道创意菜品的制作</p>
          <p>3. 由专业厨师、营养师和学生代表组成的评审团打分</p>
          <p>4. 评审标准：口味（40%）、创意（30%）、摆盘（20%）、营养（10%）</p>
        </div>
        <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.2rem;">🎁 奖项设置</h3>
        <div style="display:grid;gap:0.8rem;margin-bottom:2rem;">
          <div style="display:flex;align-items:center;gap:1rem;padding:1.2rem 1.6rem;background:var(--bg);border-radius:1.2rem;">🥇 <strong>冠军</strong><span style="margin-left:auto;color:var(--accent);font-weight:700;">¥500 餐饮券 + 定制围裙</span></div>
          <div style="display:flex;align-items:center;gap:1rem;padding:1.2rem 1.6rem;background:var(--bg);border-radius:1.2rem;">🥈 <strong>亚军</strong><span style="margin-left:auto;color:var(--accent);font-weight:700;">¥300 餐饮券</span></div>
          <div style="display:flex;align-items:center;gap:1rem;padding:1.2rem 1.6rem;background:var(--bg);border-radius:1.2rem;">🥉 <strong>季军</strong><span style="margin-left:auto;color:var(--accent);font-weight:700;">¥200 餐饮券</span></div>
        </div>
        <a class="fm-cta" href="#" onclick="event.preventDefault();XF.toast('报名功能将在论坛中开放','info');">
          立即报名 →
        </a>
      </div>
    `
  };

  /* ---------- Dish detail generator ---------- */
  function dishDetailContent(dishName) {
    const menu = XF.getTotalMenu();
    let found = null, mealType = '';
    ['breakfast','lunch','dinner'].forEach(m => {
      (menu[m]||[]).forEach(d => {
        if (d.name === dishName) { found = d; mealType = m; }
      });
    });

    // Reuse the dish image map (higher-res for detail view)
    const detailImg = dishImageMap[dishName]
      ? dishImageMap[dishName].replace('w=400', 'w=800')
      : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
    const img = detailImg;
    const likeCount = found?.likes?.length || 0;
    const commentCount = found?.comments?.length || 0;
    const comments = found?.comments || [];

    return `
      <div class="fm-header" style="background:linear-gradient(135deg,#e8590c,#f97316,#fb923c);">
        <span class="fm-tag">${XF.mealLabel(mealType)} · 菜品详情</span>
        <h2 class="fm-title">${XF.esc(dishName)}</h2>
        <p class="fm-desc">👍 ${likeCount} 赞 · 💬 ${commentCount} 评论</p>
      </div>
      <div class="fm-body">
        <img class="fm-announce-img" src="${img}" alt="${XF.esc(dishName)}" onerror="this.style.display='none'">
        <div class="fm-stats-grid" style="margin-bottom:2.4rem;">
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#ef4444;">❤️ ${likeCount}</div><div class="fm-stat-label">总点赞</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#6366f1;">💬 ${commentCount}</div><div class="fm-stat-label">总评论</div></div>
          <div class="fm-stat-card"><div class="fm-stat-value" style="color:#f59e0b;">📝 ${found?.suggestions?.length||0}</div><div class="fm-stat-label">总建议</div></div>
        </div>
        ${comments.length ? `
          <h3 style="font-size:1.6rem;font-weight:700;margin-bottom:1.6rem;">💬 最新评论</h3>
          <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem;">
            ${comments.slice(-5).reverse().map(c => `
              <div style="padding:1.4rem 1.6rem;background:var(--bg);border-radius:1.2rem;border:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;">
                  <span style="font-weight:600;font-size:1.4rem;">${XF.esc(c.userName)}</span>
                  <span style="font-size:1.2rem;color:var(--text-secondary);">${XF.formatTime(c.time)}</span>
                </div>
                <p style="font-size:1.4rem;color:var(--text-secondary);line-height:1.6;">${XF.esc(c.text)}</p>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color:var(--text-secondary);margin-bottom:2rem;">暂无评论，登录后去总食谱发表评论吧！</p>'}
        <a class="fm-cta" href="#" onclick="event.preventDefault();var u=XF.currentUser();if(!u){document.getElementById('feature-close')?.click();document.getElementById('btn-open-auth')?.click();return;}location.href=u.role==='admin'?'admin.html':'student.html';">
          登录查看更多 & 互动 →
        </a>
      </div>
    `;
  }

  /* ---------- Click handler for all [data-feature] ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-feature]');
    if (!link) return;
    e.preventDefault();

    const feature = link.dataset.feature;

    // Dish detail
    if (feature.startsWith('dish-')) {
      const dishName = feature.slice(5);
      openFeatureModal(dishDetailContent(dishName));
      return;
    }

    // Named feature
    const generator = featureContent[feature];
    if (generator) {
      openFeatureModal(typeof generator === 'function' ? generator() : generator);
    }
  });

  /* ---------- Day tab switching inside daily-menu modal ---------- */
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.fm-day-tab');
    if (!tab) return;
    const day = tab.dataset.day;
    const menu = XF.getWeeklyMenu();
    const dm = menu[day] || {};
    const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
    const mealNames = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };

    // Update active tab
    document.querySelectorAll('.fm-day-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Re-render day content
    const container = document.getElementById('fm-day-content');
    if (container) {
      container.innerHTML = ['breakfast','lunch','dinner'].map(meal => {
        const items = dm[meal] || [];
        if (!items.length) return `<div style="padding:1.6rem;color:var(--text-secondary);font-size:1.4rem;">暂无${mealNames[meal]}安排</div>`;
        return `
          <div style="margin-bottom:2rem;">
            <h4 style="font-size:1.6rem;font-weight:700;margin-bottom:1.2rem;">${mealIcons[meal]} ${mealNames[meal]}</h4>
            <div style="display:grid;gap:0.8rem;">
              ${items.map(it => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.6rem;background:var(--bg);border-radius:1.2rem;border:1px solid var(--border);">
                  <span style="font-weight:600;font-size:1.5rem;">${XF.esc(it.name)}</span>
                  <span style="font-size:1.3rem;color:var(--text-secondary);">${XF.esc(it.floor)} · ${XF.esc(it.window)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  });

});

