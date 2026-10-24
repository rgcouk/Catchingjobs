import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MobileApplyBar } from '@/components/jobs/MobileApplyBar';

let notify: IntersectionObserverCallback;
const disconnect = vi.fn();
const viewport = new EventTarget();
const fixtures = () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<a id="job-primary-apply"></a><section id="job-application-panel"></section><footer></footer><input aria-label="Name" />',
  );
};
const intersect = (selector: string, visible: boolean, top = -100) => {
  act(() =>
    notify(
      [
        {
          target: document.querySelector(selector)!,
          isIntersecting: visible,
          boundingClientRect: { top },
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    ),
  );
};

beforeEach(() => {
  disconnect.mockClear();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  Object.defineProperty(viewport, 'height', { configurable: true, value: window.innerHeight });
  vi.stubGlobal('visualViewport', viewport);
  fixtures();
});
afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('Mobile application access', () => {
  it('appears after the hero action and hides while the form or footer is visible', () => {
    render(<MobileApplyBar jobId={1} location="Boston" pay="£15/hr" />);
    expect(screen.queryByRole('link', { name: 'Apply now' })).not.toBeInTheDocument();
    intersect('#job-primary-apply', false, 500);
    expect(screen.queryByRole('link', { name: 'Apply now' })).not.toBeInTheDocument();
    intersect('#job-primary-apply', false);
    expect(screen.getByRole('link', { name: 'Apply now' })).toHaveAttribute(
      'href',
      '#hero-triage-form',
    );
    intersect('#job-application-panel', true);
    expect(screen.queryByRole('link', { name: 'Apply now' })).not.toBeInTheDocument();
    intersect('#job-application-panel', false);
    expect(screen.getByRole('link', { name: 'Apply now' })).toBeInTheDocument();
    intersect('footer', true);
    expect(screen.queryByRole('link', { name: 'Apply now' })).not.toBeInTheDocument();
  });

  it('hides for form editing and keyboard viewport changes, and disconnects on navigation', () => {
    const { rerender, unmount } = render(
      <MobileApplyBar jobId={1} location="Boston" pay="£15/hr" />,
    );
    intersect('#job-primary-apply', false);
    act(() => screen.getByRole('textbox', { name: 'Name' }).focus());
    expect(screen.queryByRole('link', { name: 'Apply now' })).not.toBeInTheDocument();
    act(() => screen.getByRole('textbox', { name: 'Name' }).blur());
    expect(screen.getByRole('link', { name: 'Apply now' })).toBeInTheDocument();
    Object.defineProperty(viewport, 'height', {
      configurable: true,
      value: window.innerHeight - 300,
    });
    act(() => viewport.dispatchEvent(new Event('resize')));
    expect(screen.queryByRole('link', { name: 'Apply now' })).not.toBeInTheDocument();
    rerender(<MobileApplyBar jobId={2} location="Lincoln" pay="£16/hr" />);
    expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });
});
