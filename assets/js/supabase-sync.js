(() => {
  'use strict';

  const config = window.MAGAMSEON_SUPABASE || {};
  const enabled = Boolean(config.url && config.publishableKey && window.supabase?.createClient);
  const client = enabled
    ? window.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      })
    : null;

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

  async function getUser() {
    if (!client) return null;
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData.session?.user) return sessionData.session.user;
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }

  window.taskCloud = {
    enabled,
    async load() {
      if (!client) return null;
      const user = await getUser();
      const { data, error } = await client.from('tasks').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data.map(fromRow);
    },
    async replaceAll(tasks) {
      if (!client) return;
      const user = await getUser();
      const rows = tasks.map((task) => toRow(task, user.id));
      if (rows.length) {
        const { error } = await client.from('tasks').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
      }
      const { data: existing, error: readError } = await client
        .from('tasks').select('id').eq('user_id', user.id);
      if (readError) throw readError;
      const currentIds = new Set(rows.map((row) => row.id));
      const staleIds = existing.map((row) => row.id).filter((id) => !currentIds.has(id));
      if (staleIds.length) {
        const { error: deleteError } = await client
          .from('tasks').delete().eq('user_id', user.id).in('id', staleIds);
        if (deleteError) throw deleteError;
      }
    }
  };
})();
