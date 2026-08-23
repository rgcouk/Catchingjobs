import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import IntakeWizard from '../../src/pages/wizard/IntakeWizard';

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

describe('CRM Features Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('IntakeWizard Component', () => {
    it('should navigate through steps and submit data', async () => {
      const mockSuccess = vi.fn();
      
      // We also need to mock fetch since autoSave calls fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as unknown as Mock;

      render(<IntakeWizard sectorId="chicken" onSuccess={mockSuccess} />);

      // Step 1
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
      
      // We are using native selects now for booleans in step 1
      const drivingLicenseSelect = document.querySelector('select[name="hasDrivingLicense"]') as HTMLSelectElement;
      fireEvent.change(drivingLicenseSelect, { target: { value: 'true' } });
      
      const forkliftLicenseSelect = document.querySelector('select[name="hasForkliftLicense"]') as HTMLSelectElement;
      fireEvent.change(forkliftLicenseSelect, { target: { value: 'false' } });
      
      const shiftAvailabilitySelect = document.querySelector('select[name="shiftAvailability"]') as HTMLSelectElement;
      fireEvent.change(shiftAvailabilitySelect, { target: { value: 'Any' } });

      fireEvent.change(document.querySelector('textarea[name="poultryExperience"]')!, { target: { value: '2 years working in Norfolk.' } });
      
      fireEvent.click(screen.getByText('Save & Continue'));

      // Auto-save fetch check
      await waitFor(() => expect(global.fetch).toHaveBeenCalled());

      // Step 2
      await waitFor(() => expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument());
      fireEvent.change(document.querySelector('input[name="dateOfBirth"]')!, { target: { value: '1990-01-01' } });
      fireEvent.change(document.querySelector('input[name="niNumber"]')!, { target: { value: 'AB123456C' } });
      fireEvent.change(document.querySelector('input[name="addressLine1"]')!, { target: { value: '123 Test St' } });
      fireEvent.change(document.querySelector('input[name="postcode"]')!, { target: { value: 'TE1 1ST' } });
      
      fireEvent.click(screen.getByText('Save & Continue'));

      // Step 3
      await waitFor(() => expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument());
      fireEvent.change(document.querySelector('input[name="bankName"]')!, { target: { value: 'Test Bank' } });
      fireEvent.change(document.querySelector('input[name="bankAccountName"]')!, { target: { value: 'Test User' } });
      fireEvent.change(document.querySelector('input[name="bankAccountNumber"]')!, { target: { value: '12345678' } });
      fireEvent.change(document.querySelector('input[name="bankSortCode"]')!, { target: { value: '12-34-56' } });
      
      fireEvent.change(document.querySelector('input[name="emergencyName"]')!, { target: { value: 'Mom' } });
      fireEvent.change(document.querySelector('input[name="emergencyPhone"]')!, { target: { value: '07700900001' } });
      fireEvent.change(document.querySelector('input[name="emergencyRelation"]')!, { target: { value: 'Mother' } });
      
      // Declarations
      const declarations = screen.getAllByRole('checkbox');
      fireEvent.click(declarations[declarations.length - 1]); // Last one is the declaration signed

      fireEvent.click(screen.getByText('Submit Application'));

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalled();
        const submittedData = mockSuccess.mock.calls[0][0];
        expect(submittedData.name).toBe('Test User');
        expect(submittedData.userId).toBe('user123');
        expect(submittedData.hasDrivingLicense).toBe('true');
      });
    });
  });
});
