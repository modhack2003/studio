/** @jest-environment node */
import { GitHubAPI, parseGitHubUsername } from '../github';

beforeEach(() => { global.fetch = jest.fn(); });
test('accepts usernames and GitHub profile URLs without accepting lookalike hosts', () => {
  expect(parseGitHubUsername('https://github.com/modhack2003/')).toBe('modhack2003');
  expect(parseGitHubUsername('modhack2003')).toBe('modhack2003');
  for (const value of ['https://evilgithub.com/user', 'https://github.com.evil.test/user', 'https://evil.test/github.com/user', '-user', 'user-', 'user--name']) expect(parseGitHubUsername(value)).toBeNull();
});
test('paginates all repos and refuses silent truncation', async () => {
  const fetch = jest.mocked(global.fetch);
  fetch.mockResolvedValueOnce(new Response(JSON.stringify(Array.from({ length: 100 }, (_, id) => ({ id }))))).mockResolvedValueOnce(new Response(JSON.stringify([{ id: 100 }])));
  expect(await new GitHubAPI().getAllUserRepositories('owner')).toHaveLength(101);
  fetch.mockReset().mockImplementation(async () => new Response(JSON.stringify(Array.from({ length: 100 }, (_, id) => ({ id })))));
  await expect(new GitHubAPI().getAllUserRepositories('owner')).rejects.toMatchObject({ status: 422 });
  expect(fetch).toHaveBeenCalledTimes(20);
});
test('fetches the canonical README once and handles an absent README', async () => {
  const fetch = jest.mocked(global.fetch);
  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ encoding: 'base64', content: Buffer.from('README content').toString('base64') })));
  expect(await new GitHubAPI('token').getReadme('owner/repo')).toBe('README content');
  expect(fetch).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/readme', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) }));
  fetch.mockResolvedValueOnce(new Response('', { status: 404 }));
  expect(await new GitHubAPI().getReadme('owner/repo')).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(2);
});
