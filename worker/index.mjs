const dispatch = (env) =>
  fetch(`https://api.github.com/repos/${env.REPO}/actions/workflows/update.yml/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_PAT}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cat-banner-trigger',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

const dispatchWithRetry = async (env) => {
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      last = await dispatch(env);
      if (last.status === 204) return;
    } catch (err) {
      last = err;
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  // 丟出例外才會在 Cloudflare 的 Cron 事件紀錄顯示失敗，PAT 過期才看得到
  throw new Error(`workflow_dispatch failed: ${last?.status ?? last}`);
};

export default {
  scheduled: (_event, env, ctx) => ctx.waitUntil(dispatchWithRetry(env)),
};
