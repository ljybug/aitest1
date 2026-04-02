import fsP from 'node:fs/promises';
import fs from 'node:fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const token = process.env.GH_PAT;
if (!token) throw new Error('GH_PAT missing');

const owner = 'ljybug';
const repo = 'aitest1';
const dir = process.cwd();

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  if (res.status === 404) return { status: 404, data: null };
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return { status: res.status, data };
}

async function ensureRepo() {
  const check = await gh(`/repos/${owner}/${repo}`);
  if (check.status === 404) {
    await gh('/user/repos', {
      method: 'POST',
      body: JSON.stringify({ name: repo, private: false })
    });
  }
}

async function ensureBranchAndPush() {
  try { await fsP.rm('.git', { recursive: true, force: true }); } catch {}
  await git.init({ fs, dir, defaultBranch: 'main' });
  await git.add({ fs, dir, filepath: '.' });
  await git.commit({
    fs,
    dir,
    author: { name: 'yunweixia-bot', email: 'bot@example.com' },
    message: 'Initial commit: project deployment'
  });
  await git.addRemote({ fs, dir, remote: 'origin', url: `https://github.com/${owner}/${repo}.git`, force: true });
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: 'x-access-token', password: token })
  });
}

async function enablePages() {
  try {
    await gh(`/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      body: JSON.stringify({ source: { branch: 'main', path: '/' } })
    });
  } catch (e) {
    // maybe already enabled
  }
}

await ensureRepo();
await ensureBranchAndPush();
await enablePages();
const pages = await gh(`/repos/${owner}/${repo}/pages`);
console.log(JSON.stringify({
  repoUrl: `https://github.com/${owner}/${repo}`,
  pagesUrl: pages?.data?.html_url || `https://${owner}.github.io/${repo}/`
}, null, 2));
