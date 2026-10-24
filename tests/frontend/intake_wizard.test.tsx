import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IntakeWizard from '@/pages/wizard/IntakeWizard';

const mocks = vi.hoisted(() => ({ token: vi.fn(), fetch: vi.fn() }));
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ isLoaded: true, user: { id: 'fictional-worker', fullName: 'Alex Example' } }),
  useAuth: () => ({ getToken: mocks.token }),
}));

const details = {
  name: 'Alex Example',
  phone: '07700900123',
  email: 'alex@example.com',
  positionAppliedFor: 'Chicken catcher',
  vacancySource: 'Company website',
  dateOfBirth: '1995-06-12',
  niNumber: 'AB123456C',
  addressLine1: '1 Example Street',
  addressLine2: 'Flat 2',
  city: 'Boston',
  county: 'Lincolnshire',
  postcode: 'PE21 1AA',
  hasDrivingLicense: false,
  hasRightToWork: true,
  restrictionsOnWork: false,
};
const experience = {
  currentlyEmployed: false,
  poultryExperience: 'false',
  employmentHistory: [
    {
      employerName: 'Example Employer',
      employerAddress: '2 Example Road',
      position: 'Worker',
      from: '2020-01',
      to: '2026-10',
      hours: '40',
      reasonForLeaving: 'Career change',
    },
  ],
  education: [
    {
      provider: 'Example College',
      course: 'General studies',
      from: '2015-01',
      to: '2017-01',
      qualification: 'Certificate',
    },
  ],
  references: [1, 2].map((number) => ({
    name: `Referee ${number}`,
    title: 'Manager',
    company: 'Example Employer',
    address: '2 Example Road',
    phone: '07700900123',
    email: `referee${number}@example.com`,
  })),
};
const declarations = {
  abusedPosition: false,
  reasonableAdjustments: false,
  pendingCharges: false,
  hasConvictions: false,
  socialMediaConsent: true,
  socialMediaSignature: 'Alex Example',
  socialMediaSignedDate: '2026-10-23',
  declarationSigned: true,
  declarationSignature: 'Alex Example',
  declarationSignedDate: '2026-10-23',
  privacyPolicyConsent: true,
};
function field(name: string) {
  const element = document.querySelector<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >(`[name="${name}"]`);
  if (!element) throw new Error(`Missing onboarding field: ${name}`);
  return element;
}
function fill(values: Record<string, string>) {
  Object.entries(values).forEach(([name, value]) =>
    fireEvent.change(field(name), { target: { value } }),
  );
}
function submit() {
  fireEvent.submit(document.querySelector('form')!);
}
function payload() {
  return JSON.parse(mocks.fetch.mock.calls.at(-1)![1].body);
}
const tasks = [
  'Personal details & eligibility',
  'Work history & experience',
  'Education & training',
  'Employment references',
  'Recruitment checks',
  'Declarations & signatures',
];
const complete = { ...details, ...experience, ...declarations };
async function openTask(index: number) {
  fireEvent.click(screen.getByRole('button', { name: tasks[index] }));
  await screen.findByRole('heading', { name: tasks[index] });
}
async function saveSection() {
  fireEvent.click(screen.getByRole('button', { name: 'Save section' }));
  await screen.findByRole('button', { name: tasks[0] });
}
function setup(initialData: object = complete, props: Record<string, unknown> = {}) {
  return render(<IntakeWizard initialData={initialData} onSuccess={vi.fn()} {...props} />);
}

describe('Progressive employment application', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.token.mockResolvedValue('fictional-session-token');
    mocks.fetch.mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mocks.fetch);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('opens tasks independently and prevents submitting an incomplete application', async () => {
    setup({});
    expect(screen.getByRole('button', { name: 'Review and submit application' })).toBeDisabled();
    await openTask(3);
    expect(field('references.0.name')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Save section' }));
    await screen.findAllByRole('alert');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('saves only valid section data, returns to the hub and retains the complete Jotform shape', async () => {
    setup({
      ...complete,
      bankAccountNumber: '12345678',
      emergencyName: 'Old contact',
      isFitToLift: true,
      status: 'HIRED',
    });
    await openTask(0);
    fill({ addressLine1: '3 Example Street' });
    await saveSection();
    expect(payload()).toMatchObject({
      addressLine1: '3 Example Street',
      addressLine2: 'Flat 2',
      city: 'Boston',
      county: 'Lincolnshire',
      hasDrivingLicense: false,
      hasRightToWork: true,
    });
    ['bankAccountNumber', 'emergencyName', 'isFitToLift', 'status', 'hasForkliftLicense'].forEach(
      (name) => expect(payload()).not.toHaveProperty(name),
    );
    await openTask(0);
    expect(field('addressLine1')).toHaveValue('3 Example Street');
  });

  it('saves a partial section and returns later without fabricating unanswered answers', async () => {
    const onDraftSaved = vi.fn(),
      onClose = vi.fn();
    setup({}, { onDraftSaved, onClose });
    await openTask(0);
    fill({ addressLine1: '4 Example Street' });
    fireEvent.click(screen.getByRole('button', { name: 'Save and return later' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onDraftSaved).toHaveBeenCalledTimes(1);
    expect(payload()).toMatchObject({ addressLine1: '4 Example Street' });
    ['hasDrivingLicense', 'restrictionsOnWork', 'pendingCharges', 'hasConvictions'].forEach(
      (name) => expect(payload()).not.toHaveProperty(name),
    );
  });

  it('retains edits after save failure and only closes after the retry succeeds', async () => {
    const onClose = vi.fn(),
      onDraftSaved = vi.fn();
    mocks.fetch.mockResolvedValueOnce({ ok: false });
    setup({}, { onClose, onDraftSaved });
    await openTask(0);
    fill({ addressLine1: '5 Example Street' });
    fireEvent.click(screen.getByRole('button', { name: 'Save and return later' }));
    await screen.findAllByRole('alert');
    expect(field('addressLine1')).toHaveValue('5 Example Street');
    expect(onClose).not.toHaveBeenCalled();
    expect(onDraftSaved).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save and return later' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('does not save without a session token', async () => {
    mocks.token.mockResolvedValueOnce(null);
    setup();
    await openTask(0);
    fireEvent.click(screen.getByRole('button', { name: 'Save section' }));
    await screen.findAllByRole('alert');
    expect(mocks.fetch).not.toHaveBeenCalled();
    await saveSection();
  });

  it('locks duplicate section requests', async () => {
    let resolve!: (value: { ok: boolean }) => void;
    mocks.fetch.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    setup();
    await openTask(0);
    submit();
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
    submit();
    submit();
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ ok: true }));
    await screen.findByRole('button', { name: tasks[0] });
  });

  it('requires explicit save of an empty optional education section', async () => {
    setup({ ...complete, education: undefined });
    expect(screen.getByRole('button', { name: 'Review and submit application' })).toBeDisabled();
    await openTask(2);
    const remove = screen.queryByRole('button', { name: /Remove education.*entry 1/i });
    if (remove) fireEvent.click(remove);
    await saveSection();
    expect(payload().education).toEqual([]);
    expect(screen.getByRole('button', { name: 'Review and submit application' })).toBeEnabled();
  });

  it('validates five-year history gaps and preserves other entries when adding and removing', async () => {
    setup({
      ...complete,
      employmentHistory: [
        { ...experience.employmentHistory[0], to: '2022-01' },
        { ...experience.employmentHistory[0], from: '2023-01' },
      ],
    });
    await openTask(1);
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Cover the last five years without gaps/,
    );
    expect(mocks.fetch).not.toHaveBeenCalled();
    if (!document.querySelector('[name="employmentHistory.1.from"]'))
      fireEvent.click(screen.getByRole('button', { name: /Edit entry/ }));
    fill({ 'employmentHistory.1.from': '2022-01' });
    fireEvent.click(screen.getByRole('button', { name: 'Add history entry' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove employment and unemployment history entry 3' }),
    );
    await saveSection();
    expect(payload().employmentHistory).toHaveLength(2);
  });

  it('maps current employment and unemployment controls onto the existing history fields', async () => {
    setup();
    await openTask(1);
    fireEvent.change(screen.getByLabelText('Type of history entry'), {
      target: { value: 'unemployed' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'This is my current role or unemployment period' }),
    );
    expect(document.querySelector('[name="employmentHistory.0.to"]')).toBeNull();
    await saveSection();
    expect(payload().employmentHistory[0]).toMatchObject({
      employerName: 'Unemployed',
      employerAddress: 'Not applicable',
      position: 'Not applicable',
      hours: 'Not applicable',
      to: 'Current',
    });
    expect(payload().employmentHistory[0]).not.toHaveProperty('isCurrent');
    expect(payload().employmentHistory[0]).not.toHaveProperty('type');
  });

  it('resumes saved task statuses and does not count failed dirty edits as saved', async () => {
    setup();
    expect(screen.getByText('6 of 6 sections saved and complete')).toBeInTheDocument();
    await openTask(0);
    fill({ addressLine1: 'Unpersisted address' });
    mocks.fetch.mockResolvedValueOnce({ ok: false });
    submit();
    await screen.findAllByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Back to sections' }));
    await openTask(0);
    expect(field('addressLine1')).toHaveValue(details.addressLine1);
  });

  it('requires two complete referees', async () => {
    setup({ ...complete, references: [experience.references[0], { name: 'Incomplete' }] });
    await openTask(3);
    submit();
    await screen.findAllByRole('alert');
    expect(mocks.fetch).not.toHaveBeenCalled();
    fill(
      Object.fromEntries(
        Object.entries(experience.references[1]).map(([key, value]) => [
          `references.1.${key}`,
          value,
        ]),
      ),
    );
    await saveSection();
    expect(payload().references).toEqual(experience.references);
  });

  it('keeps affirmative recruitment details and the victim-oriented authority question', async () => {
    setup({
      ...complete,
      abusedPosition: true,
      abusedPositionDetail: 'Fictional account of being asked to pay for work',
      pendingCharges: true,
      pendingChargesDetail: 'Fictional case',
      hasConvictions: true,
      convictionHistory: [
        {
          sentencingDate: '2024-01-10',
          court: 'Example court',
          offence: 'Fictional offence',
          sentence: 'Fictional sentence',
        },
      ],
    });
    await openTask(4);
    expect(
      screen.getByRole('group', {
        name: /Has anyone in a position of authority over you ever abused their position for personal gain/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Details of what happened to you')).toHaveValue(
      'Fictional account of being asked to pay for work',
    );
    await saveSection();
    expect(payload()).toMatchObject({
      abusedPosition: true,
      pendingCharges: true,
      hasConvictions: true,
    });
  });

  it('captures drawn strokes independently, rejects a click alone, and clears only the chosen pad', async () => {
    class TestPointerEvent extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }
    vi.stubGlobal('PointerEvent', TestPointerEvent);
    setup({ ...complete, socialMediaSignature: '', declarationSignature: '' });
    await openTask(5);
    const social = screen.getByRole('img', { name: /Draw social media notice signature/i });
    const declaration = screen.getByRole('img', {
      name: /Draw application declaration signature/i,
    });
    for (const pad of [social, declaration]) {
      vi.spyOn(pad, 'getBoundingClientRect').mockReturnValue({
        left: 10,
        top: 20,
        width: 300,
        height: 80,
        right: 310,
        bottom: 100,
        x: 10,
        y: 20,
        toJSON: () => ({}),
      });
      Object.defineProperty(pad, 'setPointerCapture', { configurable: true, value: vi.fn() });
    }
    const stroke = (pad: HTMLElement, x: number) => {
      fireEvent.pointerDown(pad, { pointerId: 1, clientX: x, clientY: 30 });
      fireEvent.pointerMove(pad, { pointerId: 1, clientX: x + 30, clientY: 60 });
      fireEvent.pointerUp(pad, { pointerId: 1, clientX: x + 30, clientY: 60 });
    };
    fireEvent.pointerDown(social, { pointerId: 1, clientX: 20, clientY: 30 });
    fireEvent.pointerUp(social, { pointerId: 1, clientX: 20, clientY: 30 });
    submit();
    await screen.findAllByRole('alert');
    expect(mocks.fetch).toHaveBeenCalledTimes(0);
    stroke(social, 30);
    expect(declaration.querySelector('path')).toBeNull();
    submit();
    await screen.findAllByRole('alert');
    expect(mocks.fetch).toHaveBeenCalledTimes(0);
    stroke(declaration, 60);
    const declarationPath = declaration.querySelector('path')!.getAttribute('d');
    fireEvent.click(screen.getByRole('button', { name: 'Clear social media notice signature' }));
    expect(social.querySelector('path')).toBeNull();
    expect(declaration.querySelector('path')).toHaveAttribute('d', declarationPath);
    submit();
    await screen.findAllByRole('alert');
    expect(mocks.fetch).toHaveBeenCalledTimes(0);
    stroke(social, 90);
    submit();
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
    const saved = payload();
    for (const key of ['socialMediaSignature', 'declarationSignature']) {
      expect(saved[key]).toMatch(/^data:image\/svg\+xml,/);
      const svg = decodeURIComponent(saved[key].split(',').slice(1).join(','));
      expect(svg).toContain('<path d="M');
      expect(svg).toContain(' L');
      expect(svg).not.toMatch(/NaN|Infinity/);
    }
    expect(saved.socialMediaSignature).not.toBe(saved.declarationSignature);
  });

  it('records independent typed signatures and notice versions', async () => {
    setup({ ...complete, socialMediaSignature: '', declarationSignature: '' });
    await openTask(5);
    submit();
    await screen.findAllByRole('alert');
    expect(mocks.fetch).not.toHaveBeenCalled();
    screen
      .getAllByRole('button', { name: 'Use typed signature instead' })
      .forEach((button) => fireEvent.click(button));
    fill({
      socialMediaSignature: 'Alex Screening',
      declarationSignature: 'Alex Declaration',
      socialMediaSignedDate: '2026-10-22',
      declarationSignedDate: '2026-10-23',
    });
    expect(screen.getByRole('link', { name: 'Read the privacy policy (PDF)' })).toHaveAttribute(
      'href',
      '/privacy/pullum-privacy-policy-v2-april-2026.pdf',
    );
    await saveSection();
    expect(payload()).toMatchObject({
      socialMediaSignature: 'Alex Screening',
      declarationSignature: 'Alex Declaration',
      socialMediaSignedDate: '2026-10-22',
      declarationSignedDate: '2026-10-23',
      applicationFormVersion: 'jotform-v1',
      privacyNoticeVersion: 'Pullum Privacy Policy V2 April 2026',
    });
  });

  it('awaits final completion and allows retry after failure without duplicate submission', async () => {
    let reject!: (reason: Error) => void;
    const onSuccess = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, fail) => {
            reject = fail;
          }),
      )
      .mockResolvedValueOnce(undefined);
    setup(complete, { onSuccess });
    fireEvent.click(screen.getByRole('button', { name: 'Review and submit application' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    submit();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error('Completion unavailable')));
    await screen.findAllByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2));
    submit();
    expect(onSuccess).toHaveBeenCalledTimes(2);
    expect(onSuccess.mock.calls[1][0]).toMatchObject({
      employmentHistory: experience.employmentHistory,
      references: experience.references,
      declarationSigned: true,
      hasConvictions: false,
    });
  });
});
