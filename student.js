/* ============================================
   学府膳智 — student.js
   学生端逻辑
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Auth Guard ---------- */
  const user = XF.currentUser();
  if (!user || user.role !== 'student') {
    location.href = 'index.html';
    return;
  }

  document.getElementById('stu-user-name').textContent = user.name;
  document.getElementById('stu-welcome-name').textContent = user.name;

  /* ---------- Theme ---------- */
  const html = document.documentElement;
  const stored = localStorage.getItem('xf-theme');
  if (stored) html.setAttribute('data-theme', stored);
  else if (matchMedia('(prefers-color-scheme: dark)').matches) html.setAttribute('data-theme', 'dark');

  document.getElementById('stu-theme-toggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('xf-theme', next);
  });

  /* ---------- User Dropdown ---------- */
  const userBtn = document.getElementById('stu-user-btn');
  const dropdown = document.getElementById('stu-dropdown');

  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));

  document.getElementById('stu-logout').addEventListener('click', () => {
    XF.logout();
    location.href = 'index.html';
  });

  /* ---------- Section Navigation ---------- */
  const navBtns = document.querySelectorAll('.stu-nav-btn[data-section]');
  const sections = document.querySelectorAll('.dash-section');

  function showSection(name) {
    sections.forEach(s => s.classList.remove('active'));
    navBtns.forEach(n => n.classList.remove('active'));
    const sec = document.getElementById('section-' + name);
    const nav = document.querySelector(`.stu-nav-btn[data-section="${name}"]`);
    if (sec) sec.classList.add('active');
    if (nav) nav.classList.add('active');
    refreshSection(name);
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  function refreshSection(name) {
    switch(name) {
      case 'home': renderHome(); break;
      case 'daily': renderDaily(); break;
      case 'total': renderTotal(); break;
      case 'preference': renderPreference(); break;
      case 'forum': renderForum(); break;
      case 'suggest': renderSuggestions(); break;
      case 'vote': renderVote(); break;
    }
  }

  /* ============================================
     HOME — HOT RANKING + NOTICES
     ============================================ */
  function renderHome() {
    renderBarrage();
    renderHotRanking();
    renderNotices();
  }

  function renderHotRanking() {
    const ranking = XF.getHotRanking(10);
    const container = document.getElementById('stu-hot-ranking');

    if (!ranking.length) {
      container.innerHTML = `<div class="dash-empty"><p>暂无热门菜品数据</p></div>`;
      return;
    }

    container.innerHTML = ranking.map((dish, i) => {
      const numClass = i < 3 ? `dash-rank-num--${i+1}` : 'dash-rank-num--default';
      return `
        <div class="dash-rank-card" style="animation-delay:${i * 0.05}s">
          <div class="dash-rank-num ${numClass}">${i + 1}</div>
          <div class="dash-rank-info">
            <div class="dash-rank-name">${XF.esc(dish.name)}</div>
            <div class="dash-rank-stats">
              <span>👍 ${dish.likes?.length || 0}</span>
              <span>💬 ${dish.comments?.length || 0}</span>
              <span class="dash-badge dash-badge--hot">${XF.mealLabel(dish.mealType)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderNotices() {
    const list = XF.getNotices();
    const container = document.getElementById('stu-notices');

    if (!list.length) {
      container.innerHTML = `<div class="dash-empty"><p>暂无通知</p></div>`;
      return;
    }

    container.innerHTML = list.slice(0, 5).map(n => `
      <div class="dash-notice" style="margin-bottom:1.2rem;">
        ${n.imageUrl ? `<img class="dash-notice-img" src="${XF.esc(n.imageUrl)}" alt="${XF.esc(n.title)}" onerror="this.style.display='none'" style="height:12rem;">` : ''}
        <div class="dash-notice-body" style="padding:1.6rem;">
          <h4 class="dash-notice-title" style="font-size:1.5rem;">${XF.esc(n.title)}</h4>
          <p class="dash-notice-text" style="font-size:1.3rem;">${XF.esc(n.content)}</p>
          <span class="dash-notice-time">${XF.formatTime(n.time)}</span>
        </div>
      </div>
    `).join('');
  }

  /* ============================================
     HOME — BARAGE SYSTEM
     ============================================ */
  function renderBarrage() {
    const barrItems = [];

    // Hot dishes
    const hotDishes = XF.getHotRanking(8);
    hotDishes.forEach((d, i) => {
      barrItems.push({
        icon: ['🥇','🥈','🥉'][i] || '🔥',
        text: `${d.name} 👍${d.likes?.length || 0}`,
        cls: 'barrage-item--hot'
      });
    });

    // Recent comments from total menu
    const totalMenu = XF.getTotalMenu();
    ['breakfast','lunch','dinner'].forEach(meal => {
      (totalMenu[meal] || []).forEach(dish => {
        (dish.comments || []).slice(-2).forEach(c => {
          barrItems.push({
            icon: '💬',
            text: `${c.userName}: ${c.text.slice(0, 18)}`,
            cls: 'barrage-item--comment'
          });
        });
      });
    });

    // Notices
    XF.getNotices().slice(0, 4).forEach(n => {
      barrItems.push({ icon: '📢', text: n.title, cls: 'barrage-item--notice' });
    });

    // Forum posts
    XF.getForumPosts().slice(0, 4).forEach(p => {
      barrItems.push({ icon: '💬', text: p.title, cls: 'barrage-item--forum' });
    });

    const shuffled = barrItems.sort(() => Math.random() - 0.5).slice(0, 24);
    if (!shuffled.length) {
      shuffled.push({ icon: '🍽️', text: '欢迎来到学府膳智！', cls: 'barrage-item--like' });
    }

    const chunkSize = Math.ceil(shuffled.length / 3);
    [1, 2, 3].forEach(trackNum => {
      const track = document.getElementById(`barrage-track-${trackNum}`);
      if (!track) return;
      const start = (trackNum - 1) * chunkSize;
      const chunk = shuffled.slice(start, start + chunkSize);
      const doubled = [...chunk, ...chunk];
      const dur = 22 + trackNum * 5 + Math.random() * 8;
      track.innerHTML = `
        <div class="barrage-inner" style="--barrage-dur:${dur.toFixed(1)}s">
          ${doubled.map(item => `
            <span class="barrage-item ${item.cls}">
              <span class="barrage-icon">${item.icon}</span>${XF.esc(item.text)}
            </span>
          `).join('')}
        </div>`;
    });
  }

  /* ============================================
     DAILY MENU
     ============================================ */
  const days = ['monday','tuesday','wednesday','thursday','friday'];
  const dayLabels = ['周一','周二','周三','周四','周五'];
  let currentDay = days[Math.min(new Date().getDay() - 1, 4)]; // auto select today
  if (new Date().getDay() === 0 || new Date().getDay() === 6) currentDay = 'monday';

  function renderDaily() {
    // Day tabs
    const tabContainer = document.getElementById('daily-day-tabs');
    tabContainer.innerHTML = days.map((d, i) =>
      `<button class="dash-tab ${d === currentDay ? 'active' : ''}" data-day="${d}">${dayLabels[i]}</button>`
    ).join('');
    tabContainer.querySelectorAll('.dash-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentDay = tab.dataset.day;
        renderDaily();
      });
    });

    const menu = XF.getWeeklyMenu();
    const dayMenu = menu[currentDay] || {};
    const container = document.getElementById('daily-menu-content');
    const mealKeys = ['breakfast','lunch','dinner'];
    const mealIcons = ['🌅','☀️','🌙'];
    const mealNames = ['早餐','午餐','晚餐'];

    container.innerHTML = mealKeys.map((meal, mi) => {
      const items = dayMenu[meal] || [];
      if (!items.length) {
        return `
          <div class="daily-meal-card">
            <div class="daily-meal-header">${mealIcons[mi]} ${mealNames[mi]}</div>
            <div class="dash-empty" style="padding:2rem;"><p>暂无菜品安排</p></div>
          </div>
        `;
      }
      return `
        <div class="daily-meal-card">
          <div class="daily-meal-header">${mealIcons[mi]} ${mealNames[mi]}</div>
          <div class="dash-table-wrap">
            <table class="dash-table">
              <thead><tr><th>菜品名称</th><th>楼层</th><th>窗口位置</th></tr></thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td style="font-weight:600;">${XF.esc(item.name)}</td>
                    <td>${XF.esc(item.floor)}</td>
                    <td>${XF.esc(item.window)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ============================================
     TOTAL MENU (Like / Comment / Suggest)
     ============================================ */
  let curMeal = 'breakfast';
  let commentingDish = null; // { mealType, dishId }
  let suggestingDish = null;

  function bindTotalTabs() {
    document.querySelectorAll('#total-meal-tabs-stu .dash-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#total-meal-tabs-stu .dash-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        curMeal = tab.dataset.meal;
        renderTotal();
      });
    });
  }

  function renderTotal() {
    const menu = XF.getTotalMenu();
    const dishes = menu[curMeal] || [];
    const container = document.getElementById('stu-total-menu');

    if (!dishes.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><p>暂无${XF.mealLabel(curMeal)}菜品</p></div></div>`;
      return;
    }

    container.innerHTML = `<div class="dash-dish-list">${dishes.map(dish => {
      const liked = dish.likes?.includes(user.id);
      const recentComments = (dish.comments || []).slice(-3);
      return `
        <div class="dash-dish-card">
          <div class="dash-dish-name">${XF.esc(dish.name)}</div>
          <div class="dash-dish-stats">
            <span>👍 ${dish.likes?.length || 0}</span>
            <span>💬 ${dish.comments?.length || 0}</span>
            <span>📝 ${dish.suggestions?.length || 0} 建议</span>
          </div>
          <div class="dash-dish-actions">
            <button class="dash-btn--like ${liked ? 'liked' : ''} btn-like-dish" data-meal="${curMeal}" data-id="${dish.id}">
              ${liked ? '❤️ 已赞' : '🤍 点赞'}
            </button>
            <button class="dash-btn dash-btn--secondary dash-btn--sm btn-comment-dish" data-meal="${curMeal}" data-id="${dish.id}">💬 评论</button>
            <button class="dash-btn dash-btn--secondary dash-btn--sm btn-suggest-dish" data-meal="${curMeal}" data-id="${dish.id}">📝 建议</button>
          </div>
          ${recentComments.length ? `
            <div class="dash-dish-comments">
              ${recentComments.map(c => `
                <div class="dash-dish-comment">
                  <span class="dash-dish-comment-name">${XF.esc(c.userName)}</span>
                  <span class="dash-dish-comment-text">${XF.esc(c.text)}</span>
                  <div class="dash-dish-comment-time">${XF.formatTime(c.time)}</div>
                </div>
              `).join('')}
              ${(dish.comments?.length || 0) > 3 ? `<p style="font-size:1.2rem;color:var(--text-secondary);margin-top:0.6rem;">还有 ${dish.comments.length - 3} 条评论...</p>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}</div>`;

    // Like
    container.querySelectorAll('.btn-like-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        XF.toggleLike(btn.dataset.meal, btn.dataset.id, user.id);
        renderTotal();
      });
    });

    // Comment
    container.querySelectorAll('.btn-comment-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        commentingDish = { mealType: btn.dataset.meal, dishId: btn.dataset.id };
        document.getElementById('comment-text').value = '';
        document.getElementById('modal-comment').classList.add('active');
      });
    });

    // Suggest
    container.querySelectorAll('.btn-suggest-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        suggestingDish = { mealType: btn.dataset.meal, dishId: btn.dataset.id };
        document.getElementById('dish-suggest-text').value = '';
        document.getElementById('modal-dish-suggest').classList.add('active');
      });
    });
  }

  bindTotalTabs();

  // Comment modal
  document.getElementById('comment-cancel').addEventListener('click', () => {
    document.getElementById('modal-comment').classList.remove('active');
  });
  document.getElementById('modal-comment').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('comment-submit').addEventListener('click', () => {
    const text = document.getElementById('comment-text').value.trim();
    if (!text) { XF.toast('请输入评论内容', 'error'); return; }
    XF.addComment(commentingDish.mealType, commentingDish.dishId, user.id, user.name, text);
    document.getElementById('modal-comment').classList.remove('active');
    renderTotal();
    XF.toast('评论成功！');
  });

  // Dish suggestion modal
  document.getElementById('dish-suggest-cancel').addEventListener('click', () => {
    document.getElementById('modal-dish-suggest').classList.remove('active');
  });
  document.getElementById('modal-dish-suggest').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('dish-suggest-submit').addEventListener('click', () => {
    const text = document.getElementById('dish-suggest-text').value.trim();
    if (!text) { XF.toast('请输入建议内容', 'error'); return; }
    XF.addDishSuggestion(suggestingDish.mealType, suggestingDish.dishId, user.id, user.name, text);
    document.getElementById('modal-dish-suggest').classList.remove('active');
    renderTotal();
    XF.toast('建议提交成功！');
  });

  /* ============================================
     FORUM
     ============================================ */
  let replyingPostId = null;

  function renderForum() {
    const posts = XF.getForumPosts();
    const container = document.getElementById('stu-forum-list');

    if (!posts.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>暂无帖子，来发第一个帖子吧！</p></div></div>`;
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="dash-post">
        <div class="dash-post-header">
          <div class="dash-post-author">
            <div class="dash-post-avatar dash-post-avatar--${post.authorRole}">${post.authorName.charAt(0)}</div>
            <div>
              <span class="dash-post-name">${XF.esc(post.authorName)}</span>
              <span class="dash-badge dash-badge--${post.authorRole}">${post.authorRole === 'admin' ? '管理员' : '学生'}</span>
            </div>
          </div>
          <span class="dash-post-time">${XF.formatTime(post.time)}</span>
        </div>
        <h4 class="dash-post-title">${XF.esc(post.title)}</h4>
        <p class="dash-post-content">${XF.esc(post.content)}</p>
        <div class="dash-post-actions">
          <button class="dash-btn dash-btn--secondary dash-btn--sm btn-stu-reply" data-id="${post.id}">💬 回复</button>
        </div>
        ${post.replies?.length ? `
          <div class="dash-replies">
            ${post.replies.map(r => `
              <div class="dash-reply">
                <div class="dash-post-avatar dash-post-avatar--${r.authorRole}" style="width:2.6rem;height:2.6rem;font-size:1.1rem;">${r.authorName.charAt(0)}</div>
                <div class="dash-reply-content">
                  <div class="dash-reply-header">
                    <span class="dash-post-name" style="font-size:1.3rem;">${XF.esc(r.authorName)}</span>
                    <span class="dash-badge dash-badge--${r.authorRole}">${r.authorRole === 'admin' ? '管理员' : '学生'}</span>
                    <span class="dash-post-time">${XF.formatTime(r.time)}</span>
                  </div>
                  <p class="dash-reply-text">${XF.esc(r.content)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    container.querySelectorAll('.btn-stu-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        replyingPostId = btn.dataset.id;
        document.getElementById('stu-reply-text').value = '';
        document.getElementById('modal-stu-reply').classList.add('active');
      });
    });
  }

  // New post modal
  document.getElementById('btn-new-post').addEventListener('click', () => {
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('modal-new-post').classList.add('active');
  });
  document.getElementById('post-cancel').addEventListener('click', () => {
    document.getElementById('modal-new-post').classList.remove('active');
  });
  document.getElementById('modal-new-post').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('post-submit').addEventListener('click', () => {
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    if (!title || !content) { XF.toast('请填写标题和内容', 'error'); return; }
    XF.addForumPost(user.id, user.name, user.role, title, content);
    document.getElementById('modal-new-post').classList.remove('active');
    renderForum();
    XF.toast('帖子发布成功！');
  });

  // Reply modal
  document.getElementById('stu-reply-cancel').addEventListener('click', () => {
    document.getElementById('modal-stu-reply').classList.remove('active');
  });
  document.getElementById('modal-stu-reply').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('stu-reply-submit').addEventListener('click', () => {
    const text = document.getElementById('stu-reply-text').value.trim();
    if (!text) { XF.toast('请输入回复内容', 'error'); return; }
    XF.addForumReply(replyingPostId, user.id, user.name, user.role, text);
    document.getElementById('modal-stu-reply').classList.remove('active');
    renderForum();
    XF.toast('回复成功！');
  });

  /* ============================================
     SUGGESTIONS
     ============================================ */
  function renderSuggestions() {
    const all = XF.getSuggestions();
    const mine = all.filter(s => s.studentId === user.id);
    const container = document.getElementById('stu-suggestions-list');

    if (!mine.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><p>你还没有提交过建议</p></div></div>`;
      return;
    }

    container.innerHTML = mine.map(s => `
      <div class="dash-suggestion">
        <div class="dash-suggestion-header">
          <span class="dash-post-time">${XF.formatTime(s.time)}</span>
          <span class="dash-badge ${s.reply ? 'dash-badge--done' : 'dash-badge--pending'}">${s.reply ? '已回复' : '等待回复'}</span>
        </div>
        <p class="dash-suggestion-content">${XF.esc(s.content)}</p>
        ${s.reply ? `
          <div class="dash-suggestion-reply">
            <div class="dash-suggestion-reply-label">📢 管理员回复 · ${XF.formatTime(s.replyTime)}</div>
            <p class="dash-suggestion-reply-text">${XF.esc(s.reply)}</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  document.getElementById('btn-submit-suggestion').addEventListener('click', () => {
    const text = document.getElementById('new-suggestion-text').value.trim();
    if (!text) { XF.toast('请输入建议内容', 'error'); return; }
    XF.addSuggestion(user.id, user.name, text);
    document.getElementById('new-suggestion-text').value = '';
    renderSuggestions();
    XF.toast('建议提交成功！');
  });

  /* ============================================
     VOTE
     ============================================ */
  function renderVote() {
    const v = XF.getVotes();
    const container = document.getElementById('stu-vote-content');

    if (!v.dishes.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg><p>暂无投票活动</p></div></div>`;
      return;
    }

    const maxVotes = Math.max(...v.dishes.map(d => d.votes), 1);
    const sorted = [...v.dishes].sort((a, b) => b.votes - a.votes);

    container.innerHTML = `
      <div class="dash-panel">
        <div class="stu-vote-header">
          <span class="stu-vote-title">${XF.esc(v.title || '下周食谱投票')}</span>
          <div class="stu-vote-status">
            <div class="dot ${v.active ? '' : 'dot--closed'}"></div>
            ${v.active ? '投票进行中' : '投票已结束'}
          </div>
        </div>
        <div class="dash-vote-list">
          ${sorted.map(dish => {
            const voted = dish.voters?.includes(user.id);
            return `
              <div class="dash-vote-item" style="--vote-pct: ${(dish.votes / maxVotes * 100).toFixed(1)}%">
                <span class="dash-vote-name">${XF.esc(dish.name)}</span>
                <span class="dash-vote-count">${dish.votes} 票</span>
                ${v.active ? `
                  <button class="dash-btn ${voted ? 'dash-btn--secondary' : 'dash-btn--primary'} dash-btn--sm btn-cast-vote"
                    data-id="${dish.id}" ${voted ? 'disabled' : ''}>
                    ${voted ? '✓ 已投' : '投票'}
                  </button>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-cast-vote').forEach(btn => {
      btn.addEventListener('click', () => {
        const ok = XF.castVote(btn.dataset.id, user.id);
        if (ok) {
          XF.toast('投票成功！');
          renderVote();
        } else {
          XF.toast('你已经投过了', 'error');
        }
      });
    });
  }

  /* ============================================
     PREFERENCE & RECOMMENDATION
     ============================================ */
  function renderPreference() {
    // Load saved preferences
    const prefs = XF.getUserPreferences(user.id) || {
      spicyLevel: [],
      tastes: [],
      dietType: [],
      allergies: [],
      cuisines: []
    };

    // Set active states in next microtask (after DOM)
    setTimeout(() => {
      (prefs.spicyLevel || []).forEach(v => {
        const btn = document.querySelector(`#spicy-level .preference-tag[data-value="${v}"]`);
        if (btn) btn.classList.add('active');
      });
      (prefs.tastes || []).forEach(t => {
        const btn = document.querySelector(`#taste-preferences .preference-tag[data-value="${t}"]`);
        if (btn) btn.classList.add('active');
      });
      (prefs.dietType || []).forEach(d => {
        const btn = document.querySelector(`#diet-type .preference-tag[data-value="${d}"]`);
        if (btn) btn.classList.add('active');
      });
      (prefs.allergies || []).forEach(a => {
        const btn = document.querySelector(`#allergies .preference-tag[data-value="${a}"]`);
        if (btn) btn.classList.add('active');
      });
      (prefs.cuisines || []).forEach(c => {
        const btn = document.querySelector(`#cuisine-preferences .preference-tag[data-value="${c}"]`);
        if (btn) btn.classList.add('active');
      });

      // Show recommendations if preferences exist
      const hasPrefs = (prefs.spicyLevel || []).length ||
                       (prefs.tastes || []).length ||
                       (prefs.dietType || []).length ||
                       (prefs.cuisines || []).length;
      if (hasPrefs) {
        generateRecommendations(prefs);
      }
    }, 50);

    // Bind preference tag clicks with group-aware logic
    document.querySelectorAll('.preference-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const parent = tag.closest('.preference-tags');
        const isSingle = parent.classList.contains('preference-group--single');

        if (isSingle) {
          // Radio-group: only one active
          const wasActive = tag.classList.contains('active');
          parent.querySelectorAll('.preference-tag').forEach(t => t.classList.remove('active'));
          if (!wasActive) tag.classList.add('active');
        } else {
          // Multi-select toggle
          tag.classList.toggle('active');
        }
      });
    });
  }

  document.getElementById('btn-save-preferences').addEventListener('click', () => {
    const spicyLevel = Array.from(document.querySelectorAll('#spicy-level .preference-tag.active')).map(t => t.dataset.value);
    const tastes = Array.from(document.querySelectorAll('#taste-preferences .preference-tag.active')).map(t => t.dataset.value);
    const dietType = Array.from(document.querySelectorAll('#diet-type .preference-tag.active')).map(t => t.dataset.value);
    const allergies = Array.from(document.querySelectorAll('#allergies .preference-tag.active')).map(t => t.dataset.value);
    const cuisines = Array.from(document.querySelectorAll('#cuisine-preferences .preference-tag.active')).map(t => t.dataset.value);

    if (!spicyLevel.length && !tastes.length && !dietType.length && !cuisines.length) {
      XF.toast('请至少选择一项偏好', 'error');
      return;
    }

    const prefs = { spicyLevel, tastes, dietType, allergies, cuisines };
    XF.saveUserPreferences(user.id, user.name, prefs);
    XF.toast('偏好设置已保存！');

    generateRecommendations(prefs);
  });

  /* ---------- Restaurant Recommendation Engine ---------- */
  function generateRecommendations(prefs) {
    const menu = XF.getTotalMenu();
    const recommendations = { breakfast: [], lunch: [], dinner: [] };
    const allDishes = [];

    // Keyword-to-preference mapping with weighted scores
    const spicyKeywords = {
      '不辣': { keywords: [], conflicting: ['辣', '麻辣'], weight: 10 },
      '微辣': { keywords: ['微辣', '青椒', '泡椒', '小辣'], conflicting: [], weight: 20 },
      '中辣': { keywords: ['辣', '香辣', '辣子'], conflicting: ['麻辣', '爆辣', '特辣'], weight: 25 },
      '特辣': { keywords: ['麻辣', '爆辣', '特辣', '重辣', '火锅'], conflicting: [], weight: 25 }
    };

    const tasteKeywords = {
      '清淡':   { keywords: ['清蒸', '白灼', '炖', '煲', '粥', '清汤', '水煮'], weight: 18, bonus: ['时蔬', '豆腐', '菌', '番茄', '蒸'] },
      '重口味': { keywords: ['红烧', '爆炒', '油焖', '干锅', '回锅', '酱'], weight: 18, bonus: ['肉', '炸', '烧', '烤'] },
      '甜味':   { keywords: ['糖醋', '甜', '蜜汁', '拔丝', '叉烧'], weight: 15, bonus: ['糖', '甜', '蜜'] },
      '咸味':   { keywords: ['腌', '卤', '熏', '腊', '酱'], weight: 13, bonus: ['盐', '咸', '卤'] },
      '酸味':   { keywords: ['酸', '醋', '柠檬', '泡菜', '酸辣'], weight: 15, bonus: ['酸', '醋'] },
      '鲜味':   { keywords: ['鲜', '虾', '蟹', '蛤', '鱼', '高汤', '菌'], weight: 16, bonus: ['鲜', '虾', '蟹'] },
      '麻味':   { keywords: ['麻', '花椒', '藤椒', '椒麻'], weight: 16, bonus: ['麻', '椒'] }
    };

    const dietKeywords = {
      '荤素搭配': { keywords: [], baseWeight: 8 },
      '偏素食':   { keywords: ['豆腐', '时蔬', '菌', '菜', '蔬', '茄子', '土豆', '藕'], boostWeight: 18, penalty: ['排骨', '牛腩', '鸡', '鱼', '虾', '蟹', '猪', '肉'] },
      '全素食':   { keywords: ['豆腐', '时蔬', '菌', '菜', '蔬', '茄子', '土豆', '藕', '面筋'], boostWeight: 25, penalty: ['肉', '鱼', '虾', '蟹', '鸡', '鸭', '蛋', '排骨', '牛'] },
      '高蛋白':   { keywords: ['鸡', '牛', '鱼', '虾', '蛋', '豆', '奶', '肉'], boostWeight: 15, penalty: [] },
      '低碳水':   { keywords: [], boostWeight: 8, penalty: ['米饭', '面', '粉', '馒头', '粥', '饼'] },
      '低脂':     { keywords: ['蒸', '煮', '清', '凉拌', '白灼', '时蔬'], boostWeight: 12, penalty: ['炸', '红烧', '油焖', '回锅', '肥', '猪油'] }
    };

    const cuisineKeywords = {
      '川菜': { keywords: ['川', '麻辣', '水煮', '回锅', '鱼香', '宫保', '担担', '火锅', '红油'], weight: 22 },
      '粤菜': { keywords: ['粤', '煲', '蒸', '白灼', '清蒸', '叉烧', '烧腊', '虾饺'], weight: 22 },
      '湘菜': { keywords: ['湘', '剁椒', '腊肉', '干锅', '小炒', '辣'], weight: 20 },
      '鲁菜': { keywords: ['鲁', '葱烧', '扒', '九转', '糖醋', '爆炒'], weight: 18 },
      '淮扬菜': { keywords: ['淮扬', '狮子头', '大煮', '文思', '水晶', '蟹粉', '清炖'], weight: 18 },
      '东北菜': { keywords: ['东北', '锅包', '乱炖', '溜', '大拉皮', '小鸡炖', '地三鲜'], weight: 18 },
      '西北菜': { keywords: ['西北', '羊肉', '拉面', '大盘', '肉夹', '凉皮', '烤'], weight: 16 },
      '日韩料理': { keywords: ['日', '韩', '寿司', '石锅', '泡菜', '照烧', '味噌', '大酱', '刺身'], weight: 16 }
    };

    // Flatten all dishes
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      (menu[meal] || []).forEach(dish => {
        allDishes.push({ ...dish, mealType: meal });
      });
    });

    allDishes.forEach(dish => {
      let score = 30; // base score
      let reasons = [];

      // ---- Spicy Level Matching ----
      (prefs.spicyLevel || []).forEach(level => {
        const spec = spicyKeywords[level];
        if (!spec) return;
        const hasConflict = spec.conflicting.some(kw => dish.name.includes(kw));
        if (level === '不辣') {
          // "Not spicy": score dishes that DON'T contain any spicy keywords
          const allSpicyKeys = Object.values(spicyKeywords).flatMap(s => s.keywords || []);
          const hasSpicy = allSpicyKeys.some(kw => dish.name.includes(kw));
          if (!hasSpicy) {
            score += spec.weight;
            reasons.push('清淡不辣');
          }
        } else if (!hasConflict) {
          const matched = spec.keywords.some(kw => dish.name.includes(kw));
          if (matched || level === '不辣') {
            score += spec.weight;
            reasons.push(`${level}口味`);
          }
        }
      });

      // ---- Taste Matching ----
      (prefs.tastes || []).forEach(taste => {
        const spec = tasteKeywords[taste];
        if (!spec) return;
        const primary = spec.keywords.some(kw => dish.name.includes(kw));
        const extra = (spec.bonus || []).some(kw => dish.name.includes(kw));
        if (primary) {
          score += spec.weight;
          reasons.push(`符合${taste}偏好`);
        } else if (extra) {
          score += Math.floor(spec.weight * 0.4);
        }
      });

      // ---- Diet Type Matching ----
      (prefs.dietType || []).forEach(diet => {
        const spec = dietKeywords[diet];
        if (!spec) return;
        const hasPenalty = (spec.penalty || []).some(kw => dish.name.includes(kw));
        const hasBoost = (spec.keywords || []).some(kw => dish.name.includes(kw));

        if (hasPenalty) {
          score -= spec.boostWeight || 10;
          reasons.push(`不适合${diet}`);
        } else if (hasBoost) {
          score += spec.boostWeight || 10;
          if (spec.baseWeight) score += spec.baseWeight;
          reasons.push(`符合${diet}`);
        } else if (spec.baseWeight) {
          score += spec.baseWeight;
        }
      });

      // ---- Cuisine Matching ----
      (prefs.cuisines || []).forEach(cuisine => {
        const spec = cuisineKeywords[cuisine];
        if (!spec) return;
        const matched = spec.keywords.some(kw => dish.name.includes(kw));
        if (matched) {
          score += spec.weight;
          reasons.push(`${cuisine}风味`);
        }
      });

      // ---- Allergy Filter ----
      let allergic = false;
      (prefs.allergies || []).forEach(allergy => {
        if (dish.name.includes(allergy)) {
          allergic = true;
          score = -999;
          reasons = [`含${allergy}，已排除`];
        }
      });

      // ---- Popularity Weighting ----
      if (!allergic && score > 0) {
        const likeCount = (dish.likes || []).length;
        const commentCount = (dish.comments || []).length;
        score += Math.min(likeCount * 3, 15);        // cap +15 from likes
        score += Math.min(commentCount * 2, 10);     // cap +10 from comments
        if (likeCount > 0) reasons.unshift(`👍${likeCount}`);
      }

      // Deduplicate reasons
      const uniqueReasons = [...new Set(reasons)];

      if (score > 0) {
        dish.score = score;
        dish.reasons = uniqueReasons.length ? uniqueReasons : ['营养均衡'];
        dish.matchPercentage = Math.min(100, Math.round(score));
      }
    });

    // Assign to meal groups (top 5 per meal)
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      const candidates = allDishes
        .filter(d => d.mealType === meal && d.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      recommendations[meal] = candidates;
    });

    displayRecommendations(recommendations);
  }

  function displayRecommendations(recommendations) {
    const panel = document.getElementById('recommendation-panel');
    const container = document.getElementById('recommendation-content');

    const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
    const mealNames = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };

    let html = '';
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      const dishes = recommendations[meal];
      if (dishes.length) {
        html += `
          <div class="recommendation-meal-section">
            <div class="recommendation-meal-title">${mealIcons[meal]} ${mealNames[meal]} · 为你精选</div>
            <div class="recommendation-dishes">
              ${dishes.map((dish, idx) => {
                const matchColor = dish.matchPercentage >= 80 ? '#10b981' :
                                   dish.matchPercentage >= 60 ? '#f59e0b' : '#6366f1';
                return `
                  <div class="recommendation-dish-card" style="animation-delay:${idx * 0.06}s">
                    <div class="recommendation-dish-name">
                      ${idx === 0 ? '<span class="rec-top-badge">最佳匹配</span> ' : ''}${XF.esc(dish.name)}
                    </div>
                    <div class="recommendation-dish-reason">
                      <div class="rec-reason-list">
                        ${dish.reasons.map(r => `<span class="rec-reason-bubble">${XF.esc(r)}</span>`).join('')}
                      </div>
                    </div>
                    <div class="recommendation-match-score" style="color:${matchColor};border-color:${matchColor}30;background:${matchColor}10;">
                      <svg viewBox="0 0 24 24" width="14" height="14" style="fill:${matchColor};"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      匹配度 ${dish.matchPercentage}%
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
    });

    if (html) {
      container.innerHTML = html;
      panel.style.display = 'block';
      // Scroll to recommendations after render
      setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    } else {
      panel.style.display = 'none';
    }
  }

  /* ---------- Initial Render ---------- */
  renderHome();

});
