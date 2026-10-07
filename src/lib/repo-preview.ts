export const INITIAL_REPOS = 5;

/** Every pinned repo plus five recent unpinned repos; callers supply sorted data. */
export function selectRepoPreview<T extends { displayOrder: number | null }>(repos: T[]): T[] {
  let recent = 0;
  return repos.filter((repo) => repo.displayOrder !== null || recent++ < INITIAL_REPOS);
}
