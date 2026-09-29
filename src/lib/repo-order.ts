/** Pinned repos (displayOrder set) first by pin number, then everything else by latest push. */
export function sortRepos<T extends { displayOrder: number | null; pushedAt: Date | string }>(repos: T[]): T[] {
  return [...repos].sort((a, b) => {
    const ap = a.displayOrder ?? null;
    const bp = b.displayOrder ?? null;
    if (ap !== null && bp !== null && ap !== bp) return ap - bp;
    if (ap !== null && bp === null) return -1;
    if (ap === null && bp !== null) return 1;
    return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
  });
}
