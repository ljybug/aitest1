const owner = 'ljybug';
const repo = 'aitest1';
const branch = 'main';
const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error('Missing GH_PAT or GITHUB_TOKEN');
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'openclaw-subagent'
};

async function gh(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

(async () => {
  const pagesInfo = await gh(`https://api.github.com/repos/${owner}/${repo}/pages`, {
    method: 'PUT',
    body: JSON.stringify({ source: { branch, path: '/' } })
  });
  console.log(JSON.stringify({
    repo_url: `https://github.com/${owner}/${repo}`,
    pages_url: pagesInfo?.html_url || `https://${owner}.github.io/${repo}/`,
    source: pagesInfo?.source || null
  }, null, 2));
})();
