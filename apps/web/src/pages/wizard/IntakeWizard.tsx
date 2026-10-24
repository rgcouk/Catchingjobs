/** @license SPDX-License-Identifier: Apache-2.0 */
import { useEffect, useRef, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { hasFiveYearEmploymentCoverage } from '@catchingjobs/shared/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, ShieldCheck, Trash2 } from 'lucide-react';

type Row = Record<string, string>;
type Value = string | boolean | Row[];
type Values = Record<string, Value>;
interface IntakeWizardProps {
  sectorId?: string;
  initialData?: object;
  onSuccess: (data: Values) => Promise<void> | void;
  onClose?: () => void;
  onDraftSaved?: (data: Values) => Promise<void> | void;
}
const titles = [
  'Personal details & eligibility',
  'Work history & experience',
  'Education & training',
  'Employment references',
  'Recruitment checks',
  'Declarations & signatures',
];
const groups = [
  [
    'positionAppliedFor',
    'vacancySource',
    'name',
    'phone',
    'dateOfBirth',
    'niNumber',
    'addressLine1',
    'addressLine2',
    'city',
    'county',
    'postcode',
    'hasDrivingLicense',
    'hasRightToWork',
    'restrictionsOnWork',
    'restrictionsDetail',
  ],
  [
    'currentlyEmployed',
    'noticePeriod',
    'poultryExperience',
    'poultryExperienceDetails',
    'employmentHistory',
  ],
  ['education'],
  ['references'],
  [
    'abusedPosition',
    'abusedPositionDetail',
    'reasonableAdjustments',
    'adjustmentsDetail',
    'pendingCharges',
    'pendingChargesDetail',
    'hasConvictions',
    'convictionHistory',
  ],
  [
    'socialMediaConsent',
    'socialMediaSignature',
    'socialMediaSignedDate',
    'declarationSigned',
    'declarationSignature',
    'declarationSignedDate',
  ],
];
const conditionals: Record<string, string> = {
  restrictionsOnWork: 'restrictionsDetail',
  currentlyEmployed: 'noticePeriod',
  poultryExperience: 'poultryExperienceDetails',
  abusedPosition: 'abusedPositionDetail',
  reasonableAdjustments: 'adjustmentsDetail',
  pendingCharges: 'pendingChargesDetail',
};
const booleanFields = [
  'hasDrivingLicense',
  'hasRightToWork',
  'restrictionsOnWork',
  'currentlyEmployed',
  'abusedPosition',
  'reasonableAdjustments',
  'pendingCharges',
  'hasConvictions',
];
const arrays: Record<string, string[]> = {
  employmentHistory: [
    'employerName',
    'employerAddress',
    'position',
    'from',
    'to',
    'hours',
    'reasonForLeaving',
  ],
  education: ['provider', 'course', 'from', 'to', 'qualification'],
  references: ['name', 'title', 'company', 'address', 'phone', 'email'],
  convictionHistory: ['sentencingDate', 'court', 'offence', 'sentence'],
};
const rowLabels: Record<string, string> = {
  employerName: 'Employer name or unemployment',
  employerAddress: 'Employer address',
  position: 'Position held',
  from: 'From',
  to: 'To',
  hours: 'Hours worked',
  reasonForLeaving: 'Reason for leaving or unemployment details',
  provider: 'School, college or training provider',
  course: 'Course or training',
  qualification: 'Qualification gained',
  name: 'Referee name',
  title: 'Referee job title',
  company: 'Company',
  address: 'Company address',
  phone: 'Referee phone',
  email: 'Referee email',
  sentencingDate: 'Sentencing date',
  court: 'Court',
  offence: 'Offence',
  sentence: 'Sentence',
};
const blankRow = (key: string): Row => Object.fromEntries(arrays[key].map((name) => [name, '']));
const yes = (v: Value | undefined) => v === true || v === 'true';
function defaults(data: object = {}): Values {
  const incoming = data as Record<string, unknown>;
  const result: Values = {};
  for (const key of groups.flat()) {
    const value = incoming[key];
    result[key] = arrays[key]
      ? Array.isArray(value)
        ? value.map((row) =>
            Object.fromEntries(
              arrays[key].map((field) => [
                field,
                typeof row?.[field] === 'string' ? row[field] : '',
              ]),
            ),
          )
        : key === 'references'
          ? [blankRow(key), blankRow(key)]
          : key === 'convictionHistory'
            ? []
            : key === 'education'
              ? []
              : [blankRow(key)]
      : booleanFields.includes(key) || key === 'poultryExperience'
        ? value === true || value === 'true'
          ? 'true'
          : value === false || value === 'false'
            ? 'false'
            : ''
        : key === 'socialMediaConsent' || key === 'declarationSigned'
          ? yes(value as Value)
          : typeof value === 'string'
            ? value
            : '';
  }
  const job = incoming.jobPosting as { title?: unknown } | undefined;
  if (!result.positionAppliedFor && typeof job?.title === 'string')
    result.positionAppliedFor = job.title;
  if (!result.city && typeof incoming.town === 'string') result.city = incoming.town;
  result.references = [...(result.references as Row[]).slice(0, 2)];
  while ((result.references as Row[]).length < 2)
    (result.references as Row[]).push(blankRow('references'));
  result.dateOfBirth = String(result.dateOfBirth).slice(0, 10);
  return result;
}
function Signature({
  name,
  label,
  value,
  onChange,
  disabled,
}: {
  disabled?: boolean;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [typed, setTyped] = useState(!value.startsWith('data:image/svg+xml') && Boolean(value));
  const [paths, setPaths] = useState<string[]>([]);
  const drawing = useRef(false);
  const strokes = useRef<string[]>([]);
  const point = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return `${(((event.clientX - box.left) / box.width) * 600).toFixed(1)},${(((event.clientY - box.top) / box.height) * 160).toFixed(1)}`;
  };
  const commit = () => {
    drawing.current = false;
    if (disabled) return;
    if (strokes.current.some((path) => path.includes(' L')))
      onChange(
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160">${strokes.current.map((d) => `<path d="${d}" fill="none" stroke="#090D14" stroke-width="2.5" stroke-linecap="round"/>`).join('')}</svg>`)}`,
      );
  };
  return (
    <div className="space-y-3">
      <Label htmlFor={name}>{label}</Label>
      {typed ? (
        <Input
          id={name}
          name={name}
          value={value.startsWith('data:') ? '' : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your full name"
          className="min-h-12 text-base"
        />
      ) : (
        <>
          <svg
            id={name}
            role="img"
            tabIndex={0}
            aria-label={`Draw ${label.toLowerCase()} with a pointer, or use the typed signature option below`}
            viewBox="0 0 600 160"
            className="w-full touch-none rounded-md border border-slate-300 bg-white"
            onPointerDown={(event) => {
              if (disabled || strokes.current.join('').length > 100000) return;
              drawing.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              strokes.current = [...strokes.current, `M${point(event)}`];
              setPaths([...strokes.current]);
            }}
            onPointerMove={(event) => {
              if (disabled || !drawing.current || strokes.current.join('').length > 100000) return;
              strokes.current[strokes.current.length - 1] += ` L${point(event)}`;
              setPaths([...strokes.current]);
            }}
            onPointerUp={commit}
            onPointerCancel={commit}
          >
            {paths.map((d, index) => (
              <path
                key={index}
                d={d}
                fill="none"
                stroke="#090D14"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
          {value.startsWith('data:') && !paths.length && (
            <p className="text-sm text-slate-600">A drawn signature has been saved.</p>
          )}
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            strokes.current = [];
            setPaths([]);
            onChange('');
          }}
        >
          Clear {label.toLowerCase()}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setTyped(!typed);
            strokes.current = [];
            setPaths([]);
            onChange('');
          }}
        >
          {typed ? 'Draw signature' : 'Use typed signature instead'}
        </Button>
      </div>
      <p className="text-xs text-slate-600">
        {typed
          ? 'Your full name will be recorded as a typed signature.'
          : 'Draw your signature in the box. Keyboard users can choose a typed signature.'}
      </p>
    </div>
  );
}
const control =
  'min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-[#090D14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7c20]';
export default function IntakeWizard({
  initialData,
  onSuccess,
  onClose,
  onDraftSaved,
}: IntakeWizardProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [values, setValues] = useState<Values>(() => defaults(initialData));
  const [step, setStep] = useState(-1);
  const [savedValues, setSavedValues] = useState<Values>(() => defaults(initialData));
  const [educationSaved, setEducationSaved] = useState(() =>
    Array.isArray((initialData as Record<string, unknown> | undefined)?.education),
  );
  const [expandedHistory, setExpandedHistory] = useState(0);
  const [editingCollected, setEditingCollected] = useState(false);
  const [collected] = useState(() => {
    const initial = defaults(initialData);
    return new Set(
      ['positionAppliedFor', 'name', 'phone', 'city', 'hasRightToWork'].filter(
        (key) => String(initial[key] ?? '').trim() !== '',
      ),
    );
  });
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [status, setStatus] = useState(
    'Your interest is saved. Your application has not been submitted.',
  );
  const lock = useRef(false);
  const submitted = useRef(false);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const update = (name: string, value: Value) => {
    setValues((previous) => {
      const next = { ...previous, [name]: value };
      if (conditionals[name] && !yes(value)) next[conditionals[name]] = '';
      if (name === 'hasConvictions')
        next.convictionHistory = yes(value)
          ? (previous.convictionHistory as Row[]).length
            ? previous.convictionHistory
            : [blankRow('convictionHistory')]
          : [];
      return next;
    });
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };
  const error = (name: string) =>
    errors[name] && (
      <p id={`${name}-error`} role="alert" className="text-sm text-red-700">
        {errors[name]}
      </p>
    );
  const input = (
    name: string,
    label: string,
    type = 'text',
    optional = false,
    value?: string,
    onChange?: (value: string) => void,
  ) => (
    <div key={name} className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {optional ? ' (optional)' : ''}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        className={control}
        value={value ?? String(values[name] ?? '')}
        onChange={(event) =>
          onChange ? onChange(event.target.value) : update(name, event.target.value)
        }
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {error(name)}
      {name === 'name' && String(values.name).trim().length < 2 && (
        <p className="text-sm text-slate-600">
          Enter at least two characters to save a changed name. Returning later keeps your previous
          saved name.
        </p>
      )}
    </div>
  );
  const choice = (name: string, label: string) => (
    <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="flex gap-3">
        {[
          ['true', 'Yes'],
          ['false', 'No'],
        ].map(([value, text]) => (
          <label
            key={value}
            className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-md border border-slate-300 px-4 has-[:checked]:border-[#ff7c20] has-[:checked]:bg-[#ff7c20]/5"
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={String(values[name]) === value}
              onChange={() => update(name, value)}
              className="size-4 accent-[#ff7c20]"
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
            />
            {text}
          </label>
        ))}
      </div>
      {error(name)}
    </fieldset>
  );
  const checkbox = (name: string, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex min-h-12 items-start gap-3 text-sm leading-relaxed">
        <input
          id={name}
          type="checkbox"
          checked={yes(values[name])}
          onChange={(event) => update(name, event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[#ff7c20]"
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
        />
        {label}
      </Label>
      {error(name)}
    </div>
  );
  const rows = (key: string, title: string, hint: string) => (
    <section id={key} tabIndex={-1} className="space-y-4 outline-none">
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-600">{hint}</p>
      {error(key)}
      {(values[key] as Row[]).map((row, index) => (
        <fieldset key={index} className="space-y-4 rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold">
            {key === 'references'
              ? 'Reference'
              : key === 'employmentHistory'
                ? 'History entry'
                : key === 'education'
                  ? 'Education or training'
                  : 'Conviction'}{' '}
            {index + 1}
          </legend>
          {key === 'employmentHistory' && (
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm"
              onClick={() => setExpandedHistory(expandedHistory === index ? -1 : index)}
              aria-expanded={expandedHistory === index}
            >
              <span className="break-words font-medium">
                {row.employerName || 'Add an employer or unemployment period'} ·{' '}
                {row.from || 'Start month'} — {row.to || 'End month'}
              </span>
              <span className="shrink-0 underline">
                {expandedHistory === index ? 'Collapse' : 'Edit entry'}
              </span>
            </button>
          )}
          {(key !== 'employmentHistory' || expandedHistory === index) && (
            <>
              {key === 'employmentHistory' && (
                <div className="space-y-3">
                  <Label htmlFor={`history-type-${index}`}>Type of history entry</Label>
                  <select
                    id={`history-type-${index}`}
                    className={control}
                    value={row.employerName === 'Unemployed' ? 'unemployed' : 'employment'}
                    onChange={(event) =>
                      update(
                        key,
                        (values[key] as Row[]).map((item, i) =>
                          i === index
                            ? event.target.value === 'unemployed'
                              ? {
                                  ...item,
                                  employerName: 'Unemployed',
                                  employerAddress: 'Not applicable',
                                  position: 'Not applicable',
                                  hours: 'Not applicable',
                                }
                              : {
                                  ...item,
                                  employerName: '',
                                  employerAddress: '',
                                  position: '',
                                  hours: '',
                                }
                            : item,
                        ),
                      )
                    }
                  >
                    <option value="employment">Employment</option>
                    <option value="unemployed">Unemployment</option>
                  </select>
                  <Label className="flex min-h-11 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={row.to === 'Current'}
                      onChange={(event) =>
                        update(
                          key,
                          (values[key] as Row[]).map((item, i) =>
                            i === index
                              ? { ...item, to: event.target.checked ? 'Current' : '' }
                              : item,
                          ),
                        )
                      }
                      className="size-4 accent-[#ff7c20]"
                    />
                    This is my current role or unemployment period
                  </Label>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {arrays[key]
                  .filter(
                    (field) =>
                      key !== 'employmentHistory' ||
                      !(
                        (row.employerName === 'Unemployed' &&
                          ['employerName', 'employerAddress', 'position', 'hours'].includes(
                            field,
                          )) ||
                        (row.to === 'Current' && field === 'to')
                      ),
                  )
                  .map((field) =>
                    input(
                      `${key}.${index}.${field}`,
                      rowLabels[field],
                      field === 'from' || field === 'to'
                        ? 'month'
                        : field === 'sentencingDate'
                          ? 'date'
                          : field === 'email'
                            ? 'email'
                            : field === 'phone'
                              ? 'tel'
                              : 'text',
                      false,
                      row[field],
                      (value) =>
                        update(
                          key,
                          (values[key] as Row[]).map((item, i) =>
                            i === index ? { ...item, [field]: value } : item,
                          ),
                        ),
                    ),
                  )}
              </div>
            </>
          )}
          {key !== 'references' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                update(
                  key,
                  (values[key] as Row[]).filter((_, i) => i !== index),
                )
              }
              aria-label={`Remove ${title.toLowerCase()} entry ${index + 1}`}
            >
              <Trash2 className="size-4" />
              Remove entry
            </Button>
          )}
        </fieldset>
      ))}
      {key !== 'references' && (
        <Button
          type="button"
          variant="outline"
          disabled={(values[key] as Row[]).length >= 50}
          onClick={() => {
            if (key === 'employmentHistory') setExpandedHistory((values[key] as Row[]).length);
            update(key, [...(values[key] as Row[]), blankRow(key)]);
          }}
        >
          <Plus className="size-4" />
          Add{' '}
          {key === 'employmentHistory'
            ? 'history'
            : key === 'education'
              ? 'education or training'
              : 'conviction'}{' '}
          entry
        </Button>
      )}
    </section>
  );
  function validate(target: number, snapshot: Values = values): Record<string, string> {
    const found: Record<string, string> = {};
    const need = (name: string) => {
      if (!String(snapshot[name] ?? '').trim()) found[name] = 'Complete this field.';
    };
    for (const name of groups[target]) {
      if (arrays[name] || name === 'addressLine2' || Object.values(conditionals).includes(name))
        continue;
      if (name === 'socialMediaConsent' || name === 'declarationSigned') {
        if (!yes(snapshot[name])) found[name] = 'Please confirm this declaration.';
      } else need(name);
    }
    for (const [flag, detail] of Object.entries(conditionals))
      if (groups[target].includes(flag) && yes(snapshot[flag])) need(detail);
    if (target === 0) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(String(snapshot.dateOfBirth)) ||
        String(snapshot.dateOfBirth) > new Date().toISOString().slice(0, 10)
      )
        found.dateOfBirth = 'Enter a valid date of birth.';
      if (!/^[A-Z]{2}\d{6}[A-D]$/i.test(String(snapshot.niNumber).replace(/\s/g, '')))
        found.niNumber = 'Enter two letters, six numbers and a final letter A–D.';
      if (!/^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i.test(String(snapshot.postcode)))
        found.postcode = 'Enter a valid UK postcode.';
      const phone = String(snapshot.phone).trim();
      const digits = phone.replace(/\D/g, '');
      if (!/^\+?[\d\s()-]{7,25}$/.test(phone) || digits.length < 7 || digits.length > 15)
        found.phone = 'Enter a valid phone number with 7–15 digits.';
    }
    for (const key of Object.keys(arrays).filter((key) => groups[target].includes(key))) {
      const entries = snapshot[key] as Row[];
      if (key === 'convictionHistory' && !yes(snapshot.hasConvictions)) continue;
      if (key === 'education' && !entries.length) continue;
      if (!entries.length) found[key] = 'Add at least one entry.';
      entries.forEach((row, index) => {
        for (const field of arrays[key])
          if (!(key === 'references' && ['phone', 'email'].includes(field)) && !row[field]?.trim())
            found[`${key}.${index}.${field}`] = 'Complete this field.';
        if (key === 'references' && !row.phone?.trim() && !row.email?.trim())
          found[`${key}.${index}.phone`] = 'Enter a phone number or email address.';
        if (row.from && row.to && row.from > row.to)
          found[`${key}.${index}.to`] = 'The end month must follow the start month.';
        if (
          row.phone &&
          (!/^\+?[\d\s()-]{7,25}$/.test(row.phone.trim()) ||
            row.phone.replace(/\D/g, '').length < 7 ||
            row.phone.replace(/\D/g, '').length > 15)
        )
          found[`${key}.${index}.phone`] = 'Enter a valid phone number with 7–15 digits.';
        if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
          found[`${key}.${index}.email`] = 'Enter a valid email address.';
      });
    }
    if (target === 1 && !hasFiveYearEmploymentCoverage(snapshot.employmentHistory as Row[]))
      found.employmentHistory =
        'Cover the last five years without gaps, including any unemployment. Use the current month for an ongoing role.';
    if (target === 5)
      for (const key of ['socialMediaSignedDate', 'declarationSignedDate'])
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(String(snapshot[key])) ||
          String(snapshot[key]) > new Date().toISOString().slice(0, 10)
        )
          found[key] = 'Enter a valid signing date.';
    return found;
  }
  const taskComplete = titles.map(
    (_, index) =>
      Object.keys(validate(index, savedValues)).length === 0 && (index !== 2 || educationSaved),
  );
  const completedCount = taskComplete.filter(Boolean).length;
  const openTask = (index: number) => {
    if (lock.current) return;
    setStep(index);
    setErrors({});
    setSaveError('');
  };
  const payloadFor = (keys: string[], partial = false): Values => {
    const payload: Values = {
      applicationFormVersion: 'jotform-v1',
      privacyNoticeVersion: 'Pullum Privacy Policy V2 April 2026',
    };
    for (const name of keys) {
      const value = values[name];
      if (partial && name === 'name' && String(value).trim().length < 2) continue;
      if (booleanFields.includes(name)) {
        if (String(value) !== '') payload[name] = yes(value);
      } else payload[name] = typeof value === 'string' ? value.trim() : value;
    }
    for (const [flag, detail] of Object.entries(conditionals))
      if (flag in payload && !yes(values[flag])) payload[detail] = '';
    if ('hasConvictions' in payload && !yes(values.hasConvictions)) payload.convictionHistory = [];
    return payload;
  };
  const submit = async (partial = false) => {
    if (lock.current || submitted.current || step < 0) return;
    lock.current = true;
    const final = step === 6;
    try {
      if (!partial)
        for (const target of final ? [0, 1, 2, 3, 4, 5] : [step]) {
          const found = validate(target);
          if (Object.keys(found).length) {
            setErrors(found);
            const historyError = Object.keys(found).find((key) =>
              key.startsWith('employmentHistory.'),
            );
            if (historyError) setExpandedHistory(Number(historyError.split('.')[1]));
            setStep(target);
            requestAnimationFrame(() => document.getElementById(Object.keys(found)[0])?.focus());
            return;
          }
        }
      setSaving(true);
      setSaveError('');
      setStatus(final ? 'Submitting your application…' : 'Saving your section…');
      controller.current = new AbortController();
      const token = await getToken();
      if (!mounted.current) return;
      if (!token) throw new Error('auth');
      const payload = payloadFor(final ? groups.flat() : groups[step], partial);
      if (final) {
        await onSuccess(payload);
        submitted.current = true;
        if (mounted.current) {
          setCompleted(true);
          setStatus('Application submitted.');
        }
      } else {
        const response = await fetch('/api/portal/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
          signal: controller.current.signal,
        });
        if (!response.ok) throw new Error('save');
        if (!mounted.current) return;
        setSavedValues((previous) => ({ ...previous, ...payload }));
        if (partial && step === 0 && String(values.name).trim().length < 2)
          setStatus(
            'Section saved. The incomplete name was not saved; your previous name has been kept.',
          );
        if (step === 2) setEducationSaved(true);
        if (!(partial && step === 0 && String(values.name).trim().length < 2))
          setStatus('Section saved. Your application has not been submitted.');
        await onDraftSaved?.(payload);
        if (!mounted.current) return;
        setValues((previous) => ({
          ...previous,
          ...payload,
          ...(partial && step === 0 && !payload.name ? { name: savedValues.name } : {}),
        }));
        setStep(-1);
        if (partial) onClose?.();
      }
    } catch (error) {
      if (mounted.current) {
        setSaveError(
          error instanceof Error && error.message === 'auth'
            ? 'Your sign-in session could not be verified. Sign in again, then retry. Your details are still here.'
            : final
              ? 'We could not complete your submission. Your saved sections are still here. Please try again.'
              : 'Your section could not be saved. Your details are still here. Please try again.',
        );
        setStatus(
          final ? 'Submission unsuccessful. Your interest is still saved.' : 'Save unsuccessful.',
        );
      }
    } finally {
      lock.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  if (!isLoaded)
    return (
      <p role="status" className="p-8">
        Loading your application…
      </p>
    );
  if (!user)
    return (
      <p role="alert" className="p-6">
        Please sign in to complete your application.
      </p>
    );
  return (
    <section
      className="mx-auto w-full max-w-[760px] rounded-lg border border-slate-200 bg-white p-5 text-brand-obsidian sm:p-8"
      style={{ fontFamily: 'Geist, sans-serif' }}
    >
      <header className="mb-6 border-b border-slate-200 pb-6">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-slate-600">
          Application for employment
        </p>
        <h2
          ref={step === -1 ? heading : undefined}
          tabIndex={-1}
          className="text-2xl font-bold sm:text-[32px] leading-tight"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Complete your application
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Your interest is saved. Complete these short sections in any order, then review and submit
          your application.
        </p>
        <p className="mt-3 text-sm font-semibold">
          {completedCount} of 6 sections saved and complete
        </p>
      </header>
      {step === -1 ? (
        <div className="space-y-6">
          <p role="status" aria-live="polite" className="text-sm text-slate-600">
            {status}
          </p>
          <ol aria-label="Application sections" className="divide-y divide-slate-200">
            {titles.map((title, index) => (
              <li key={title}>
                <button
                  type="button"
                  aria-label={title}
                  onClick={() => openTask(index)}
                  disabled={saving || completed}
                  className="flex min-h-20 w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7c20]"
                >
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {taskComplete[index]
                        ? index === 2 && (savedValues.education as Row[]).length === 0
                          ? 'Saved · no entries'
                          : 'Saved and complete'
                        : 'To complete'}
                    </span>
                  </span>
                  {taskComplete[index] ? (
                    <Check className="size-5 shrink-0 text-[#090D14]" />
                  ) : (
                    <ArrowRight className="size-5 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-600">
            You can save a partially completed section and return later. Your application is only
            submitted after the final review.
          </p>
          {completedCount < 6 && (
            <Button
              type="button"
              onClick={() => openTask(taskComplete.findIndex((done) => !done))}
              className="min-h-12 bg-[#ff7c20] text-[#090D14]"
            >
              Continue application
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={completedCount < 6 || completed}
            onClick={() => openTask(6)}
            className="min-h-12"
          >
            Review and submit application
          </Button>
          {onClose && (
            <Button type="button" variant="ghost" onClick={onClose} className="min-h-12">
              Return later
            </Button>
          )}
        </div>
      ) : (
        <form
          noValidate
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <h3
            ref={heading}
            tabIndex={-1}
            className="text-xl font-bold outline-none"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {step === 6 ? 'Review your application' : titles[step]}
          </h3>
          <fieldset disabled={saving || completed} className="space-y-6">
            {step === 6 && (
              <section className="space-y-5">
                <p className="text-sm leading-relaxed text-slate-600">
                  Check your saved sections before submitting. Your interest is saved; this action
                  sends your completed application to the recruitment team.
                </p>
                <dl className="space-y-3">
                  {titles.map((title, index) => (
                    <div
                      key={title}
                      className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3"
                    >
                      <dt className="font-medium">{title}</dt>
                      <dd>
                        <Button type="button" variant="ghost" onClick={() => openTask(index)}>
                          Review section
                        </Button>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="text-sm">
                  {String(savedValues.name)} · {String(savedValues.positionAppliedFor)}
                </p>
              </section>
            )}

            {step === 0 && (
              <>
                <section
                  aria-label="Details already collected"
                  className="space-y-3 border-b border-slate-200 pb-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold">Your details</h4>
                    {collected.size > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingCollected(!editingCollected)}
                        aria-expanded={editingCollected}
                      >
                        {editingCollected ? 'Close details editor' : 'Edit your details'}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Already collected. Edit only if something has changed.
                  </p>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {(
                      [
                        ['name', 'Name'],
                        ['phone', 'Phone'],
                        ['positionAppliedFor', 'Position'],
                        ['city', 'Town'],
                        ['hasRightToWork', 'Right to work'],
                      ] as const
                    )
                      .filter(([key]) => collected.has(key))
                      .map(([key, label]) => (
                        <div key={key} className="min-w-0">
                          <dt className="text-xs text-slate-600">{label}</dt>
                          <dd className="break-words font-medium">
                            {key === 'hasRightToWork'
                              ? yes(values[key])
                                ? 'Yes'
                                : 'No'
                              : String(values[key])}
                          </dd>
                        </div>
                      ))}
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-600">Verified email</dt>
                      <dd className="break-words font-medium">
                        {String(
                          (initialData as Record<string, unknown> | undefined)?.email ||
                            user.primaryEmailAddress?.emailAddress ||
                            'Not available',
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
                <div className="grid gap-5 sm:grid-cols-2">
                  {(editingCollected || !collected.has('positionAppliedFor')) &&
                    input('positionAppliedFor', 'Position applied for')}
                  {input('vacancySource', 'Where did you hear about this vacancy?')}
                  {(editingCollected || !collected.has('name')) && input('name', 'Full name')}
                  {(editingCollected || !collected.has('phone')) &&
                    input('phone', 'Phone number', 'tel')}
                  {input('dateOfBirth', 'Date of birth', 'date')}
                  {input('niNumber', 'National Insurance number')}
                  {input('addressLine1', 'Street address')}
                  {input('addressLine2', 'Address line 2', 'text', true)}
                  {(editingCollected || !collected.has('city')) && input('city', 'City or town')}
                  {input('county', 'County or state')}
                  {input('postcode', 'Postcode')}
                </div>
                {choice('hasDrivingLicense', 'Do you hold a driving licence?')}
                {(editingCollected || !collected.has('hasRightToWork')) &&
                  choice('hasRightToWork', 'Do you have the right to work in the UK?')}
                {choice(
                  'restrictionsOnWork',
                  'Are there restrictions on your right to work or remain in the UK?',
                )}
                {yes(values.restrictionsOnWork) &&
                  input('restrictionsDetail', 'Details of work restrictions')}
              </>
            )}
            {step === 1 && (
              <>
                {choice('currentlyEmployed', 'Are you currently employed?')}
                {yes(values.currentlyEmployed) && input('noticePeriod', 'Notice period')}
                {choice('poultryExperience', 'Do you have poultry industry experience?')}
                {yes(values.poultryExperience) &&
                  input('poultryExperienceDetails', 'Poultry experience details')}
                {rows(
                  'employmentHistory',
                  'Employment and unemployment history',
                  'Cover the last five years without gaps. Add each job or period of unemployment separately. Select the entry type and tick the current-period box if it is ongoing.',
                )}
              </>
            )}
            {step === 2 && (
              <>
                {rows(
                  'education',
                  'Education, qualifications and training',
                  'Include relevant education and training. Remove the entry if you have none to add.',
                )}
              </>
            )}
            {step === 3 && (
              <>
                {rows(
                  'references',
                  'Two employment references',
                  'Include your most recent employer. Provide two referees and their contact details.',
                )}
              </>
            )}
            {step === 4 && (
              <>
                {choice(
                  'abusedPosition',
                  'Has anyone in a position of authority over you ever abused their position for personal gain, for example asked for a lump sum backhander or other favours in return for work or overtime?',
                )}
                {yes(values.abusedPosition) &&
                  input('abusedPositionDetail', 'Details of what happened to you')}
                {choice(
                  'reasonableAdjustments',
                  'Do you need reasonable adjustments during recruitment?',
                )}
                {yes(values.reasonableAdjustments) &&
                  input('adjustmentsDetail', 'Reasonable adjustment details')}
                {choice(
                  'pendingCharges',
                  'Are you awaiting a court appearance or facing a police charge?',
                )}
                {yes(values.pendingCharges) &&
                  input('pendingChargesDetail', 'Pending charge or court appearance details')}
                {choice('hasConvictions', 'Do you have any unspent convictions?')}
                {yes(values.hasConvictions) &&
                  rows(
                    'convictionHistory',
                    'Unspent convictions',
                    'Provide the sentencing date, court, offence and sentence for each unspent conviction.',
                  )}
              </>
            )}
            {step === 5 && (
              <>
                <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <h4 className="font-bold">Social media screening</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    As part of our recruitment process, we will undertake checks on your social
                    media platforms. All data will be processed in line with Data Protection (1998
                    &amp; 2018) and GDPR (2018) Regulations. This legislation requires us to give
                    you a Privacy Notice to explain how we manage your personal data. Please refer
                    to the Privacy Notice which has been provided to you.
                  </p>
                  <a
                    className="inline-flex min-h-11 items-center text-sm underline"
                    href="/privacy/pullum-privacy-policy-v2-april-2026.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the privacy notice (PDF)
                  </a>
                  {checkbox(
                    'socialMediaConsent',
                    'I have read and acknowledge the social media screening notice.',
                  )}
                  <Signature
                    disabled={saving || completed}
                    name="socialMediaSignature"
                    label="Social media notice signature"
                    value={String(values.socialMediaSignature)}
                    onChange={(value) => update('socialMediaSignature', value)}
                  />
                  {error('socialMediaSignature')}
                  {input('socialMediaSignedDate', 'Social media notice signing date', 'date')}
                  <p className="text-xs text-slate-600">
                    Sign this notice independently from the application declaration.
                  </p>
                </section>
                <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <h4 className="font-bold">Application declaration</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    I understand that any false or misleading information given in this application
                    may result in either my offer of employment being withdrawn or my dismissal, if
                    I am appointed. I declare that to the best of my knowledge the information I
                    have submitted is correct. No approach will be made to present/previous
                    employers before an offer of employment is made, however I give my consent to
                    these referees being contacted regards my previous employment in the event of a
                    job offer being made.
                  </p>
                  <a
                    className="inline-flex min-h-11 items-center text-sm underline"
                    href="/privacy/pullum-privacy-policy-v2-april-2026.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the privacy policy (PDF)
                  </a>
                  {checkbox(
                    'declarationSigned',
                    'I confirm my application is accurate and agree to the declaration and reference permission.',
                  )}
                  <Signature
                    disabled={saving || completed}
                    name="declarationSignature"
                    label="Application declaration signature"
                    value={String(values.declarationSignature)}
                    onChange={(value) => update('declarationSignature', value)}
                  />
                  {error('declarationSignature')}
                  {input('declarationSignedDate', 'Application declaration signing date', 'date')}
                  <p className="text-xs text-slate-600">
                    This signature is separate from the social media notice signature.
                  </p>
                </section>
              </>
            )}
          </fieldset>
          {saveError && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {saveError}
            </p>
          )}
          <p
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-xs text-slate-600"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {status}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={saving || completed}
              onClick={() => {
                setValues({ ...savedValues });
                openTask(-1);
              }}
              className="min-h-12"
            >
              <ArrowLeft className="size-4" />
              Back to sections
            </Button>
            {step < 6 && (
              <Button
                type="button"
                variant="ghost"
                disabled={saving || completed}
                onClick={() => void submit(true)}
                className="min-h-12"
              >
                Save and return later
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving || completed}
              className="min-h-12 bg-[#ff7c20] px-5 font-bold text-[#090D14] hover:bg-[#090D14] hover:text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {step === 6 ? 'Submitting…' : 'Saving…'}
                </>
              ) : step === 6 ? (
                'Submit application'
              ) : (
                'Save section'
              )}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
