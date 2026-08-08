import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import IntakeWizard from '../../src/components/IntakeWizard';
import { KanbanBoard } from '../../src/components/KanbanBoard';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      id: 'user123',
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
  }),
}));

describe('CRM Features Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('IntakeWizard Component', () => {
    it('should navigate through steps and submit data', async () => {
      const mockSuccess = vi.fn();
      render(<IntakeWizard sectorId="chicken" onSuccess={mockSuccess} />);

      // Step 1
      expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
      fireEvent.change(document.querySelector('input[name="phone"]')!, { target: { value: '07700900000' } });
      fireEvent.change(document.querySelector('input[name="dateOfBirth"]')!, { target: { value: '1990-01-01' } });
      fireEvent.change(document.querySelector('input[name="niNumber"]')!, { target: { value: 'AB123456C' } });
      fireEvent.change(document.querySelector('input[name="addressLine1"]')!, { target: { value: '123 Test St' } });
      fireEvent.change(document.querySelector('input[name="postcode"]')!, { target: { value: 'TE1 1ST' } });
      fireEvent.change(document.querySelector('input[name="town"]')!, { target: { value: 'Testville' } });
      
      fireEvent.click(screen.getByText('Next'));

      // Step 2
      await waitFor(() => expect(screen.getByText(/Step 2/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText('Next'));

      // Step 3
      await waitFor(() => expect(screen.getByText(/Step 3/i)).toBeInTheDocument());
      fireEvent.change(document.querySelector('input[name="bankName"]')!, { target: { value: 'Test Bank' } });
      fireEvent.change(document.querySelector('input[name="bankAccountName"]')!, { target: { value: 'Test User' } });
      fireEvent.change(document.querySelector('input[name="bankAccountNumber"]')!, { target: { value: '12345678' } });
      fireEvent.change(document.querySelector('input[name="bankSortCode"]')!, { target: { value: '12-34-56' } });
      fireEvent.click(screen.getByText('Next'));

      // Step 4
      await waitFor(() => expect(screen.getByText(/Step 4/i)).toBeInTheDocument());
      fireEvent.change(document.querySelector('input[name="emergencyName"]')!, { target: { value: 'Mom' } });
      fireEvent.change(document.querySelector('input[name="emergencyPhone"]')!, { target: { value: '07700900001' } });
      fireEvent.change(document.querySelector('input[name="emergencyRelation"]')!, { target: { value: 'Mother' } });
      
      // I declare checkbox
      const declarations = screen.getAllByRole('checkbox');
      fireEvent.click(declarations[declarations.length - 1]); // Last one is the declaration

      fireEvent.click(screen.getByText('Submit Application'));

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalled();
        const submittedData = mockSuccess.mock.calls[0][0];
        expect(submittedData.name).toBe('Test User');
        expect(submittedData.phone).toBe('07700900000');
        expect(submittedData.userId).toBe('user123');
        expect(submittedData.rosterRef).toMatch(/^PL-CHI-\d{4}$/);
      });
    });
  });

  describe('KanbanBoard Component', () => {
    const mockApps = [
      { id: 1, name: 'Alice', status: 'NEW', sector: 'Chicken', town: 'London', createdAt: new Date().toISOString() },
      { id: 2, name: 'Bob', status: 'REVIEWING', sector: 'Turkey', town: 'Leeds', createdAt: new Date().toISOString() },
    ];

    it('should render columns and application cards', () => {
      render(<KanbanBoard applications={mockApps} onUpdateStatus={vi.fn()} onSelectApp={vi.fn()} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getAllByText('NEW').length).toBeGreaterThan(0);
      expect(screen.getAllByText('REVIEWING').length).toBeGreaterThan(0);
    });

    it('should call onSelectApp when a card is clicked', () => {
      const mockSelect = vi.fn();
      render(<KanbanBoard applications={mockApps} onUpdateStatus={vi.fn()} onSelectApp={mockSelect} />);
      
      fireEvent.click(screen.getByText('Alice'));
      expect(mockSelect).toHaveBeenCalledWith(mockApps[0]);
    });

    it('should call onUpdateStatus when status is changed', () => {
      const mockUpdate = vi.fn();
      render(<KanbanBoard applications={mockApps} onUpdateStatus={mockUpdate} onSelectApp={vi.fn()} />);
      
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'HIRED' } });
      
      expect(mockUpdate).toHaveBeenCalledWith(1, 'HIRED');
    });
  });
});
