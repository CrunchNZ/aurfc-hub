/**
 * Financial Management Service Tests
 * Tests all financial operations including invoicing, payments, and fundraising
 */

import { 
  createInvoice, 
  sendInvoice, 
  recordPayment, 
  getUserInvoices, 
  getOverdueInvoices,
  createFundraisingCampaign,
  recordDonation,
  getFundraisingCampaign,
  getActiveFundraisingCampaigns,
  getUserFinancialSummary,
  getSystemFinancialSummary,
  PAYMENT_STATUS,
  INVOICE_STATUS,
  PAYMENT_METHODS
} from '../src/services/financial';

// Import the global mocks
import {
  mockCollection,
  mockDoc,
  mockGetDoc,
  mockGetDocs,
  mockAddDoc,
  mockUpdateDoc,
  mockServerTimestamp,
  setupFirebaseMocks
} from './firebase-mock';

describe('Financial Management Service', () => {
  beforeEach(() => {
    setupFirebaseMocks();
  });

  describe('Invoice Management', () => {
    test('should create invoice with junior discount', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockResolvedValue({ id: 'invoice123' });
      mockDoc.mockReturnValue('mockDocRef');
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const invoiceData = {
        userId: 'user123',
        userRole: 'junior',
        amount: 10000, // £100.00
        description: 'Training fees',
        dueDate: new Date('2024-12-31'),
        items: [{ description: 'Training fee', amount: 10000 }]
      };

      const result = await createInvoice(invoiceData);
      
      expect(result).toBe('invoice123');
      expect(mockAddDoc).toHaveBeenCalledWith('mockCollectionRef', expect.objectContaining({
        userId: 'user123',
        userRole: 'junior',
        amount: 8000, // £80.00 after 20% discount
        originalAmount: 10000,
        discount: 2000,
        status: INVOICE_STATUS.DRAFT
      }));
    });

    test('should create invoice without discount for adults', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockResolvedValue({ id: 'invoice456' });
      mockDoc.mockReturnValue('mockDocRef');
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const invoiceData = {
        userId: 'user456',
        userRole: 'adult',
        amount: 10000, // £100.00
        description: 'Training fees',
        dueDate: new Date('2024-12-31'),
        items: [{ description: 'Training fee', amount: 10000 }]
      };

      const result = await createInvoice(invoiceData);
      
      expect(result).toBe('invoice456');
      expect(mockAddDoc).toHaveBeenCalledWith('mockCollectionRef', expect.objectContaining({
        userId: 'user456',
        userRole: 'adult',
        amount: 10000, // £100.00 (no discount)
        originalAmount: 10000,
        discount: 0,
        status: INVOICE_STATUS.DRAFT
      }));
    });

    test('should send invoice', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockUpdateDoc.mockResolvedValue();
      mockDoc.mockReturnValue('mockDocRef');
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await sendInvoice('invoice123');
      
      expect(result).toBeUndefined(); // sendInvoice doesn't return anything
      expect(mockUpdateDoc).toHaveBeenCalledWith('mockDocRef', {
        status: INVOICE_STATUS.SENT,
        sentAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should record payment', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockResolvedValue({ id: 'payment123' });
      mockUpdateDoc.mockResolvedValue();
      mockDoc.mockReturnValue('mockDocRef');
      mockCollection.mockReturnValue('mockCollectionRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ amount: 8000, status: INVOICE_STATUS.SENT })
      });
      
      const paymentData = {
        amount: 8000, // £80.00
        method: PAYMENT_METHODS.BANK_TRANSFER,
        transactionId: 'REF123'
      };

      const result = await recordPayment('invoice123', paymentData);
      
      expect(result).toBe('payment123');
      expect(mockAddDoc).toHaveBeenCalledWith('mockCollectionRef', expect.objectContaining({
        invoiceId: 'invoice123',
        amount: 8000,
        method: PAYMENT_METHODS.BANK_TRANSFER,
        transactionId: 'REF123',
        status: PAYMENT_STATUS.COMPLETED
      }));
      expect(mockUpdateDoc).toHaveBeenCalledWith('mockDocRef', {
        status: INVOICE_STATUS.PAID,
        paidAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should get user invoices', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      const mockInvoices = [
        { id: 'inv1', data: () => ({ amount: 8000, status: INVOICE_STATUS.PAID }) },
        { id: 'inv2', data: () => ({ amount: 10000, status: INVOICE_STATUS.PENDING }) }
      ];
      mockGetDocs.mockResolvedValue({ docs: mockInvoices });
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await getUserInvoices('user123');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('inv1');
      expect(result[1].id).toBe('inv2');
    });

    test('should get overdue invoices', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      const mockInvoices = [
        { id: 'inv1', data: () => ({ amount: 8000, dueDate: new Date('2024-01-01') }) }
      ];
      mockGetDocs.mockResolvedValue({ docs: mockInvoices });
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await getOverdueInvoices();
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('inv1');
    });
  });

  describe('Fundraising Management', () => {
    test('should create fundraising campaign', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockResolvedValue({ id: 'campaign123' });
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const campaignData = {
        title: 'New Equipment Fund',
        description: 'Help us buy new training equipment',
        targetAmount: 50000, // £500.00
        endDate: new Date('2024-12-31'),
        createdBy: 'coach123'
      };

      const result = await createFundraisingCampaign(campaignData);
      
      expect(result).toBe('campaign123');
      expect(mockAddDoc).toHaveBeenCalledWith('mockCollectionRef', expect.objectContaining({
        title: 'New Equipment Fund',
        description: 'Help us buy new training equipment',
        targetAmount: 50000,
        currentAmount: 0,
        status: 'active'
      }));
    });

    test('should record donation', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockResolvedValue({ id: 'donation123' });
      mockUpdateDoc.mockResolvedValue();
      mockDoc.mockReturnValue('mockDocRef');
      mockCollection.mockReturnValue('mockCollectionRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ currentAmount: 10000, targetAmount: 50000 })
      });
      
      const donationData = {
        donorId: 'donor123',
        donorName: 'John Doe',
        amount: 2500, // £25.00
        anonymous: false
      };

      const result = await recordDonation('campaign123', donationData);
      
      expect(result).toBe('donation123');
      expect(mockAddDoc).toHaveBeenCalledWith('mockCollectionRef', expect.objectContaining({
        campaignId: 'campaign123',
        donorId: 'donor123',
        amount: 2500,
        donorName: 'John Doe',
        anonymous: false
      }));
    });

    test('should get fundraising campaign with donations', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      const mockCampaign = {
        exists: () => true,
        data: () => ({
          title: 'Test Campaign',
          targetAmount: 50000,
          currentAmount: 25000
        })
      };
      const mockDonations = [
        { id: 'don1', data: () => ({ amount: 15000, donorName: 'Donor 1' }) },
        { id: 'don2', data: () => ({ amount: 10000, donorName: 'Donor 2' }) }
      ];
      mockGetDoc.mockResolvedValue(mockCampaign);
      mockGetDocs.mockResolvedValue({ docs: mockDonations });
      mockDoc.mockReturnValue('mockDocRef');
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await getFundraisingCampaign('campaign123');
      
      expect(result.title).toBe('Test Campaign');
      expect(result.donations).toHaveLength(2);
      expect(result.donations[0].amount).toBe(15000);
    });

    test('should get active fundraising campaigns', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      const mockCampaigns = [
        { id: 'camp1', data: () => ({ title: 'Campaign 1', status: 'active' }) },
        { id: 'camp2', data: () => ({ title: 'Campaign 2', status: 'active' }) }
      ];
      mockGetDocs.mockResolvedValue({ docs: mockCampaigns });
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await getActiveFundraisingCampaigns();
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Campaign 1');
      expect(result[1].title).toBe('Campaign 2');
    });
  });

  describe('Financial Summaries', () => {
    test('should get user financial summary', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      const mockInvoices = [
        { id: 'inv1', data: () => ({ amount: 8000, status: INVOICE_STATUS.PAID }) },
        { id: 'inv2', data: () => ({ amount: 10000, status: INVOICE_STATUS.PENDING }) }
      ];
      mockGetDocs.mockResolvedValue({ docs: mockInvoices });
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await getUserFinancialSummary('user123');
      
      expect(result.totalInvoiced).toBe(18000);
      expect(result.totalPaid).toBe(8000);
      expect(result.totalOutstanding).toBe(10000);
    });

    test('should get system financial summary', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      const mockInvoices = [
        { id: 'inv1', data: () => ({ amount: 8000, status: INVOICE_STATUS.PAID }) },
        { id: 'inv2', data: () => ({ amount: 10000, status: INVOICE_STATUS.PENDING }) }
      ];
      const mockPayments = [
        { id: 'pay1', data: () => ({ amount: 8000 }) }
      ];
      const mockDonations = [
        { id: 'don1', data: () => ({ amount: 15000 }) },
        { id: 'don2', data: () => ({ amount: 10000 }) }
      ];
      mockGetDocs
        .mockResolvedValueOnce({ docs: mockInvoices }) // First call for invoices
        .mockResolvedValueOnce({ docs: mockPayments }) // Second call for payments
        .mockResolvedValueOnce({ docs: mockDonations }); // Third call for donations
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const result = await getSystemFinancialSummary();
      
      expect(result.totalInvoiced).toBe(18000);
      expect(result.totalDonations).toBe(25000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invoice creation errors', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockRejectedValue(new Error('Database error'));
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const invoiceData = {
        userId: 'user123',
        userRole: 'adult',
        amount: 10000,
        description: 'Training fees',
        dueDate: new Date('2024-12-31'),
        items: [{ description: 'Training fee', amount: 10000 }]
      };

      await expect(createInvoice(invoiceData)).rejects.toThrow('Failed to create invoice');
    });

    test('should handle payment recording errors', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockAddDoc.mockRejectedValue(new Error('Database error'));
      mockCollection.mockReturnValue('mockCollectionRef');
      
      const paymentData = {
        amount: 8000,
        method: PAYMENT_METHODS.BANK_TRANSFER,
        transactionId: 'REF123'
      };

      await expect(recordPayment('invoice123', paymentData)).rejects.toThrow('Failed to record payment');
    });

    test('should handle campaign not found', async () => {
      // Setup mocks for this specific test - override defaults AFTER setupFirebaseMocks
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockDoc.mockReturnValue('mockDocRef');
      
      await expect(getFundraisingCampaign('nonexistent')).rejects.toThrow('Failed to get fundraising campaign');
    });
  });

  describe('Constants and Enums', () => {
    test('should export correct payment statuses', () => {
      expect(PAYMENT_STATUS).toEqual({
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded',
        CANCELLED: 'cancelled'
      });
    });

    test('should export correct invoice statuses', () => {
      expect(INVOICE_STATUS).toEqual({
        DRAFT: 'draft',
        SENT: 'sent',
        PAID: 'paid',
        OVERDUE: 'overdue',
        CANCELLED: 'cancelled'
      });
    });

    test('should export correct payment methods', () => {
      expect(PAYMENT_METHODS).toEqual({
        CARD: 'card',
        BANK_TRANSFER: 'bank_transfer',
        CASH: 'cash',
        CHEQUE: 'cheque'
      });
    });
  });
});
