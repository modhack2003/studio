/** @jest-environment node */
import type { PrismaClient } from '@prisma/client';
import { GitHubAPI, type GitHubRepository } from '../github';
import { syncGitHub, resolveGitHubUsername } from '../github-sync';
jest.mock('../github', () => {
  const actual = jest.requireActual('../github');
  return { ...actual, GitHubAPI: jest.fn() };
});
const api = { getUser: jest.fn(), getAllUserRepositories: jest.fn(), getReadme: jest.fn() };
const repos = { findMany: jest.fn(), update: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), count: jest.fn() };
const db = { gitHubRepository: repos } as unknown as PrismaClient;
const repo = { id: 1, name: 'repo', full_name: 'Owner/repo', description: null, private: false, archived: false, disabled: false, fork: false, created_at: '2024-01-01', updated_at: '2024-01-01', pushed_at: '2024-01-01' } as GitHubRepository;
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(GitHubAPI).mockImplementation(() => api as unknown as GitHubAPI);
  api.getUser.mockResolvedValue({ login: 'Owner' });
  api.getAllUserRepositories.mockResolvedValue([repo]);
  repos.deleteMany.mockResolvedValue({ count: 0 });
  repos.count.mockResolvedValue(1);
});
test('retains curated settings and cached README while limiting cleanup to the synced owner', async () => {
  repos.findMany.mockResolvedValue([{ id: 'stored', githubId: 1, fullName: repo.full_name, updatedAt: new Date(repo.updated_at), readmeCheckedAt: new Date(), readmeExcerpt: 'saved excerpt' }]);
  const result = await syncGitHub(db, { username: 'Owner', withProfile: false });
  expect(result.updated).toBe(1);
  expect(api.getReadme).not.toHaveBeenCalled();
  expect(repos.update.mock.calls[0][0].data).not.toHaveProperty('displayInPortfolio');
  expect(repos.update.mock.calls[0][0].data.readmeExcerpt).toBe('saved excerpt');
  expect(repos.deleteMany).toHaveBeenCalledWith({ where: { fullName: { startsWith: 'Owner/', mode: 'insensitive' }, githubId: { notIn: [1] } } });
});
test('preserves settings of a recreated repo and does not clean up after failed writes', async () => {
  repos.findMany.mockResolvedValue([{ id: 'stored', githubId: 99, fullName: repo.full_name, updatedAt: new Date(repo.updated_at), readmeCheckedAt: new Date(), readmeExcerpt: null }]);
  repos.update.mockRejectedValue(new Error('database failed'));
  const result = await syncGitHub(db, { username: 'Owner', withProfile: false });
  expect(repos.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'stored' } }));
  expect(result.errors).toHaveLength(1);
  expect(repos.deleteMany).not.toHaveBeenCalled();
});
test('invalid explicit usernames do not silently sync a different account', async () => {
  await expect(resolveGitHubUsername(db, 'https://evilgithub.com/owner')).rejects.toMatchObject({ status: 400 });
});
