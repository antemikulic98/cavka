/**
 * Component Tests for PriceEditModal
 * Tests both Single Day and Date Range modes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PriceEditModal from '@/app/dashboard/components/PriceEditModal';

describe('PriceEditModal Component', () => {
  const mockDayPricing = [
    { date: '2026-06-01', price: 50, label: 'Custom Price', type: 'custom' },
    { date: '2026-06-05', price: 70, label: 'Custom Price', type: 'custom' },
  ];

  const mockProps = {
    isOpen: true,
    editingDate: new Date('2026-06-15'),
    newPrice: '80',
    dayPricing: mockDayPricing,
    onClose: jest.fn(),
    onPriceChange: jest.fn(),
    onSave: jest.fn(),
    onBulkSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    test('should render when isOpen is true', () => {
      render(<PriceEditModal {...mockProps} />);
      expect(screen.getByText('Set Vehicle Pricing')).toBeInTheDocument();
    });

    test('should not render when isOpen is false', () => {
      render(<PriceEditModal {...mockProps} isOpen={false} />);
      expect(screen.queryByText('Set Vehicle Pricing')).not.toBeInTheDocument();
    });

    test('should not render when editingDate is null', () => {
      render(<PriceEditModal {...mockProps} editingDate={null} />);
      expect(screen.queryByText('Set Vehicle Pricing')).not.toBeInTheDocument();
    });
  });

  describe('Mode Toggle', () => {
    test('should default to Single Day mode', () => {
      render(<PriceEditModal {...mockProps} />);
      const singleDayButton = screen.getByText('Single Day');

      expect(singleDayButton).toHaveClass('bg-white', 'text-green-800');
    });

    test('should switch to Date Range mode when clicked', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      expect(dateRangeButton).toHaveClass('bg-white', 'text-green-800');
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    test('should switch back to Single Day mode', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      // Switch to Date Range
      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      // Switch back to Single Day
      const singleDayButton = screen.getByText('Single Day');
      await user.click(singleDayButton);

      expect(singleDayButton).toHaveClass('bg-white', 'text-green-800');
    });
  });

  describe('Single Day Mode', () => {
    test('should display correct date format', () => {
      render(<PriceEditModal {...mockProps} />);
      expect(screen.getByText(/Monday, June 15, 2026/i)).toBeInTheDocument();
    });

    test('should display current rate for date with custom pricing', () => {
      const propsWithCustomPrice = {
        ...mockProps,
        editingDate: new Date('2026-06-01'),
      };
      render(<PriceEditModal {...propsWithCustomPrice} />);

      expect(screen.getByText('Current rate: €50')).toBeInTheDocument();
    });

    test('should display 0 for date without custom pricing', () => {
      render(<PriceEditModal {...mockProps} />);
      expect(screen.getByText('Current rate: €0')).toBeInTheDocument();
    });

    test('should call onSave when Save Price button is clicked', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const saveButton = screen.getByText('Save Price');
      await user.click(saveButton);

      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Date Range Mode', () => {
    test('should display Start Date field', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      expect(screen.getByText('Start Date')).toBeInTheDocument();
      const startDateInput = screen.getByDisplayValue('2026-06-15');
      expect(startDateInput).toHaveAttribute('readonly');
    });

    test('should allow End Date input', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      const endDateInputs = document.querySelectorAll('input[type="date"]');
      const endDateInput = endDateInputs[1] as HTMLInputElement;

      expect(endDateInput).toBeInTheDocument();
      expect(endDateInput.readOnly).toBe(false);
    });

    test('should allow Label input', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      const labelInput = screen.getByPlaceholderText('e.g., Peak Season, Holiday Rate');
      expect(labelInput).toBeInTheDocument();

      await user.type(labelInput, 'Summer Season');
      expect(labelInput).toHaveValue('Summer Season');
    });

    test('should disable Apply button when no end date is selected', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      const applyButton = screen.getByRole('button', { name: /Apply to/i });
      expect(applyButton).toBeDisabled();
    });

    test('should calculate days in range correctly', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      // Switch to Date Range mode
      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      // Get end date input and set value
      const endDateInputs = document.querySelectorAll('input[type="date"]');
      const endDateInput = endDateInputs[1] as HTMLInputElement;

      fireEvent.change(endDateInput, { target: { value: '2026-06-20' } });

      await waitFor(() => {
        expect(screen.getByText('6 days selected')).toBeInTheDocument();
      });
    });

    test('should calculate total revenue correctly', async () => {
      const user = userEvent.setup();
      const propsWithPrice = {
        ...mockProps,
        newPrice: '100',
      };
      render(<PriceEditModal {...propsWithPrice} />);

      // Switch to Date Range mode
      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      // Set end date
      const endDateInputs = document.querySelectorAll('input[type="date"]');
      const endDateInput = endDateInputs[1] as HTMLInputElement;

      fireEvent.change(endDateInput, { target: { value: '2026-06-20' } });

      await waitFor(() => {
        // 6 days * €100 = €600
        expect(screen.getByText(/Total revenue: €600.00/i)).toBeInTheDocument();
      });
    });

    test('should call onBulkSave when Apply button is clicked with end date', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      // Switch to Date Range mode
      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      // Set end date
      const endDateInputs = document.querySelectorAll('input[type="date"]');
      const endDateInput = endDateInputs[1] as HTMLInputElement;
      fireEvent.change(endDateInput, { target: { value: '2026-06-20' } });

      await waitFor(async () => {
        const applyButton = screen.getByRole('button', { name: /Apply to 6 Days/i });
        expect(applyButton).not.toBeDisabled();
        await user.click(applyButton);
      });

      expect(mockProps.onBulkSave).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
        80,
        ''
      );
    });
  });

  describe('Price Input', () => {
    test('should display price input field', () => {
      render(<PriceEditModal {...mockProps} />);

      const priceInput = screen.getByPlaceholderText('0.00');
      expect(priceInput).toBeInTheDocument();
      expect(priceInput).toHaveValue(80);
    });

    test('should call onPriceChange when price is modified', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const priceInput = screen.getByPlaceholderText('0.00');
      await user.clear(priceInput);
      await user.type(priceInput, '120');

      expect(mockProps.onPriceChange).toHaveBeenCalled();
    });

    test('should display € symbol before price input', () => {
      render(<PriceEditModal {...mockProps} />);
      expect(screen.getByText('€')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    test('should display Cancel button', () => {
      render(<PriceEditModal {...mockProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('should change button text based on mode', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      // Single Day mode
      expect(screen.getByText('Save Price')).toBeInTheDocument();

      // Switch to Date Range mode
      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      expect(screen.getByRole('button', { name: /Apply to/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle same start and end date (1 day)', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      const endDateInputs = document.querySelectorAll('input[type="date"]');
      const endDateInput = endDateInputs[1] as HTMLInputElement;

      fireEvent.change(endDateInput, { target: { value: '2026-06-15' } });

      await waitFor(() => {
        expect(screen.getByText('1 days selected')).toBeInTheDocument();
      });
    });

    test('should handle decimal prices', () => {
      const propsWithDecimal = {
        ...mockProps,
        newPrice: '79.95',
      };
      render(<PriceEditModal {...propsWithDecimal} />);

      const priceInput = screen.getByPlaceholderText('0.00');
      expect(priceInput).toHaveValue(79.95);
    });

    test('should handle empty label in Date Range mode', async () => {
      const user = userEvent.setup();
      render(<PriceEditModal {...mockProps} />);

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      const labelInput = screen.getByPlaceholderText('e.g., Peak Season, Holiday Rate');
      expect(labelInput).toHaveValue('');
    });
  });
});
