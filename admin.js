/* ============================================
   学府膳智 — admin.js
   管理员端逻辑
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Auth Guard ---------- */
  const user = XF.currentUser();
  if (!user || user.role !== 'admin') {
    location.href = 'index.html';
    return;
  }

  document.getElementById('admin-name').textContent = user.name;
  document.getElementById('admin-avatar').textContent = user.name.charAt(0);

  /* ---------- Theme ---------- */
  const html = document.documentElement;
  const stored = localStorage.getItem('xf-theme');
  if (stored) html.setAttribute('data-theme', stored);
  else if (matchMedia('(prefers-color-scheme: dark)').matches) html.setAttribute('data-theme', 'dark');

  document.getElementById('admin-theme-toggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('xf-theme', next);
  });

  /* ---------- Logout ---------- */
  document.getElementById('admin-logout').addEventListener('click', () => {
    XF.logout();
    location.href = 'index.html';
  });

  /* ---------- Mobile Sidebar ---------- */
  const sidebar = document.getElementById('dash-sidebar');
  const overlay = document.getElementById('dash-overlay');
  const menuToggle = document.getElementById('dash-menu-toggle');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  /* ---------- Section Navigation ---------- */
  const navItems = document.querySelectorAll('.dash-nav-item[data-section]');
  const sections = document.querySelectorAll('.dash-section');

  function showSection(name) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    const sec = document.getElementById('section-' + name);
    const nav = document.querySelector(`[data-section="${name}"]`);
    if (sec) sec.classList.add('active');
    if (nav) nav.classList.add('active');
    // Close mobile sidebar
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    // Refresh content
    refreshSection(name);
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => showSection(item.dataset.section));
  });

  function refreshSection(name) {
    switch(name) {
      case 'weekly-menu': renderWeeklyMenu(); break;
      case 'total-menu': renderTotalMenu(); break;
      case 'forum': renderForum(); break;
      case 'suggestions': renderSuggestions(); break;
      case 'votes': renderVotes(); break;
      case 'ranking': renderRanking(); break;
      case 'notices': renderNotices(); break;
    }
  }

  /* ============================================
     ① WEEKLY MENU
     ============================================ */
  const days = ['monday','tuesday','wednesday','thursday','friday'];
  const dayLabels = ['周一','周二','周三','周四','周五'];
  const meals = ['breakfast','lunch','dinner'];
  const mealLabels = ['🌅 早餐','☀️ 午餐','🌙 晚餐'];
  let currentDay = 'monday';

  function renderWeeklyDayTabs() {
    const container = document.getElementById('weekly-day-tabs');
    container.innerHTML = days.map((d, i) =>
      `<button class="dash-tab ${d === currentDay ? 'active' : ''}" data-day="${d}">${dayLabels[i]}</button>`
    ).join('');
    container.querySelectorAll('.dash-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentDay = tab.dataset.day;
        renderWeeklyMenu();
      });
    });
  }

  function renderWeeklyMenu() {
    renderWeeklyDayTabs();
    const menu = XF.getWeeklyMenu();
    const dayMenu = menu[currentDay] || { breakfast: [], lunch: [], dinner: [] };
    const container = document.getElementById('weekly-menu-content');

    container.innerHTML = meals.map((meal, mi) => {
      const items = dayMenu[meal] || [];
      return `
        <div class="dash-panel weekly-meal-section">
          <div class="weekly-meal-title"><span class="meal-icon">${['🌅','☀️','🌙'][mi]}</span> ${['早餐','午餐','晚餐'][mi]}</div>
          <div class="dash-table-wrap">
            <table class="dash-table">
              <thead><tr><th>菜品名称</th><th>楼层</th><th>窗口</th><th>操作</th></tr></thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr>
                    <td class="input-cell"><input value="${XF.esc(item.name)}" data-meal="${meal}" data-idx="${idx}" data-field="name"></td>
                    <td class="input-cell"><input value="${XF.esc(item.floor)}" data-meal="${meal}" data-idx="${idx}" data-field="floor"></td>
                    <td class="input-cell"><input value="${XF.esc(item.window)}" data-meal="${meal}" data-idx="${idx}" data-field="window"></td>
                    <td><button class="dash-btn dash-btn--danger dash-btn--sm btn-remove-row" data-meal="${meal}" data-idx="${idx}">删除</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="weekly-add-row">
            <button class="dash-btn dash-btn--secondary dash-btn--sm btn-add-row" data-meal="${meal}">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加一行
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add row buttons
    container.querySelectorAll('.btn-add-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = XF.getWeeklyMenu();
        if (!m[currentDay]) m[currentDay] = {};
        if (!m[currentDay][btn.dataset.meal]) m[currentDay][btn.dataset.meal] = [];
        m[currentDay][btn.dataset.meal].push({ name: '', floor: '', window: '' });
        XF.setWeeklyMenu(m);
        renderWeeklyMenu();
      });
    });

    // Remove row buttons
    container.querySelectorAll('.btn-remove-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = XF.getWeeklyMenu();
        m[currentDay][btn.dataset.meal].splice(parseInt(btn.dataset.idx), 1);
        XF.setWeeklyMenu(m);
        renderWeeklyMenu();
      });
    });
  }

  // Save weekly menu
  document.getElementById('btn-save-weekly').addEventListener('click', () => {
    const m = XF.getWeeklyMenu();
    if (!m[currentDay]) m[currentDay] = {};
    const inputs = document.querySelectorAll('#weekly-menu-content input[data-meal]');
    inputs.forEach(inp => {
      const meal = inp.dataset.meal;
      const idx = parseInt(inp.dataset.idx);
      const field = inp.dataset.field;
      if (!m[currentDay][meal]) m[currentDay][meal] = [];
      if (!m[currentDay][meal][idx]) m[currentDay][meal][idx] = {};
      m[currentDay][meal][idx][field] = inp.value;
    });
    XF.setWeeklyMenu(m);
    XF.toast('食谱保存成功！');
  });

  /* ============================================
     ② TOTAL MENU
     ============================================ */
  let currentMeal = 'breakfast';

  function bindTotalTabs() {
    document.querySelectorAll('#total-meal-tabs .dash-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#total-meal-tabs .dash-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMeal = tab.dataset.meal;
        renderTotalMenu();
      });
    });
  }

  function renderTotalMenu() {
    const menu = XF.getTotalMenu();
    const dishes = menu[currentMeal] || [];
    const container = document.getElementById('total-menu-list');

    if (!dishes.length) {
      container.innerHTML = `<div class="dash-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg><p>暂无菜品，点击上方按钮添加</p></div>`;
      return;
    }

    container.innerHTML = dishes.map(dish => `
      <div class="admin-dish-row">
        <span class="admin-dish-name">${XF.esc(dish.name)}</span>
        <div class="admin-dish-stats">
          <span>👍 ${dish.likes?.length || 0} 赞</span>
          <span>💬 ${dish.comments?.length || 0} 评论</span>
        </div>
        <button class="dash-btn dash-btn--danger dash-btn--sm btn-remove-dish" data-id="${dish.id}">删除</button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('确定删除该菜品？')) {
          XF.removeDish(currentMeal, btn.dataset.id);
          renderTotalMenu();
          XF.toast('菜品已删除');
        }
      });
    });
  }

  document.getElementById('btn-add-dish').addEventListener('click', () => {
    const input = document.getElementById('new-dish-name');
    const name = input.value.trim();
    if (!name) { XF.toast('请输入菜品名称', 'error'); return; }
    XF.addDish(currentMeal, name);
    input.value = '';
    renderTotalMenu();
    XF.toast('菜品添加成功！');
  });

  bindTotalTabs();

  /* ============================================
     ③ FORUM
     ============================================ */
  let replyingPostId = null;

  function renderForum() {
    const posts = XF.getForumPosts();
    const container = document.getElementById('admin-forum-list');

    if (!posts.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>暂无帖子</p></div></div>`;
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="dash-post">
        <div class="dash-post-header">
          <div class="dash-post-author">
            <div class="dash-post-avatar dash-post-avatar--${post.authorRole}">${post.authorName.charAt(0)}</div>
            <div>
              <span class="dash-post-name">${XF.esc(post.authorName)}</span>
              <span class="dash-badge dash-badge--${post.authorRole}" style="margin-left:0.6rem;">${post.authorRole === 'admin' ? '管理员' : '学生'}</span>
            </div>
          </div>
          <span class="dash-post-time">${XF.formatTime(post.time)}</span>
        </div>
        <h4 class="dash-post-title">${XF.esc(post.title)}</h4>
        <p class="dash-post-content">${XF.esc(post.content)}</p>
        <div class="dash-post-actions">
          <button class="dash-btn dash-btn--secondary dash-btn--sm btn-forum-reply" data-id="${post.id}">回复</button>
          <button class="dash-btn dash-btn--danger dash-btn--sm btn-forum-delete" data-id="${post.id}">删除</button>
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

    container.querySelectorAll('.btn-forum-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('确定删除该帖子？')) {
          XF.deleteForumPost(btn.dataset.id);
          renderForum();
          XF.toast('帖子已删除');
        }
      });
    });

    container.querySelectorAll('.btn-forum-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        replyingPostId = btn.dataset.id;
        document.getElementById('forum-reply-text').value = '';
        document.getElementById('modal-forum-reply').classList.add('active');
      });
    });
  }

  // Forum reply modal
  document.getElementById('forum-reply-cancel').addEventListener('click', () => {
    document.getElementById('modal-forum-reply').classList.remove('active');
  });
  document.getElementById('modal-forum-reply').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('forum-reply-submit').addEventListener('click', () => {
    const text = document.getElementById('forum-reply-text').value.trim();
    if (!text) { XF.toast('请输入回复内容', 'error'); return; }
    XF.addForumReply(replyingPostId, user.id, user.name, user.role, text);
    document.getElementById('modal-forum-reply').classList.remove('active');
    renderForum();
    XF.toast('回复成功！');
  });

  /* ============================================
     ④ SUGGESTIONS
     ============================================ */
  let replyingSuggestionId = null;

  function renderSuggestions() {
    const list = XF.getSuggestions();
    const container = document.getElementById('admin-suggestions-list');

    if (!list.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><p>暂无学生建议</p></div></div>`;
      return;
    }

    container.innerHTML = list.map(s => `
      <div class="dash-suggestion">
        <div class="dash-suggestion-header">
          <div style="display:flex;align-items:center;gap:0.8rem;">
            <div class="dash-post-avatar dash-post-avatar--student" style="width:2.8rem;height:2.8rem;font-size:1.1rem;">${s.studentName.charAt(0)}</div>
            <span class="dash-post-name">${XF.esc(s.studentName)}</span>
            <span class="dash-post-time">${XF.formatTime(s.time)}</span>
          </div>
          <span class="dash-badge ${s.reply ? 'dash-badge--done' : 'dash-badge--pending'}">${s.reply ? '已回复' : '待处理'}</span>
        </div>
        <p class="dash-suggestion-content">${XF.esc(s.content)}</p>
        ${s.reply ? `
          <div class="dash-suggestion-reply">
            <div class="dash-suggestion-reply-label">管理员回复 · ${XF.formatTime(s.replyTime)}</div>
            <p class="dash-suggestion-reply-text">${XF.esc(s.reply)}</p>
          </div>
        ` : `
          <button class="dash-btn dash-btn--primary dash-btn--sm btn-reply-suggestion" data-id="${s.id}">回复</button>
        `}
      </div>
    `).join('');

    container.querySelectorAll('.btn-reply-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = list.find(x => x.id === btn.dataset.id);
        replyingSuggestionId = btn.dataset.id;
        document.getElementById('modal-suggestion-text').textContent = s?.content || '';
        document.getElementById('modal-reply-text').value = '';
        document.getElementById('modal-reply-suggestion').classList.add('active');
      });
    });
  }

  // Reply suggestion modal
  document.getElementById('modal-reply-cancel').addEventListener('click', () => {
    document.getElementById('modal-reply-suggestion').classList.remove('active');
  });
  document.getElementById('modal-reply-suggestion').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('modal-reply-submit').addEventListener('click', () => {
    const text = document.getElementById('modal-reply-text').value.trim();
    if (!text) { XF.toast('请输入回复内容', 'error'); return; }
    XF.replySuggestion(replyingSuggestionId, text);
    document.getElementById('modal-reply-suggestion').classList.remove('active');
    renderSuggestions();
    XF.toast('回复成功！');
  });

  /* ============================================
     ⑤ VOTES
     ============================================ */
  function renderVotes() {
    const v = XF.getVotes();
    const container = document.getElementById('admin-vote-content');

    const statusBar = `
      <div class="vote-status-bar">
        <div class="vote-status-indicator">
          <div class="vote-status-dot ${v.active ? 'vote-status-dot--active' : 'vote-status-dot--inactive'}"></div>
          <span class="vote-status-text">${v.active ? '投票进行中' : '投票已关闭'}</span>
        </div>
        <div>
          <button class="dash-btn ${v.active ? 'dash-btn--danger' : 'dash-btn--primary'} dash-btn--sm" id="btn-toggle-vote">
            ${v.active ? '关闭投票' : '开启投票'}
          </button>
        </div>
      </div>
    `;

    if (!v.dishes.length) {
      container.innerHTML = statusBar + `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg><p>暂无投票，点击"创建投票"按钮开始</p></div></div>`;
    } else {
      const maxVotes = Math.max(...v.dishes.map(d => d.votes), 1);
      const sorted = [...v.dishes].sort((a, b) => b.votes - a.votes);
      container.innerHTML = statusBar + `
        <div class="dash-panel">
          <div class="dash-panel-title">${XF.esc(v.title || '下周食谱投票')}</div>
          <div class="dash-vote-list">
            ${sorted.map(dish => `
              <div class="dash-vote-item" style="--vote-pct: ${(dish.votes / maxVotes * 100).toFixed(1)}%">
                <span class="dash-vote-name">${XF.esc(dish.name)}</span>
                <span class="dash-vote-count">${dish.votes} 票</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    document.getElementById('btn-toggle-vote')?.addEventListener('click', () => {
      const vt = XF.getVotes();
      vt.active = !vt.active;
      XF.setVotes(vt);
      renderVotes();
      XF.toast(vt.active ? '投票已开启' : '投票已关闭');
    });
  }

  // Create vote modal
  document.getElementById('btn-create-vote').addEventListener('click', () => {
    const menu = XF.getTotalMenu();
    const container = document.getElementById('vote-dish-candidates');
    let html = '';
    ['breakfast','lunch','dinner'].forEach(meal => {
      (menu[meal] || []).forEach(dish => {
        html += `
          <div class="vote-candidate">
            <input type="checkbox" id="vc-${dish.id}" value="${dish.id}" data-name="${XF.esc(dish.name)}">
            <label for="vc-${dish.id}">${XF.esc(dish.name)}</label>
            <span class="vote-meal-label">${XF.mealLabel(meal)}</span>
          </div>
        `;
      });
    });
    container.innerHTML = html || '<p style="color:var(--text-secondary);font-size:1.4rem;">暂无菜品，请先在总食谱中添加。</p>';
    document.getElementById('vote-title').value = '下周你最想吃什么？';
    document.getElementById('modal-create-vote').classList.add('active');
  });

  document.getElementById('vote-cancel').addEventListener('click', () => {
    document.getElementById('modal-create-vote').classList.remove('active');
  });
  document.getElementById('modal-create-vote').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('vote-submit').addEventListener('click', () => {
    const title = document.getElementById('vote-title').value.trim();
    const checked = document.querySelectorAll('#vote-dish-candidates input:checked');
    if (!checked.length) { XF.toast('请至少选择一个菜品', 'error'); return; }
    const dishes = Array.from(checked).map(cb => ({
      id: XF.uid(), name: cb.dataset.name, votes: 0, voters: []
    }));
    XF.setVotes({ active: true, title: title || '下周食谱投票', dishes });
    document.getElementById('modal-create-vote').classList.remove('active');
    renderVotes();
    XF.toast('投票创建成功！');
  });

  /* ============================================
     ⑥ RANKING
     ============================================ */
  function renderRanking() {
    const ranking = XF.getHotRanking(10);
    const container = document.getElementById('admin-ranking-list');

    if (!ranking.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><p>暂无排名数据</p></div></div>`;
      return;
    }

    container.innerHTML = `<div class="dash-rank-list">${ranking.map((dish, i) => {
      const numClass = i < 3 ? `dash-rank-num--${i+1}` : 'dash-rank-num--default';
      return `
        <div class="dash-rank-card">
          <div class="dash-rank-num ${numClass}">${i + 1}</div>
          <div class="dash-rank-info">
            <div class="dash-rank-name">${XF.esc(dish.name)}</div>
            <div class="dash-rank-stats">
              <span>👍 ${dish.likes?.length || 0}</span>
              <span>💬 ${dish.comments?.length || 0}</span>
              <span class="dash-badge dash-badge--hot" style="margin-left:0.4rem;">${XF.mealLabel(dish.mealType)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('')}</div>`;
  }

  /* ============================================
     ⑦ NOTICES
     ============================================ */
  function renderNotices() {
    const list = XF.getNotices();
    const container = document.getElementById('admin-notices-list');

    if (!list.length) {
      container.innerHTML = `<div class="dash-panel"><div class="dash-empty"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><p>暂无通知</p></div></div>`;
      return;
    }

    container.innerHTML = list.map(n => `
      <div class="dash-notice">
        ${n.imageUrl ? `<img class="dash-notice-img" src="${XF.esc(n.imageUrl)}" alt="${XF.esc(n.title)}" onerror="this.style.display='none'">` : ''}
        <div class="dash-notice-body">
          <h4 class="dash-notice-title">${XF.esc(n.title)}</h4>
          <p class="dash-notice-text">${XF.esc(n.content)}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.8rem;">
            <span class="dash-notice-time">${XF.formatTime(n.time)}</span>
            <button class="dash-btn dash-btn--danger dash-btn--sm btn-delete-notice" data-id="${n.id}">删除</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-delete-notice').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('确定删除该通知？')) {
          XF.deleteNotice(btn.dataset.id);
          renderNotices();
          XF.toast('通知已删除');
        }
      });
    });
  }

  // Add notice modal
  document.getElementById('btn-add-notice').addEventListener('click', () => {
    document.getElementById('notice-title').value = '';
    document.getElementById('notice-content').value = '';
    document.getElementById('notice-image').value = '';
    document.getElementById('modal-add-notice').classList.add('active');
  });
  document.getElementById('notice-cancel').addEventListener('click', () => {
    document.getElementById('modal-add-notice').classList.remove('active');
  });
  document.getElementById('modal-add-notice').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });
  document.getElementById('notice-submit').addEventListener('click', () => {
    const title = document.getElementById('notice-title').value.trim();
    const content = document.getElementById('notice-content').value.trim();
    const image = document.getElementById('notice-image').value.trim();
    if (!title || !content) { XF.toast('请填写标题和内容', 'error'); return; }
    XF.addNotice(title, content, image);
    document.getElementById('modal-add-notice').classList.remove('active');
    renderNotices();
    XF.toast('通知发布成功！');
  });

  /* ---------- Initial Render ---------- */
  renderWeeklyMenu();

});
