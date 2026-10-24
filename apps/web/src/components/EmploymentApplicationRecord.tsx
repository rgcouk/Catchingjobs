import type { Application } from '@prisma/client';

const detailLabels = {
  privacyNoticeVersion: 'Privacy notice shown',
  positionAppliedFor: 'Position applied for',
  vacancySource: 'How they found the vacancy',
  addressLine2: 'Address line 2',
  city: 'City / town',
  county: 'County',
  currentlyEmployed: 'Currently employed',
  noticePeriod: 'Notice period',
  hasDrivingLicense: 'Driving licence',
  hasRightToWork: 'Right to work',
  poultryExperience: 'Previous poultry experience',
  poultryExperienceDetails: 'Poultry experience details',
  restrictionsOnWork: 'Work restrictions',
  restrictionsDetail: 'Restriction details',
  abusedPosition: 'Abuse of authority disclosed',
  abusedPositionDetail: 'Disclosure details',
  reasonableAdjustments: 'Adjustments requested',
  adjustmentsDetail: 'Adjustment details',
  pendingCharges: 'Pending charges disclosed',
  pendingChargesDetail: 'Pending charge details',
  hasConvictions: 'Unspent convictions disclosed',
  socialMediaConsent: 'Social media screening acknowledged',
  socialMediaSignedDate: 'Screening signed date',
  declarationSigned: 'Application declaration confirmed',
  declarationSignedDate: 'Declaration signed date',
} as const;

export function EmploymentApplicationRecord({ application }: { application: Application }) {
  return (
    <section className="space-y-4 border-t border-border pt-4">
      <h4 className="text-sm font-semibold">Employment application</h4>
      <dl className="grid gap-3 sm:grid-cols-2">
        {Object.entries(detailLabels).map(([key, label]) => {
          const value = application[key as keyof typeof detailLabels];
          return (
            <div key={key}>
              <dt className="font-medium">{label}</dt>
              <dd className="whitespace-pre-wrap break-words text-muted-foreground">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'Not provided'}
              </dd>
            </div>
          );
        })}
      </dl>
      {(['employmentHistory', 'education', 'references', 'convictionHistory'] as const).map(
        (key) => {
          const rows = application[key];
          return (
            <section key={key} className="space-y-2">
              <h5 className="font-semibold">
                {
                  {
                    employmentHistory: 'Employment and unemployment history',
                    education: 'Education and training',
                    references: 'References',
                    convictionHistory: 'Conviction details',
                  }[key]
                }
              </h5>
              {Array.isArray(rows) && rows.length ? (
                rows.map((row, index) => (
                  <dl
                    key={index}
                    className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2"
                  >
                    {row &&
                      typeof row === 'object' &&
                      !Array.isArray(row) &&
                      Object.entries(row).map(([field, value]) => (
                        <div key={field}>
                          <dt className="font-medium">{field.replace(/([A-Z])/g, ' $1')}</dt>
                          <dd className="whitespace-pre-wrap break-words text-muted-foreground">
                            {String(value ?? '') || 'Not provided'}
                          </dd>
                        </div>
                      ))}
                  </dl>
                ))
              ) : (
                <p className="text-muted-foreground">No entries provided</p>
              )}
            </section>
          );
        },
      )}
      {(['socialMediaSignature', 'declarationSignature'] as const).map((key) => (
        <div key={key}>
          <h5 className="font-semibold">
            {key === 'socialMediaSignature'
              ? 'Social media screening signature'
              : 'Application declaration signature'}
          </h5>
          {application[key]?.startsWith('data:image/png;base64,') ||
          application[key]?.startsWith('data:image/svg+xml,') ? (
            <img
              src={application[key]!}
              alt="Applicant signature"
              className="max-h-24 max-w-full rounded border bg-white"
            />
          ) : (
            <p className="break-words text-muted-foreground">
              {application[key] || 'Not provided'}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
