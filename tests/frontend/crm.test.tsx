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

      // Mock fetch for autoSave
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }),
      ) as unknown as Mock;

      render(<IntakeWizard sectorId="chicken" onSuccess={mockSuccess} />);

      // Step 1
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();

      fireEvent.change(document.querySelector('input[name="dateOfBirth"]')!, {
        target: { value: '1990-01-01' },
      });
      fireEvent.change(document.querySelector('input[name="niNumber"]')!, {
        target: { value: 'AB123456C' },
      });
      fireEvent.change(document.querySelector('input[name="addressLine1"]')!, {
        target: { value: '123 Test St' },
      });
      fireEvent.change(document.querySelector('input[name="postcode"]')!, {
        target: { value: 'PE21 8SS' },
      });

      const drivingLicenseSelect = document.querySelector(
        'select[name="hasDrivingLicense"]',
      ) as HTMLSelectElement;
      fireEvent.change(drivingLicenseSelect, { target: { value: 'true' } });

      const forkliftLicenseSelect = document.querySelector(
        'select[name="hasForkliftLicense"]',
      ) as HTMLSelectElement;
      fireEvent.change(forkliftLicenseSelect, { target: { value: 'false' } });

      fireEvent.click(screen.getByText('Next Stage'));

      // Auto-save fetch check
      await waitFor(() => expect(global.fetch).toHaveBeenCalled());

      // Step 2
      await waitFor(() => expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument());
      fireEvent.change(document.querySelector('input[name="emergencyName"]')!, {
        target: { value: 'Mom' },
      });
      fireEvent.change(document.querySelector('input[name="emergencyPhone"]')!, {
        target: { value: '07700900001' },
      });
      fireEvent.change(document.querySelector('input[name="emergencyRelation"]')!, {
        target: { value: 'Mother' },
      });

      fireEvent.change(document.querySelector('input[name="bankName"]')!, {
        target: { value: 'Test Bank' },
      });
      fireEvent.change(document.querySelector('input[name="bankAccountName"]')!, {
        target: { value: 'Test User' },
      });
      fireEvent.change(document.querySelector('input[name="bankSortCode"]')!, {
        target: { value: '12-34-56' },
      });
      fireEvent.change(document.querySelector('input[name="bankAccountNumber"]')!, {
        target: { value: '12345678' },
      });

      fireEvent.click(screen.getByText('Next Stage'));

      // Step 3
      await waitFor(() => expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument());

      fireEvent.click(screen.getByText('Submit & Complete Profile'));

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalled();
        const submittedData = mockSuccess.mock.calls[0][0];
        expect(submittedData.name).toBe('Test User');
        expect(submittedData.userId).toBe('user123');
        expect(submittedData.hasDrivingLicense).toBe('true');
      });
    });

    it('should support Back button navigation between steps without losing state', async () => {
      const mockSuccess = vi.fn();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }),
      ) as unknown as Mock;

      render(
        <IntakeWizard
          sectorId="turkey"
          initialData={{
            hasDrivingLicense: 'true',
            hasForkliftLicense: 'true',
            dateOfBirth: '1995-05-05',
            niNumber: 'AB123456C',
            addressLine1: '45 High St',
            postcode: 'LN1 1AA',
          }}
          onSuccess={mockSuccess}
        />,
      );

      // Verify Step 1 initial data
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText('Next Stage'));

      // In Step 2, click Previous
      await waitFor(() => expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText('Previous'));

      // Back in Step 1
      await waitFor(() => expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument());
      const drivingSelect = document.querySelector(
        'select[name="hasDrivingLicense"]',
      ) as HTMLSelectElement;
      expect(drivingSelect.value).toBe('true');
    });
  });
});
