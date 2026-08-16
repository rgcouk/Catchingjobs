import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
  CheckCircle2,
  Briefcase,
  Loader2,
  User,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import IntakeWizard from '../wizard/IntakeWizard';
import { SubmittedApplication } from '../../App';

const PortalDashboard = () => {
  const [profile, setProfile] = useState<{ application?: SubmittedApplication } | null>(null);
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const USER_ID = user?.id || '';

  const fetchData = useCallback(async () => {
    if (!isLoaded || !USER_ID) return;

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Profile
      const profileRes = await fetch(`/api/portal/me?userId=${USER_ID}`, { headers });
      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }

      // Fetch Applications
      const appsRes = await fetch(`/api/portal/applications?userId=${USER_ID}`, { headers });
      if (appsRes.ok) {
        setApplications(await appsRes.json());
      }
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [USER_ID, getToken, isLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
        <p className="text-xs font-mono text-[var(--color-ink-2)] uppercase tracking-wider">
          Loading Portal...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 text-red-600 text-sm font-mono">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16">
      {/* Header */}
      <header className="space-y-4 border-b border-[var(--color-rule)] pb-8">
        <div className="flex items-center gap-2 text-[var(--color-accent)] mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">
            Candidate Portal
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--color-ink)] leading-tight">
          Welcome back, {user?.firstName || 'Candidate'}.
        </h1>
        <p className="text-sm text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
          Manage your onboarding details, view your active applications, and update your right to
          work information.
        </p>
      </header>

      {/* Primary Action / Onboarding */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[var(--color-ink)] flex items-center gap-3">
          <User className="w-6 h-6 text-[var(--color-ink-2)]" />
          Onboarding Status
        </h2>

        {profile?.application?.profileFormCompleted ? (
          <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] p-6 md:p-8 flex items-start gap-4 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-[var(--color-ink)]">Profile Completed</h3>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                You have successfully submitted your initial application and right-to-work details.
                Our team is currently reviewing your file and will contact you via email or SMS with
                next steps.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-[var(--color-paper)] p-1 md:p-4 shadow-xl">
            <IntakeWizard
              sectorId="chicken"
              initialData={profile?.application}
              onSuccess={async (data) => {
                try {
                  const token = await getToken();
                  const res = await fetch(`/api/applications/submit`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  if (!res.ok) throw new Error('Failed to submit application');
                  await fetchData();
                } catch (error) {
                  const err = error as Error;
                  alert(err.message);
                }
              }}
              onClose={() => {}}
            />
          </div>
        )}
      </section>

      {/* Applications List */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[var(--color-ink)] flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-[var(--color-ink-2)]" />
          Active Applications
        </h2>

        <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <FileText className="w-10 h-10 text-[var(--color-rule)] mb-4" />
              <p className="text-sm font-mono text-[var(--color-ink-2)]">
                No active applications found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-rule)]">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-paper)] transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-[var(--color-ink)] text-sm uppercase tracking-wide">
                      {app.jobPosting?.title || 'General Roster Application'}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-2)] font-mono">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      app.status === 'HIRED'
                        ? 'bg-[var(--color-accent)] text-[var(--color-paper)] border-[var(--color-accent)]'
                        : app.status === 'REVIEWING'
                          ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]'
                          : 'bg-transparent text-[var(--color-ink)] border-[var(--color-rule)]'
                    }`}
                  >
                    {app.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Details Dump */}
      {profile?.application && (
        <section className="space-y-6">
          <h2 className="font-display text-2xl text-[var(--color-ink)] flex items-center gap-3">
            <FileText className="w-6 h-6 text-[var(--color-ink-2)]" />
            Your Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] block">
                Full Name
              </span>
              <span className="text-sm font-semibold text-[var(--color-ink)] block">
                {profile.application.name || '-'}
              </span>
            </div>
            <div className="p-5 border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] block">
                Email Address
              </span>
              <span className="text-sm font-semibold text-[var(--color-ink)] block">
                {profile.application.email || user?.primaryEmailAddress?.emailAddress || '-'}
              </span>
            </div>
            <div className="p-5 border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] block">
                Phone
              </span>
              <span className="text-sm font-semibold text-[var(--color-ink)] block">
                {profile.application.phone || '-'}
              </span>
            </div>
            <div className="p-5 border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] block">
                Right to Work UK
              </span>
              <span className="text-sm font-semibold text-[var(--color-ink)] block">
                {profile.application.hasRightToWork ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Support block */}
      <section className="pt-8 border-t border-[var(--color-rule)]">
        <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-semibold text-lg text-[var(--color-ink)]">Need Support?</h3>
            <p className="text-sm text-[var(--color-ink-2)]">
              Reach out to the onboarding team for help with your application.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono text-[var(--color-ink)]">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--color-accent)]" /> support@catchingjobs.co.uk
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalDashboard;
