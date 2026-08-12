(() => {
  'use strict';

  const config = window.MAGAMSEON_SUPABASE || {};
  const enabled = Boolean(config.url && config.publishableKey && window.supabase?.createClient);
  const client = enabled
    ? window.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;
  const appShell = document.querySelector('#app-shell');
  const accountDialog = document.querySelector('#account-dialog');
  const accountForm = document.querySelector('#account-form');
  const emailInput = document.querySelector('#account-email');
  const accountStatus = document.querySelector('#account-status');
  const accountSubmit = document.querySelector('#account-submit');
  const linkModeButton = document.querySelector('#account-mode-link');
  const signInModeButton = document.querySelector('#account-mode-signin');
  const accountHelp = document.querySelector('#account-help');
  const accountLabel = document.querySelector('#account-label');
  const connectButton = document.querySelector('#connect-device');
  const logoutButton = document.querySelector('#logout-button');
  let accountMode = 'link';
  let currentTaskCount = 0;
  let currentUser = null;
  let resolveAuthReady;
  const authReady = new Promise((resolve) => { resolveAuthReady = resolve; });

  function isAnonymous(user) {
    return Boolean(user?.is_anonymous);
  }

  function isNetworkError(error) {
    const text = `${error?.name || ''} ${error?.message || ''}`.toLowerCase();
    return error instanceof TypeError || /fetch|network|offline|connection|failed to fetch/.test(text);
  }

  function safeAuthError(error) {
    if (isNetworkError(error)) {
      return '인터넷 연결을 확인한 뒤 다시 시도해 주세요.';
    }
    const message = String(error?.message || '').toLowerCase();
    if (/rate limit|too many/.test(message)) return '인증 메일을 너무 자주 요청했어요. 잠시 후 다시 시도해 주세요.';
    if (/already registered|already been registered/.test(message)) return '이미 연결된 이메일입니다. ‘업무 불러오기’를 선택해 주세요.';
    if (/signups not allowed|user not found/.test(message)) return '먼저 업무가 있는 PC에서 이 이메일을 연결해 주세요.';
    return '인증 메일을 보내지 못했습니다. 이메일을 확인하고 다시 시도해 주세요.';
  }

  function setStatus(message = '', state = '') {
    if (!accountStatus) return;
    accountStatus.textContent = message;
    accountStatus.dataset.state = state;
  }

  function updateAuthView(user, { announce = true } = {}) {
    currentUser = user || null;
    if (appShell) appShell.hidden = false;

    const connected = Boolean(currentUser && !isAnonymous(currentUser));
    if (accountLabel) accountLabel.textContent = connected ? currentUser.email : '브라우저 전용';
    if (connectButton) {
      connectButton.hidden = connected;
      connectButton.textContent = currentTaskCount ? '기기 연결' : '이메일로 불러오기';
    }
    if (logoutButton) logoutButton.hidden = !connected;

    if (announce) {
      window.dispatchEvent(new CustomEvent('taskcloud:authchange', { detail: currentUser }));
    }
  }

  function setMode(mode) {
    accountMode = mode === 'signin' ? 'signin' : 'link';
    const signingIn = accountMode === 'signin';
    linkModeButton?.setAttribute('aria-pressed', String(!signingIn));
    signInModeButton?.setAttribute('aria-pressed', String(signingIn));
    if (accountHelp) {
      accountHelp.textContent = signingIn
        ? '다른 기기에서 연결한 이메일로 저장된 업무를 불러옵니다.'
        : '이 브라우저의 현재 업무를 이메일에 연결합니다. 업무가 있는 PC에서 먼저 진행하세요.';
    }
    if (accountSubmit) accountSubmit.textContent = signingIn ? '업무 불러오기 메일 보내기' : '현재 업무 연결 메일 보내기';
    setStatus();
  }

  async function ensureUser() {
    if (!client) return null;
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (sessionData.session?.user) return sessionData.session.user;
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }

  async function requireUser() {
    if (!client) throw new Error('Supabase 연결을 사용할 수 없습니다.');
    if (currentUser) return currentUser;
    const user = await ensureUser();
    if (!user) throw new Error('사용자를 확인할 수 없습니다.');
    currentUser = user;
    return user;
  }

  function toRow(task, userId) {
    return {
      id: String(task.id),
      user_id: userId,
      client: task.client,
      task: task.task,
      task_order: Number(task.order),
      deadline: new Date(task.deadline).toISOString(),
      created_at: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
      completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
      cancelled_at: task.cancelledAt ? new Date(task.cancelledAt).toISOString() : null,
      updated_at: new Date().toISOString()
    };
  }

  function fromRow(row) {
    return {
      id: row.id,
      client: row.client,
      task: row.task,
      order: row.task_order,
      deadline: row.deadline,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      cancelledAt: row.cancelled_at
    };
  }

  connectButton?.addEventListener('click', () => {
    const defaultMode = currentTaskCount > 0 && isAnonymous(currentUser) ? 'link' : 'signin';
    setMode(defaultMode);
    if (accountDialog?.showModal) accountDialog.showModal();
    else accountDialog?.setAttribute('open', '');
    window.setTimeout(() => emailInput?.focus(), 0);
  });
  linkModeButton?.addEventListener('click', () => setMode('link'));
  signInModeButton?.addEventListener('click', () => setMode('signin'));
  accountDialog?.addEventListener('close', () => setStatus());

  accountForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim() || '';
    if (!email || !emailInput.checkValidity()) {
      emailInput?.setAttribute('aria-invalid', 'true');
      setStatus('올바른 이메일 주소를 입력해 주세요.', 'error');
      emailInput?.focus();
      return;
    }
    emailInput.removeAttribute('aria-invalid');
    if (!client) {
      setStatus('서버 설정을 확인할 수 없습니다.', 'error');
      return;
    }

    accountSubmit.disabled = true;
    setStatus('인증 메일을 보내고 있어요…');
    try {
      if (accountMode === 'link') {
        const user = await requireUser();
        if (!isAnonymous(user)) throw new Error('already registered');
        const { error } = await client.auth.updateUser({ email });
        if (error) throw error;
        setStatus('메일의 링크를 누르면 현재 업무가 이메일에 연결됩니다.', 'success');
      } else {
        const { error } = await client.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: config.authRedirectUrl || window.location.origin
          }
        });
        if (error) throw error;
        setStatus('메일의 링크를 누르면 이 기기에서 같은 업무가 열립니다.', 'success');
      }
    } catch (error) {
      console.warn('Supabase 이메일 인증에 실패했습니다.', error);
      setStatus(safeAuthError(error), 'error');
    } finally {
      accountSubmit.disabled = false;
    }
  });

  logoutButton?.addEventListener('click', async () => {
    if (!client || !window.confirm('이 기기에서 로그아웃할까요? 서버의 업무는 삭제되지 않습니다.')) return;
    logoutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.warn('Supabase 로그아웃에 실패했습니다.', error);
      window.alert(isNetworkError(error)
        ? '인터넷 연결을 확인한 뒤 다시 시도해 주세요.'
        : '로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      logoutButton.disabled = false;
    }
  });

  if (client) {
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => updateAuthView(session?.user || null), 0);
    });
    ensureUser()
      .then((user) => {
        updateAuthView(user);
        resolveAuthReady(user);
      })
      .catch((error) => {
        console.warn('Supabase 세션을 준비하지 못했습니다.', error);
        updateAuthView(null);
        resolveAuthReady(null);
      });
  } else {
    updateAuthView(null, { announce: false });
    resolveAuthReady(null);
  }

  window.taskCloud = {
    enabled,
    ready: authReady,
    get user() { return currentUser; },
    setTaskCount(count) {
      currentTaskCount = Number.isFinite(Number(count)) ? Number(count) : 0;
      updateAuthView(currentUser, { announce: false });
    },
    async load() {
      const user = await requireUser();
      const { data, error } = await client.from('tasks').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data.map(fromRow);
    },
    async replaceAll(tasks) {
      const user = await requireUser();
      const rows = tasks.map((task) => toRow(task, user.id));
      if (rows.length) {
        const { error } = await client.from('tasks').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
      }
      const { data: existing, error: readError } = await client.from('tasks').select('id').eq('user_id', user.id);
      if (readError) throw readError;
      const currentIds = new Set(rows.map((row) => row.id));
      const staleIds = existing.map((row) => row.id).filter((id) => !currentIds.has(id));
      if (staleIds.length) {
        const { error: deleteError } = await client.from('tasks').delete().eq('user_id', user.id).in('id', staleIds);
        if (deleteError) throw deleteError;
      }
    }
  };
})();
