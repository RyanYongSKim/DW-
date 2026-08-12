(() => {
  'use strict';

  const STORAGE_KEY = 'deadline-line-tasks-v1';
  const STORAGE_MIGRATION_KEY = `${STORAGE_KEY}:account-migration`;
  const URGENT_MS = 30 * 60 * 1000;
  const form = document.querySelector('#task-form');
  const list = document.querySelector('#task-list');
  const completedList = document.querySelector('#completed-task-list');
  const template = document.querySelector('#task-template');
  const filterButtons = [...document.querySelectorAll('.filter')];
  let tasks = [];
  let accountStorageKey = null;
  let activeFilter = 'open';
  let searchQuery = '';
  let cloudReady = false;
  let cloudHydrationPromise = Promise.resolve();
  let cloudSaveQueue = Promise.resolve();

  const exportButton = document.querySelector('#export-data');
  const importButton = document.querySelector('#import-data');
  const importFileInput = document.querySelector('#import-data-file');

  exportButton.addEventListener('click', exportTasks);
  importButton.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importTasks);
  let editingId = null;
  const newlyUrgent = new Set();

  document.querySelector('#today').textContent = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  }).format(new Date());

  setDefaultDeadline();
  const taskSearch = new window.CurvedInput(document.querySelector('#task-search'), {
    theme: 'light', bend: 0, height: 64, width: '100%', type: 'search',
    placeholder: '거래처 또는 업무 검색…', ariaLabel: '거래처 또는 업무 검색'
  });
  document.querySelector('#task-search').addEventListener('curved-input-change', (event) => {
    searchQuery = event.detail.value.trim().toLocaleLowerCase('ko-KR');
    render();
  });
  const taskScrollStack = new window.ScrollStack(list, {
    itemDistance: 34,
    itemScale: 0.018,
    itemStackDistance: 12,
    stackPosition: 18,
    baseScale: 0.92,
    blurAmount: 0
  });
  const statusOrbit = new window.OrbitingItems3D(document.querySelector('#status-orbit'), {
    radiusX: 37,
    radiusY: 22,
    tiltAngle: -12,
    duration: 18000
  });
  render();
  cloudHydrationPromise = hydrateFromCloud();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const values = {
      client: String(data.get('client') || '').trim(),
      task: String(data.get('task') || '').trim(),
      order: String(data.get('order') || '').trim(),
      deadline: String(data.get('deadline') || '')
    };
    if (!validate(values)) return;
    values.order = values.order ? Number(values.order) : getNextClientOrder(values.client, editingId);

    if (editingId) {
      const task = tasks.find((item) => item.id === editingId);
      if (task) Object.assign(task, values, { updatedAt: new Date().toISOString() });
    } else {
      tasks.push({
        id: createTaskId(),
        ...values,
        createdAt: new Date().toISOString(),
        completedAt: null,
        cancelledAt: null
      });
    }
    saveTasks();
    resetForm();
    activeFilter = 'open';
    syncFilters();
    render();
    document.querySelector('#client').focus();
  });

  document.querySelector('#edit-cancel').addEventListener('click', resetForm);

  form.addEventListener('input', (event) => {
    if (event.target.matches('input')) clearFieldError(event.target.id);
  });

  document.querySelector('#client').addEventListener('blur', (event) => {
    const orderInput = document.querySelector('#order');
    if (!editingId && event.target.value.trim() && !orderInput.value) {
      orderInput.value = getNextClientOrder(event.target.value);
    }
  });

  filterButtons.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    syncFilters();
    render();
  }));

  [list, completedList].forEach(container => container.addEventListener('click', (event) => {
    const button = event.target.closest('.complete-button, .edit-button, .cancel-button, .delete-button, .follow-up-button');
    if (!button) return;
    const task = tasks.find((item) => item.id === button.dataset.id);
    if (!task) return;
    if (button.classList.contains('follow-up-button')) {
      startFollowUp(task);
      return;
    }
    if (button.classList.contains('delete-button')) {
      const confirmed = window.confirm(`“${task.client} · ${task.task}” 업무를 삭제할까요?\n삭제한 업무는 복구할 수 없습니다.`);
      if (!confirmed) return;
      tasks = tasks.filter((item) => item.id !== task.id);
      if (editingId === task.id) resetForm();
      saveTasks();
      render();
      return;
    }
    if (task.completedAt || task.cancelledAt) return;
    if (button.classList.contains('edit-button')) {
      startEditing(task);
      return;
    }
    if (button.classList.contains('cancel-button')) {
      task.cancelledAt = new Date().toISOString();
      if (editingId === task.id) resetForm();
    } else {
      task.completedAt = new Date().toISOString();
    }
    saveTasks();
    render();
  }));

  window.setInterval(render, 30000);

  function validate(values) {
    clearErrors();
    let valid = true;
    const checks = [
      ['client', values.client, '거래처명을 입력해 주세요.'],
      ['task', values.task, '처리할 업무를 입력해 주세요.'],
      ['deadline', values.deadline, '마감시간을 선택해 주세요.']
    ];
    checks.forEach(([id, value, message]) => {
      if (value) return;
      valid = false;
      const input = document.querySelector(`#${id}`);
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${id}-error`);
      document.querySelector(`#${id}-error`).textContent = message;
    });
    if (values.order && (!Number.isInteger(Number(values.order)) || Number(values.order) < 1)) {
      valid = false;
      const input = document.querySelector('#order');
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', 'order-error');
      document.querySelector('#order-error').textContent = '1 이상의 정수를 입력해 주세요.';
    }
    if (!valid) document.querySelector('.invalid')?.focus();
    return valid;
  }

  function clearErrors() {
    ['client', 'task', 'order', 'deadline'].forEach(clearFieldError);
  }

  function clearFieldError(id) {
    const input = document.querySelector(`#${id}`);
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    document.querySelector(`#${id}-error`).textContent = '';
  }

  function getStatus(task, now = Date.now()) {
    if (task.cancelledAt) return 'cancelled';
    if (task.completedAt) return 'done';
    const remaining = new Date(task.deadline).getTime() - now;
    if (remaining < 0) return 'overdue';
    if (remaining <= URGENT_MS) return 'urgent';
    return 'progress';
  }

  function sortTasks(items) {
    return [...items].sort((a, b) => {
      const aDone = Boolean(a.completedAt || a.cancelledAt);
      const bDone = Boolean(b.completedAt || b.cancelledAt);
      if (aDone !== bDone) return aDone ? 1 : -1;
      if (aDone) return new Date(b.completedAt || b.cancelledAt) - new Date(a.completedAt || a.cancelledAt);
      const statusRank = { overdue: 0, urgent: 1, progress: 2 };
      const statusDifference = statusRank[getStatus(a)] - statusRank[getStatus(b)];
      if (statusDifference !== 0) return statusDifference;
      const deadlineDifference = new Date(a.deadline) - new Date(b.deadline);
      if (deadlineDifference !== 0) return deadlineDifference;
      if (normalizeClient(a.client) === normalizeClient(b.client)) {
        const orderDifference = Number(a.order) - Number(b.order);
        if (orderDifference !== 0) return orderDifference;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  function render() {
    window.taskCloud?.setTaskCount(tasks.length);
    const previousStatuses = new Map(tasks.map((task) => [task.id, task._lastStatus]));
    tasks.forEach((task) => {
      const current = getStatus(task);
      if (current === 'urgent' && previousStatuses.get(task.id) === 'progress') newlyUrgent.add(task.id);
      task._lastStatus = current;
    });

    const open = tasks.filter((task) => !task.completedAt && !task.cancelledAt);
    const completed = tasks.filter((task) => task.completedAt);
    const cancelled = tasks.filter((task) => task.cancelledAt);
    document.querySelector('#open-count').textContent = open.length;
    document.querySelector('#filter-open-count').textContent = open.length;
    document.querySelector('#filter-cancelled-count').textContent = cancelled.length;
    document.querySelector('#completed-count').textContent = completed.length;
    const urgentCount = open.filter((task) => ['urgent', 'overdue'].includes(getStatus(task))).length;
    document.querySelector('#urgent-summary').textContent = urgentCount ? `확인이 필요한 업무 ${urgentCount}건` : '급한 업무가 없습니다';
    statusOrbit.update([
      { status: 'progress', label: '진행 중', value: open.filter(task => getStatus(task) === 'progress').length },
      { status: 'urgent', label: '마감 임박', value: open.filter(task => getStatus(task) === 'urgent').length },
      { status: 'overdue', label: '기한 지남', value: open.filter(task => getStatus(task) === 'overdue').length },
      { status: 'done', label: '처리 완료', value: tasks.filter(task => task.completedAt).length }
    ]);

    const visible = sortTasks(tasks).filter((task) => {
      if (activeFilter === 'open') return !task.completedAt && !task.cancelledAt;
      if (activeFilter === 'cancelled') return Boolean(task.cancelledAt);
      return !task.completedAt;
    }).filter((task) => !searchQuery || `${task.client} ${task.task}`.toLocaleLowerCase('ko-KR').includes(searchQuery));
    list.replaceChildren();
    if (!visible.length) {
      const message = searchQuery
        ? ['검색 결과가 없어요', '다른 거래처명이나 업무 내용으로 검색해 보세요.']
        : activeFilter === 'cancelled'
        ? ['취소된 업무가 없어요', '취소한 업무는 이곳에서 확인할 수 있어요.']
        : activeFilter === 'open'
          ? ['남은 업무가 없어요', '새 업무를 등록하거나 잠시 여유를 즐겨보세요.']
          : ['등록된 업무가 없어요', '위 입력란에서 첫 업무를 추가해 보세요.'];
      list.innerHTML = `<div class="empty-state"><div><span class="empty-icon">✓</span><strong>${message[0]}</strong><p>${message[1]}</p></div></div>`;
    } else {
      visible.forEach(task => renderTask(task, list, true));
    }

    const completedVisible = [...completed]
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .filter((task) => !searchQuery || `${task.client} ${task.task}`.toLocaleLowerCase('ko-KR').includes(searchQuery));
    completedList.replaceChildren();
    if (!completedVisible.length) {
      const message = searchQuery
        ? ['검색된 처리 업무가 없어요', '다른 거래처명이나 업무 내용으로 검색해 보세요.']
        : ['아직 처리된 업무가 없어요', '업무를 처리하면 완료 기록이 이곳에 쌓입니다.'];
      completedList.innerHTML = `<div class="empty-state compact"><div><span class="empty-icon">✓</span><strong>${message[0]}</strong><p>${message[1]}</p></div></div>`;
    } else {
      completedVisible.forEach(task => renderTask(task, completedList, false));
    }
  }

  function renderTask(task, target = list, useStack = true) {
    const node = template.content.firstElementChild.cloneNode(true);
    if (useStack) node.classList.add('scroll-stack-card');
    const status = getStatus(task);
    const labels = { progress: '진행 중', urgent: '마감 임박', overdue: '기한 지남', done: '처리 완료', cancelled: '취소됨' };
    node.classList.add(status);
    if (newlyUrgent.has(task.id)) {
      node.classList.add('pulse');
      newlyUrgent.delete(task.id);
    }
    node.querySelector('.order-badge').textContent = `#${String(task.order).padStart(2, '0')}`;
    node.querySelector('.client-name').textContent = task.client;
    node.querySelector('.status-badge').textContent = labels[status];
    node.querySelector('.task-title').textContent = task.task;
    node.querySelector('.deadline-text').textContent = formatDeadline(task.deadline, status);
    const completeButton = node.querySelector('.complete-button');
    const taskActions = node.querySelector('.task-actions');
    if (status === 'done' || status === 'cancelled') {
      taskActions.classList.add('terminal-actions');
      taskActions.querySelector('.edit-button').remove();
      taskActions.querySelector('.cancel-button').remove();
      taskActions.querySelector('.complete-button').remove();
      if (status === 'cancelled') taskActions.querySelector('.follow-up-button').remove();
      const terminalTime = document.createElement('span');
      terminalTime.className = 'done-time';
      terminalTime.textContent = status === 'done'
        ? `${formatShort(task.completedAt)} 처리됨`
        : `${formatShort(task.cancelledAt)} 취소됨`;
      taskActions.prepend(terminalTime);
      const deleteButton = taskActions.querySelector('.delete-button');
      deleteButton.dataset.id = task.id;
      deleteButton.setAttribute('aria-label', `${task.task} 영구 삭제`);
      const followUpButton = taskActions.querySelector('.follow-up-button');
      if (followUpButton) {
        followUpButton.dataset.id = task.id;
        followUpButton.setAttribute('aria-label', `${task.client} 후속 업무 추가`);
      }
    } else {
      taskActions.querySelector('.follow-up-button').remove();
      taskActions.querySelectorAll('button').forEach((button) => { button.dataset.id = task.id; });
      completeButton.setAttribute('aria-label', `${task.task} 처리 완료`);
      node.querySelector('.edit-button').setAttribute('aria-label', `${task.task} 수정`);
      node.querySelector('.cancel-button').setAttribute('aria-label', `${task.task} 취소`);
    }
    target.append(node);
  }

  function formatDeadline(value, status) {
    const date = new Date(value);
    const formatted = new Intl.DateTimeFormat('ko-KR', {
      month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
    const diffMinutes = Math.ceil((date.getTime() - Date.now()) / 60000);
    if (status === 'overdue') return `${formatted} · ${Math.abs(diffMinutes)}분 지남`;
    if (status === 'urgent') return `${formatted} · ${diffMinutes}분 남음`;
    return formatted;
  }

  function formatShort(value) {
    return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }

  function setDefaultDeadline() {
    const input = document.querySelector('#deadline');
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setMinutes(Math.ceil(date.getMinutes() / 10) * 10, 0, 0);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    input.value = local;
  }

  function normalizeClient(client) {
    return String(client || '').trim().toLocaleLowerCase('ko-KR');
  }

  function getNextClientOrder(client, excludedId = null) {
    const clientKey = normalizeClient(client);
    const orders = tasks
      .filter((task) => task.id !== excludedId && normalizeClient(task.client) === clientKey)
      .map((task) => Number(task.order))
      .filter((order) => Number.isInteger(order) && order > 0);
    return orders.length ? Math.max(...orders) + 1 : 1;
  }

  function startEditing(task) {
    editingId = task.id;
    document.querySelector('#client').value = task.client;
    document.querySelector('#task').value = task.task;
    document.querySelector('#order').value = task.order;
    const date = new Date(task.deadline);
    document.querySelector('#deadline').value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.querySelector('#submit-label').textContent = '수정 완료';
    document.querySelector('.add-button span[aria-hidden="true"]').textContent = '✓';
    document.querySelector('#edit-cancel').hidden = false;
    clearErrors();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector('#client').focus({ preventScroll: true });
  }

  function startFollowUp(task) {
    resetForm();
    document.querySelector('#client').value = task.client;
    document.querySelector('#order').value = getNextClientOrder(task.client);
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector('#task').focus({ preventScroll: true });
  }

  function resetForm() {
    editingId = null;
    form.reset();
    clearErrors();
    setDefaultDeadline();
    document.querySelector('#submit-label').textContent = '업무 추가';
    document.querySelector('.add-button span[aria-hidden="true"]').textContent = '＋';
    document.querySelector('#edit-cancel').hidden = true;
  }

  function syncFilters() {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === activeFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function loadTasks(storageKey = accountStorageKey) {
    if (!storageKey) return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(parsed)
        ? parsed.map((task, index) => ({
            ...task,
            order: Number.isInteger(Number(task.order)) && Number(task.order) > 0 ? Number(task.order) : index + 1
          }))
        : [];
    } catch {
      return [];
    }
  }

  function saveTasks({ forceCloud = false, reportError = false } = {}) {
    const clean = tasks.map(({ _lastStatus, ...task }) => task);
    const storageKey = accountStorageKey || STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(clean));
    if (!window.taskCloud?.user) {
      if (reportError) return Promise.reject(new Error('서버 사용자를 확인할 수 없습니다.'));
      return Promise.resolve(false);
    }
    if (!window.taskCloud?.enabled) {
      if (reportError) return Promise.reject(new Error('Supabase 연결을 사용할 수 없습니다.'));
      return Promise.resolve(false);
    }
    if (!cloudReady && !forceCloud) return Promise.resolve(false);

    const request = cloudSaveQueue
      .catch(() => undefined)
      .then(() => window.taskCloud.replaceAll(clean));
    cloudSaveQueue = request;

    if (reportError) return request.then(() => true);
    return request.then(() => true).catch((error) => {
      console.warn('Supabase 동기화에 실패해 브라우저에 저장했습니다.', error);
      return false;
    });
  }

  async function hydrateFromCloud() {
    if (!window.taskCloud?.enabled) {
      accountStorageKey = STORAGE_KEY;
      tasks = loadTasks(accountStorageKey);
      render();
      cloudReady = true;
      return;
    }
    try {
      await window.taskCloud.ready;
      const user = window.taskCloud.user;
      if (!user) {
        accountStorageKey = STORAGE_KEY;
        tasks = loadTasks(accountStorageKey);
        render();
        return;
      }
      accountStorageKey = `${STORAGE_KEY}:${user.id}`;
      migrateLegacyTasksOnce(user.id);
      tasks = loadTasks(accountStorageKey);
      render();
      const remoteTasks = await window.taskCloud.load();
      if (remoteTasks?.length) {
        tasks = remoteTasks;
        localStorage.setItem(accountStorageKey, JSON.stringify(tasks));
        render();
      } else if (tasks.length) {
        await window.taskCloud.replaceAll(tasks);
      }
    } catch (error) {
      console.warn('Supabase 업무를 불러오지 못해 브라우저 데이터를 사용합니다.', error);
    } finally {
      cloudReady = true;
    }
  }

  function migrateLegacyTasksOnce(userId) {
    const migrationOwner = localStorage.getItem(STORAGE_MIGRATION_KEY);
    if (migrationOwner) return;
    localStorage.setItem(STORAGE_MIGRATION_KEY, userId);
    if (localStorage.getItem(accountStorageKey) !== null) return;
    const legacyTasks = localStorage.getItem(STORAGE_KEY);
    if (legacyTasks !== null) localStorage.setItem(accountStorageKey, legacyTasks);
  }

  function exportTasks() {
    const clean = tasks.map(({ _lastStatus, ...task }) => task);
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `마감선-업무-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importTasks(event) {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;

    let imported;
    try {
      imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) throw new Error('invalid');
      const valid = imported.every((task) => task && typeof task.client === 'string' && typeof task.task === 'string' && task.deadline);
      if (!valid) throw new Error('invalid');
    } catch {
      window.alert('올바른 마감선 업무 JSON 파일을 선택해 주세요.');
      return;
    }

    if (!window.confirm(`업무 ${imported.length}건을 가져올까요?\n현재 저장된 업무는 가져온 데이터로 교체됩니다.`)) return;

    const originalLabel = importButton.textContent;
    importButton.disabled = true;
    importButton.textContent = '서버에 저장 중…';

    try {
      await cloudHydrationPromise;
      tasks = imported.map((task, index) => ({
        ...task,
        id: createTaskId(),
        order: Number.isInteger(Number(task.order)) && Number(task.order) > 0 ? Number(task.order) : index + 1
      }));
      resetForm();
      render();
      await saveTasks({ forceCloud: true, reportError: true });
      window.alert(`업무 ${tasks.length}건을 가져와 서버에 저장했습니다.`);
    } catch (error) {
      console.warn('가져온 업무를 Supabase에 저장하지 못했습니다.', error);
      window.alert('업무는 이 브라우저에 저장했지만 서버 저장에 실패했습니다. 잠시 후 새로고침하고 다시 가져와 주세요.');
    } finally {
      importButton.disabled = false;
      importButton.textContent = originalLabel;
    }
  }

  function createTaskId() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  }
})();
