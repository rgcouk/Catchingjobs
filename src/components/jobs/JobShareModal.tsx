/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Linkedin,
  Mail,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface JobShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobLocation: string;
  payRate: string;
  jobUrl: string;
}

export default function JobShareModal({
  isOpen,
  onClose,
  jobTitle,
  jobLocation,
  payRate,
  jobUrl,
}: JobShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out this ${jobTitle} role in ${jobLocation} (${payRate}) with CatchingJobs! Guaranteed weekly pay & door-to-door home pickup:`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jobUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jobUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Job link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy link to clipboard');
    }
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${jobUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: ExternalLink,
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`,
    },
    {
      name: 'X (Twitter)',
      icon: Share2,
      color: 'bg-[#000000] hover:bg-[#1e1e1e] text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#095196] text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-[#64748B] hover:bg-[#475569] text-white',
      url: `mailto:?subject=${encodeURIComponent(`Poultry Harvesting Job: ${jobTitle} (${jobLocation})`)}&body=${encodeURIComponent(`${shareText}\n\n${jobUrl}`)}`,
    },
  ];

  // QR Code generator URL
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(jobUrl)}&margin=10`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Job Vacancy"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5" /> Share Opportunity
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] leading-snug">{jobTitle}</h3>
            <p className="text-xs text-[#64748B]">
              {jobLocation} • {payRate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-medium text-[#475569]">Direct Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={jobUrl}
              className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs font-mono text-[#334155] focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                copied
                  ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                  : 'bg-[#0F172A] text-white hover:bg-[#059669]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-medium text-[#475569]">Share via</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {shareChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-colors shadow-xs ${channel.color}`}
              >
                <channel.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{channel.name}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 shrink-0 text-[#059669]" />
              <span>{showQr ? 'Hide QR' : 'QR Code'}</span>
            </button>
          </div>
        </div>

        {/* QR Code expansion */}
        {showQr && (
          <div className="pt-2 flex flex-col items-center justify-center p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center space-y-2 animate-in fade-in duration-150">
            <img
              src={qrImageUrl}
              alt={`QR Code for ${jobTitle}`}
              className="w-36 h-36 border border-white rounded-lg shadow-xs"
              loading="lazy"
            />
            <p className="text-[11px] font-mono text-[#64748B]">
              Scan with mobile camera to open & apply
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span>Pullum Ltd Recruitment</span>
          <span>GLAA Licensed</span>
        </div>
      </div>
    </div>
  );
}
