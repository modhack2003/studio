import { selectRepoPreview } from '../repo-preview';
test('keeps every pinned repo plus five recent unpinned repos', () => {
  const pins = Array.from({ length: 7 }, (_, displayOrder) => ({ id: `pin-${displayOrder}`, displayOrder }));
  const recent = Array.from({ length: 8 }, (_, i) => ({ id: `repo-${i}`, displayOrder: null }));
  expect(selectRepoPreview([...pins, ...recent])).toEqual([...pins, ...recent.slice(0, 5)]);
  expect(selectRepoPreview(recent)).toEqual(recent.slice(0, 5));
});
