import { act, render } from '@testing-library/react';
import { Marquee } from '../primitives';

test('maintains a steady pixel speed as the strip grows and disconnects its observer', () => {
  let measure: () => void = () => {};
  const disconnect = jest.fn();
  const original = global.ResizeObserver;
  global.ResizeObserver = jest.fn().mockImplementation((callback) => {
    measure = callback;
    return { observe: jest.fn(), disconnect };
  });
  const width = jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(960);
  try {
    const view = render(<Marquee items={['Python', 'Nmap']} pixelsPerSecond={24} />);
    const track = view.container.querySelector('.marquee-track') as HTMLElement;
    expect(track.style.animationDuration).toBe('20s');
    width.mockReturnValue(1920);
    act(() => measure());
    expect(track.style.animationDuration).toBe('40s');
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  } finally {
    width.mockRestore();
    global.ResizeObserver = original;
  }
});
