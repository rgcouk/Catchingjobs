import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import IntakeWizard from '@/pages/wizard/IntakeWizard';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      id: 'user123',
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
    isLoaded: true,
  }),
  useAuth: () => ({
    getToken: vi.fn(() => Promise.resolve('fake-token')),
  }),
}));

describe('CRM employment application entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Jotform personal details and does not request payroll or medical data', () => {
    render(<IntakeWizard sectorId="chicken" onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Personal details & eligibility' }));
    [
      'positionAppliedFor',
      'vacancySource',
      'addressLine1',
      'addressLine2',
      'city',
      'county',
      'postcode',
      'niNumber',
      'dateOfBirth',
    ].forEach((name) => {
      expect(document.querySelector(`[name="${name}"]`)).not.toBeNull();
    });
    [
      'bankName',
      'emergencyName',
      'isFitToLift',
      'hasAsthmaOrAllergies',
      'hasForkliftLicense',
    ].forEach((name) => {
      expect(document.querySelector(`[name="${name}"]`)).toBeNull();
    });
  });
});
