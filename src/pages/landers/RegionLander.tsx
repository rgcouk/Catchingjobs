/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Split Diptych
 * theme: Clean Modern Minimal Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Quote,
  Phone,
  ArrowRight,
  Truck,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { TENANTS } from '../../data';
import { resolveTown } from '../../data/locations';
import { useSSRData } from '../../context/SSRDataContext';
import { TownData } from '../../types';
import HeroTriageForm from '../../components/triage/HeroTriageForm';

interface RegionLanderProps {
  regionId: string;
  sectorId: 'chicken' | 'turkey';
  onBackToSector: () => void;
}

export default function RegionLander({ regionId, sectorId, onBackToSector }: RegionLanderProps) {
  const { initialData } = useSSRData();
  const tenant = TENANTS[sectorId];
  const sectorTitle = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';

  const [town, setTown] = useState<TownData | null>(() => {
    if (
      initialData &&
      initialData.town &&
      (initialData.town.id.toLowerCase() === regionId.toLowerCase() ||
        initialData.town.name.toLowerCase() === regionId.toLowerCase())
    ) {
      return initialData.town;
    }

    const resolved = resolveTown(sectorId, regionId);
    if (resolved && resolved.town) {
      return resolved.town;
    }

    return null;
  });

  const [isNotFound, setIsNotFound] = useState<boolean>(() => {
    if (initialData?.notFound) return true;
    const resolved = resolveTown(sectorId, regionId);
    return !resolved && !initialData?.town;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    return !town && !isNotFound;
  });

  useEffect(() => {
    const syncResolved = resolveTown(sectorId, regionId);
    if (syncResolved && syncResolved.town) {
      setTown(syncResolved.town);
      setIsNotFound(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data: any[]) => {
        let foundTown: TownData | null = null;

        for (const r of data) {
          if (r.towns) {
            const match = r.towns.find(
              (t: any) =>
                t.id.toLowerCase() === regionId.toLowerCase() ||
                t.name.toLowerCase() === regionId.toLowerCase(),
            );
            if (match) {
              foundTown = {
                id: match.id,
                name: match.name,
                pickupPoint: match.pickupPoint,
                surrounding: match.surrounding || match.surroundingAreas?.join(', ') || '',
                localizedCopy: match.localizedCopy,
                faqs: match.faqs || [],
                testimonial: match.testimonial || undefined,
              };
              break;
            }
          }
        }

        if (foundTown) {
          setTown(foundTown);
          setIsNotFound(false);
        } else {
          setIsNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Error fetching dynamic town data:', err);
        setIsNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [regionId, sectorId]);

  const sectorSlug = sectorId === 'chicken' ? 'chickens' : 'turkeys';

  if (loading) {
    return (
      <div className="font-sans min-h-[60vh] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-[#64748B]">Loading {sectorTitle} Depot...</p>
        </div>
      </div>
    );
  }

  if (isNotFound || !town) {
    return (
      <div className="font-sans min-h-[60vh] flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-4 shadow-sm">
          <MapPin className="w-8 h-8 text-[#64748B] mx-auto" />
          <h2 className="text-xl font-bold text-[#0F172A]">Depot Location Not Found</h2>
          <p className="text-xs text-[#64748B]">
            We could not resolve an active catching depot for "{regionId}".
          </p>
          <Link
            to={`/${sectorSlug}`}
            className="inline-flex items-center justify-center gap-2 bg-[#059669] text-white px-5 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider"
          >
            <span>View All Regional Depots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white min-h-screen antialiased">
      <Helmet>
        <title>{`${town.name} ${sectorTitle} Jobs | CatchingJobs`}</title>
        <meta
          name="description"
          content={`Professional UK ${sectorTitle} roles departing from ${town.name} Depot. Free local minibus collection from ${town.pickupPoint}, weekly Friday pay, and full PPE supplied.`}
        />
      </Helmet>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#0F172A] hover:underline">
              Catchingjobs
            </Link>
            <span>/</span>
            <Link to={`/${sectorSlug}`} className="hover:text-[#0F172A] hover:underline">
              {sectorTitle}
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#0F172A]">{town.name} Depot</span>
          </div>
          <Link
            to={`/${sectorSlug}`}
            className="text-[#059669] hover:underline flex items-center gap-1 font-medium"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>All Depots</span>
          </Link>
        </div>
      </div>

      {/* Hero Section: Diptych Layout */}
      <section className="bg-white border-b border-[#E2E8F0] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Pitch & Localized Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-xs font-mono text-[#065F46] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                <span>GLAA Licensed · {town.name} Minibus Depot</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.15]">
                {town.name} {sectorTitle} Squads
              </h1>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-start gap-2 text-xs font-mono text-[#0F172A]">
                  <Truck className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Direct Pickup Point:</span> {town.pickupPoint}
                  </div>
                </div>
                {town.surrounding && (
                  <div className="text-[11px] font-mono text-[#64748B] pl-6">
                    <span className="font-semibold">Servicing Areas:</span> {town.surrounding}
                  </div>
                )}
              </div>

              <div className="prose prose-sm text-[#64748B] leading-relaxed">
                {town.localizedCopy ? (
                  <ReactMarkdown>{town.localizedCopy}</ReactMarkdown>
                ) : (
                  <p>
                    Join our professional {town.name} catching team. We collect operatives directly
                    from {town.pickupPoint} in modern heated minibuses, deliver you safely to
                    regional poultry farms, and guarantee your wages every Friday morning via BACS.
                  </p>
                )}
              </div>

              {/* Snapshot Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Weekly Pay</span>
                  <span className="font-bold text-[#0F172A]">£780 – £950 / wk</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Transit Cost</span>
                  <span className="font-bold text-[#059669]">£0.00 (Free)</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Deposit Day</span>
                  <span className="font-bold text-[#EA580C]">Every Friday</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Fast Triage Form */}
            <div className="lg:col-span-5 bg-[#F8FAFC] p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
                  3-Minute Onboarding
                </span>
                <h3 className="text-xl font-bold text-[#0F172A]">Register for {town.name} Depot</h3>
                <p className="text-xs text-[#64748B]">
                  Confirm right-to-work and get assigned to the next available minibus run.
                </p>
              </div>

              <HeroTriageForm regionId={town.id} sectorId={sectorId} townName={town.name} />
            </div>
          </div>
        </div>
      </section>

      {/* Localized FAQ Section */}
      {town.faqs && town.faqs.length > 0 && (
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
              Depot FAQ
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Frequently Asked Questions for {town.name} Catchers
            </h2>
          </div>

          <div className="space-y-4">
            {town.faqs.map((faq: any, idx: number) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-xl border border-[#E2E8F0] space-y-2 shadow-sm"
              >
                <h4 className="text-base font-bold text-[#0F172A]">{faq.question}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Pullum Ltd · {town.name} Catching Depot
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-[#0F172A]">
              Home
            </Link>
            <Link to={`/${sectorSlug}`} className="hover:text-[#0F172A]">
              {sectorTitle}
            </Link>
            <Link to="/corporate" className="hover:text-[#0F172A]">
              Growers
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
