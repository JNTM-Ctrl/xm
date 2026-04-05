/* ============================================
   学府膳智 — shared.js
   共享数据层 & 工具函数
   ============================================ */

const XF = (() => {

  /* ---------- Storage Helpers ---------- */
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /* ---------- ID Generator ---------- */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Date Helpers ---------- */
  function formatTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /* ---------- Default data seeding ---------- */
  function seed() {
    // Default users
    if (!get('xf_users')) {
      set('xf_users', [
        { id: 'admin001', name: '管理员', account: 'admin', password: 'admin123', role: 'admin' },
        { id: 'stu001', name: '张三', account: 'student', password: 'student123', role: 'student' }
      ]);
    }

    // Weekly menu
    if (!get('xf_weeklyMenu')) {
      const days = ['monday','tuesday','wednesday','thursday','friday'];
      const dayNames = ['周一','周二','周三','周四','周五'];
      const menu = {};
      const sampleBreakfast = [
        { name: '豆浆油条', floor: '1楼', window: 'A1窗口' },
        { name: '小米粥+花卷', floor: '1楼', window: 'A2窗口' }
      ];
      const sampleLunch = [
        { name: '红烧排骨+时蔬', floor: '2楼', window: 'B1窗口' },
        { name: '番茄炒蛋+米饭', floor: '2楼', window: 'B2窗口' },
        { name: '宫保鸡丁+米饭', floor: '1楼', window: 'A3窗口' }
      ];
      const sampleDinner = [
        { name: '酸菜鱼+米饭', floor: '2楼', window: 'B1窗口' },
        { name: '牛肉面', floor: '1楼', window: 'A1窗口' }
      ];
      days.forEach(d => {
        menu[d] = {
          breakfast: JSON.parse(JSON.stringify(sampleBreakfast)),
          lunch: JSON.parse(JSON.stringify(sampleLunch)),
          dinner: JSON.parse(JSON.stringify(sampleDinner))
        };
      });
      set('xf_weeklyMenu', menu);
    }

    // Total menu
    if (!get('xf_totalMenu')) {
      set('xf_totalMenu', {
        breakfast: [
          { id: uid(), name: '豆浆油条', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '小米粥', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '煎饼果子', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '鸡蛋灌饼', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '八宝粥+馒头', likes: [], comments: [], suggestions: [] }
        ],
        lunch: [
          { id: uid(), name: '红烧排骨', likes: ['stu001'], comments: [{ userId: 'stu001', userName: '张三', text: '非常好吃！', time: Date.now() - 86400000 }], suggestions: [] },
          { id: uid(), name: '宫保鸡丁', likes: ['stu001'], comments: [], suggestions: [] },
          { id: uid(), name: '糖醋里脊', likes: [], comments: [{ userId: 'stu001', userName: '张三', text: '希望多加一点醋', time: Date.now() - 172800000 }], suggestions: [] },
          { id: uid(), name: '番茄炒蛋', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '鱼香肉丝', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '红烧牛腩', likes: ['stu001'], comments: [{ userId: 'stu001', userName: '张三', text: '牛肉很嫩！', time: Date.now() - 259200000 }], suggestions: [] },
          { id: uid(), name: '麻婆豆腐', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '清炒西兰花', likes: [], comments: [], suggestions: [] }
        ],
        dinner: [
          { id: uid(), name: '酸菜鱼', likes: ['stu001'], comments: [], suggestions: [] },
          { id: uid(), name: '牛肉面', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '炒河粉', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '水饺', likes: [], comments: [], suggestions: [] },
          { id: uid(), name: '砂锅粥', likes: [], comments: [], suggestions: [] }
        ]
      });
    }

    // Forum
    if (!get('xf_forumPosts')) {
      set('xf_forumPosts', [
        {
          id: uid(),
          authorId: 'stu001',
          authorName: '张三',
          authorRole: 'student',
          title: '今天的红烧排骨太好吃了！',
          content: '真的很入味，下次还想吃！希望这道菜可以每周都有。',
          time: Date.now() - 86400000,
          replies: [
            { id: uid(), authorId: 'admin001', authorName: '管理员', authorRole: 'admin', content: '感谢你的反馈，我们会考虑增加供应频次！', time: Date.now() - 43200000 }
          ]
        }
      ]);
    }

    // Suggestions
    if (!get('xf_suggestions')) {
      set('xf_suggestions', [
        { id: uid(), studentId: 'stu001', studentName: '张三', content: '希望增加更多素食选择', time: Date.now() - 172800000, reply: '感谢建议！我们已将此建议转达给厨房团队。', replyTime: Date.now() - 86400000 }
      ]);
    }

    // Votes
    if (!get('xf_votes')) {
      set('xf_votes', {
        active: true,
        title: '下周你最想吃什么？',
        dishes: [
          { id: uid(), name: '红烧排骨', votes: 15, voters: [] },
          { id: uid(), name: '糖醋里脊', votes: 12, voters: [] },
          { id: uid(), name: '宫保鸡丁', votes: 10, voters: [] },
          { id: uid(), name: '酸菜鱼', votes: 8, voters: [] },
          { id: uid(), name: '牛肉面', votes: 6, voters: [] },
          { id: uid(), name: '水饺', votes: 5, voters: [] }
        ]
      });
    }

    // Notices
    if (!get('xf_notices')) {
      set('xf_notices', [
        { id: uid(), title: '本周食谱更新通知', content: '新增三款地方特色菜品，周三起供应。欢迎同学们品尝并给出反馈！', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75', time: Date.now() - 86400000 },
        { id: uid(), title: '食品安全月度报告', content: '三月份食材检测全部合格，详细数据已公示于食堂公告栏。', imageUrl: '', time: Date.now() - 259200000 }
      ]);
    }
  }

  /* ---------- User Auth ---------- */
  function login(account, password, role) {
    const users = get('xf_users', []);
    const user = users.find(u => u.account === account && u.password === password && u.role === role);
    if (user) {
      set('xf_currentUser', { id: user.id, name: user.name, account: user.account, role: user.role });
      return user;
    }
    return null;
  }

  function register(name, account, password, role) {
    const users = get('xf_users', []);
    if (users.find(u => u.account === account && u.role === role)) {
      return { error: '该账号已被注册' };
    }
    const user = { id: uid(), name, account, password, role };
    users.push(user);
    set('xf_users', users);
    set('xf_currentUser', { id: user.id, name: user.name, account: user.account, role: user.role });
    return user;
  }

  function logout() {
    localStorage.removeItem('xf_currentUser');
  }

  function currentUser() {
    return get('xf_currentUser');
  }

  /* ---------- Weekly Menu ---------- */
  function getWeeklyMenu() { return get('xf_weeklyMenu', {}); }
  function setWeeklyMenu(menu) { set('xf_weeklyMenu', menu); }

  /* ---------- Total Menu ---------- */
  function getTotalMenu() { return get('xf_totalMenu', { breakfast: [], lunch: [], dinner: [] }); }
  function setTotalMenu(menu) { set('xf_totalMenu', menu); }

  function toggleLike(mealType, dishId, userId) {
    const menu = getTotalMenu();
    const dish = menu[mealType]?.find(d => d.id === dishId);
    if (!dish) return;
    const idx = dish.likes.indexOf(userId);
    if (idx >= 0) dish.likes.splice(idx, 1);
    else dish.likes.push(userId);
    setTotalMenu(menu);
    return dish;
  }

  function addComment(mealType, dishId, userId, userName, text) {
    const menu = getTotalMenu();
    const dish = menu[mealType]?.find(d => d.id === dishId);
    if (!dish) return;
    dish.comments.push({ userId, userName, text, time: Date.now() });
    setTotalMenu(menu);
    return dish;
  }

  function addDishSuggestion(mealType, dishId, userId, userName, text) {
    const menu = getTotalMenu();
    const dish = menu[mealType]?.find(d => d.id === dishId);
    if (!dish) return;
    dish.suggestions.push({ userId, userName, text, time: Date.now() });
    setTotalMenu(menu);
    return dish;
  }

  function addDish(mealType, name) {
    const menu = getTotalMenu();
    if (!menu[mealType]) menu[mealType] = [];
    const dish = { id: uid(), name, likes: [], comments: [], suggestions: [] };
    menu[mealType].push(dish);
    setTotalMenu(menu);
    return dish;
  }

  function removeDish(mealType, dishId) {
    const menu = getTotalMenu();
    if (!menu[mealType]) return;
    menu[mealType] = menu[mealType].filter(d => d.id !== dishId);
    setTotalMenu(menu);
  }

  /* ---------- Hot Ranking ---------- */
  function getHotRanking(topN = 10) {
    const menu = getTotalMenu();
    const all = [];
    ['breakfast','lunch','dinner'].forEach(meal => {
      (menu[meal] || []).forEach(dish => {
        all.push({
          ...dish,
          mealType: meal,
          score: (dish.likes?.length || 0) + (dish.comments?.length || 0)
        });
      });
    });
    all.sort((a, b) => b.score - a.score);
    return all.slice(0, topN);
  }

  /* ---------- Forum ---------- */
  function getForumPosts() { return get('xf_forumPosts', []); }
  function setForumPosts(posts) { set('xf_forumPosts', posts); }

  function addForumPost(authorId, authorName, authorRole, title, content) {
    const posts = getForumPosts();
    const post = { id: uid(), authorId, authorName, authorRole, title, content, time: Date.now(), replies: [] };
    posts.unshift(post);
    setForumPosts(posts);
    return post;
  }

  function addForumReply(postId, authorId, authorName, authorRole, content) {
    const posts = getForumPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.replies.push({ id: uid(), authorId, authorName, authorRole, content, time: Date.now() });
    setForumPosts(posts);
    return post;
  }

  function deleteForumPost(postId) {
    let posts = getForumPosts();
    posts = posts.filter(p => p.id !== postId);
    setForumPosts(posts);
  }

  /* ---------- Suggestions ---------- */
  function getSuggestions() { return get('xf_suggestions', []); }
  function setSuggestions(list) { set('xf_suggestions', list); }

  function addSuggestion(studentId, studentName, content) {
    const list = getSuggestions();
    list.unshift({ id: uid(), studentId, studentName, content, time: Date.now(), reply: '', replyTime: null });
    setSuggestions(list);
  }

  function replySuggestion(suggestionId, replyText) {
    const list = getSuggestions();
    const s = list.find(x => x.id === suggestionId);
    if (!s) return;
    s.reply = replyText;
    s.replyTime = Date.now();
    setSuggestions(list);
  }

  /* ---------- Votes ---------- */
  function getVotes() { return get('xf_votes', { active: false, title: '', dishes: [] }); }
  function setVotes(v) { set('xf_votes', v); }

  function castVote(dishId, userId) {
    const v = getVotes();
    const dish = v.dishes.find(d => d.id === dishId);
    if (!dish) return false;
    if (dish.voters.includes(userId)) return false;
    dish.votes++;
    dish.voters.push(userId);
    setVotes(v);
    return true;
  }

  /* ---------- Notices ---------- */
  function getNotices() { return get('xf_notices', []); }
  function setNotices(list) { set('xf_notices', list); }

  function addNotice(title, content, imageUrl) {
    const list = getNotices();
    list.unshift({ id: uid(), title, content, imageUrl: imageUrl || '', time: Date.now() });
    setNotices(list);
  }

  function deleteNotice(noticeId) {
    let list = getNotices();
    list = list.filter(n => n.id !== noticeId);
    setNotices(list);
  }

  /* ---------- Meal type label ---------- */
  function mealLabel(type) {
    return { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[type] || type;
  }

  function dayLabel(key) {
    return { monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四', friday: '周五' }[key] || key;
  }

  /* ---------- Escape HTML ---------- */
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ---------- Toast ---------- */
  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `xf-toast xf-toast--${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, 2500);
  }

  /* ---------- Init ---------- */
  seed();

  return {
    get, set, uid, formatTime, esc, toast,
    login, register, logout, currentUser,
    getWeeklyMenu, setWeeklyMenu,
    getTotalMenu, setTotalMenu,
    toggleLike, addComment, addDishSuggestion, addDish, removeDish,
    getHotRanking,
    getForumPosts, setForumPosts, addForumPost, addForumReply, deleteForumPost,
    getSuggestions, setSuggestions, addSuggestion, replySuggestion,
    getVotes, setVotes, castVote,
    getNotices, setNotices, addNotice, deleteNotice,
    mealLabel, dayLabel
  };

})();
