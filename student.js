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
      case 'forum': renderForum(); break;
      case 'suggest': renderSuggestions(); break;
      case 'vote': renderVote(); break;
    }
  }

  /* ============================================
     HOME — HOT RANKING + NOTICES
     ============================================ */
  function renderHome() {
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

  /* ---------- Initial Render ---------- */
  renderHome();

});
