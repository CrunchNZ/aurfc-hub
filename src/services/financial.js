/**
 * Financial Management Service
 * Handles payment processing, invoicing, and financial tracking
 * 
 * Features:
 * - Payment gateway integration (Stripe/GoCardless)
 * - Automated invoicing system
 * - Overdue payment tracking
 * - Junior-specific discounts
 * - Fundraising donation platform
 */

import { db } from '../firebase-config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

// Financial data models
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CHEQUE: 'cheque'
};

/**
 * Safe timestamp conversion
 * @param {Date} date - Date to convert
 * @returns {any} Firestore timestamp or Date
 */
const safeTimestamp = (date) => {
  try {
    if (Timestamp && Timestamp.fromDate) {
      return Timestamp.fromDate(date);
    }
    return date;
  } catch (error) {
    console.warn('Timestamp.fromDate not available, using Date:', error);
    return date;
  }
};

/**
 * Safe current timestamp
 * @returns {any} Current timestamp
 */
const safeCurrentTimestamp = () => {
  try {
    if (Timestamp && Timestamp.now) {
      return Timestamp.now();
    }
    return new Date();
  } catch (error) {
    console.warn('Timestamp.now not available, using Date:', error);
    return new Date();
  }
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data
 * @param {string} invoiceData.userId - User ID
 * @param {string} invoiceData.userRole - User role (junior, adult, coach)
 * @param {number} invoiceData.amount - Invoice amount in pence
 * @param {string} invoiceData.description - Invoice description
 * @param {Date} invoiceData.dueDate - Due date
 * @param {Array} invoiceData.items - Invoice line items
 * @returns {Promise<string>} Invoice ID
 */
export const createInvoice = async (invoiceData) => {
  try {
    // Apply junior discount if applicable
    let finalAmount = invoiceData.amount;
    if (invoiceData.userRole === 'junior') {
      finalAmount = applyJuniorDiscount(invoiceData.amount);
    }

    const invoice = {
      userId: invoiceData.userId,
      userRole: invoiceData.userRole,
      amount: finalAmount,
      originalAmount: invoiceData.amount,
      discount: invoiceData.amount - finalAmount,
      description: invoiceData.description,
      dueDate: safeTimestamp(invoiceData.dueDate),
      items: invoiceData.items || [],
      status: INVOICE_STATUS.DRAFT,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      sentAt: null,
      paidAt: null
    };

    const docRef = await addDoc(collection(db, 'invoices'), invoice);
    
    // Create notification for user
    await createInvoiceNotification(invoiceData.userId, docRef.id, finalAmount);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
};

/**
 * Send invoice to user
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<void>}
 */
export const sendInvoice = async (invoiceId) => {
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      status: INVOICE_STATUS.SENT,
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send email notification (would integrate with email service)
    console.log(`Invoice ${invoiceId} sent to user`);
  } catch (error) {
    console.error('Error sending invoice:', error);
    throw new Error('Failed to send invoice');
  }
};

/**
 * Record payment for invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Object} paymentData - Payment data
 * @param {number} paymentData.amount - Payment amount in pence
 * @param {string} paymentData.method - Payment method
 * @param {string} paymentData.transactionId - External transaction ID
 * @returns {Promise<string>} Payment ID
 */
export const recordPayment = async (invoiceId, paymentData) => {
  try {
    // Create payment record
    const payment = {
      invoiceId,
      amount: paymentData.amount,
      method: paymentData.method,
      transactionId: paymentData.transactionId,
      status: PAYMENT_STATUS.COMPLETED,
      processedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const paymentRef = await addDoc(collection(db, 'payments'), payment);

    // Update invoice status
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      status: INVOICE_STATUS.PAID,
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Create payment confirmation notification
    const invoiceDoc = await getDoc(invoiceRef);
    const invoiceData = invoiceDoc.data();
    await createPaymentNotification(invoiceData.userId, invoiceId, paymentData.amount);

    return paymentRef.id;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw new Error('Failed to record payment');
  }
};

/**
 * Get user's invoices
 * @param {string} userId - User ID
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} Array of invoices
 */
export const getUserInvoices = async (userId, status = null) => {
  try {
    let q = query(
      collection(db, 'invoices'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user invoices:', error);
    throw new Error('Failed to get user invoices');
  }
};

/**
 * Get overdue invoices
 * @returns {Promise<Array>} Array of overdue invoices
 */
export const getOverdueInvoices = async () => {
  try {
    const now = safeCurrentTimestamp();
    const q = query(
      collection(db, 'invoices'),
      where('status', '==', INVOICE_STATUS.SENT),
      where('dueDate', '<', now)
    );

    const querySnapshot = await getDocs(q);
    const overdueInvoices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Update status to overdue
    for (const invoice of overdueInvoices) {
      await updateDoc(doc(db, 'invoices', invoice.id), {
        status: INVOICE_STATUS.OVERDUE,
        updatedAt: serverTimestamp()
      });
    }

    return overdueInvoices;
  } catch (error) {
    console.error('Error getting overdue invoices:', error);
    throw new Error('Failed to get overdue invoices');
  }
};

/**
 * Create fundraising campaign
 * @param {Object} campaignData - Campaign data
 * @param {string} campaignData.title - Campaign title
 * @param {string} campaignData.description - Campaign description
 * @param {number} campaignData.targetAmount - Target amount in pence
 * @param {Date} campaignData.endDate - Campaign end date
 * @returns {Promise<string>} Campaign ID
 */
export const createFundraisingCampaign = async (campaignData) => {
  try {
    const campaign = {
      title: campaignData.title,
      description: campaignData.description,
      targetAmount: campaignData.targetAmount,
      currentAmount: 0,
      endDate: safeTimestamp(campaignData.endDate),
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: campaignData.createdBy
    };

    const docRef = await addDoc(collection(db, 'fundraising_campaigns'), campaign);
    return docRef.id;
  } catch (error) {
    console.error('Error creating fundraising campaign:', error);
    throw new Error('Failed to create fundraising campaign');
  }
};

/**
 * Record donation to fundraising campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} donationData - Donation data
 * @param {string} donationData.donorId - Donor user ID
 * @param {string} donationData.donorName - Donor name
 * @param {number} donationData.amount - Donation amount in pence
 * @param {boolean} donationData.anonymous - Whether donation is anonymous
 * @returns {Promise<string>} Donation ID
 */
export const recordDonation = async (campaignId, donationData) => {
  try {
    // Create donation record
    const donation = {
      campaignId,
      donorId: donationData.donorId,
      donorName: donationData.anonymous ? 'Anonymous' : donationData.donorName,
      amount: donationData.amount,
      anonymous: donationData.anonymous,
      createdAt: serverTimestamp()
    };

    const donationRef = await addDoc(collection(db, 'donations'), donation);

    // Update campaign current amount
    const campaignRef = doc(db, 'fundraising_campaigns', campaignId);
    const campaignDoc = await getDoc(campaignRef);
    const campaignData = campaignDoc.data();
    
    await updateDoc(campaignRef, {
      currentAmount: campaignData.currentAmount + donationData.amount,
      updatedAt: serverTimestamp()
    });

    // Create donation confirmation notification
    await createDonationNotification(donationData.donorId, campaignId, donationData.amount);

    return donationRef.id;
  } catch (error) {
    console.error('Error recording donation:', error);
    throw new Error('Failed to record donation');
  }
};

/**
 * Get fundraising campaign details
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign data
 */
export const getFundraisingCampaign = async (campaignId) => {
  try {
    const campaignDoc = await getDoc(doc(db, 'fundraising_campaigns', campaignId));
    if (!campaignDoc.exists()) {
      throw new Error('Campaign not found');
    }

    const campaignData = campaignDoc.data();
    
    // Get donations for this campaign
    const donationsQuery = query(
      collection(db, 'donations'),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );
    
    const donationsSnapshot = await getDocs(donationsQuery);
    const donations = donationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      ...campaignData,
      donations,
      progress: (campaignData.currentAmount / campaignData.targetAmount) * 100
    };
  } catch (error) {
    console.error('Error getting fundraising campaign:', error);
    throw new Error('Failed to get fundraising campaign');
  }
};

/**
 * Get all active fundraising campaigns
 * @returns {Promise<Array>} Array of active campaigns
 */
export const getActiveFundraisingCampaigns = async () => {
  try {
    const q = query(
      collection(db, 'fundraising_campaigns'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting active fundraising campaigns:', error);
    throw new Error('Failed to get active fundraising campaigns');
  }
};

/**
 * Apply junior discount to amount
 * @param {number} amount - Original amount in pence
 * @returns {number} Discounted amount in pence
 */
const applyJuniorDiscount = (amount) => {
  // 20% discount for junior members
  const discount = Math.round(amount * 0.2);
  return amount - discount;
};

/**
 * Create invoice notification
 * @param {string} userId - User ID
 * @param {string} invoiceId - Invoice ID
 * @param {number} amount - Invoice amount
 */
const createInvoiceNotification = async (userId, invoiceId, amount) => {
  try {
    const notification = {
      userId,
      type: 'invoice',
      title: 'New Invoice',
      message: `You have a new invoice for £${(amount / 100).toFixed(2)}`,
      data: { invoiceId },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
  } catch (error) {
    console.error('Error creating invoice notification:', error);
  }
};

/**
 * Create payment notification
 * @param {string} userId - User ID
 * @param {string} invoiceId - Invoice ID
 * @param {number} amount - Payment amount
 */
const createPaymentNotification = async (userId, invoiceId, amount) => {
  try {
    const notification = {
      userId,
      type: 'payment',
      title: 'Payment Received',
      message: `Payment of £${(amount / 100).toFixed(2)} received`,
      data: { invoiceId },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
  } catch (error) {
    console.error('Error creating payment notification:', error);
  }
};

/**
 * Create donation notification
 * @param {string} userId - User ID
 * @param {string} campaignId - Campaign ID
 * @param {number} amount - Donation amount
 */
const createDonationNotification = async (userId, campaignId, amount) => {
  try {
    const notification = {
      userId,
      type: 'donation',
      title: 'Donation Confirmed',
      message: `Thank you for your donation of £${(amount / 100).toFixed(2)}`,
      data: { campaignId },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
  } catch (error) {
    console.error('Error creating donation notification:', error);
  }
};

/**
 * Get financial summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Financial summary
 */
export const getUserFinancialSummary = async (userId) => {
  try {
    const invoices = await getUserInvoices(userId);
    
    const summary = {
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      overdueAmount: 0,
      invoiceCount: invoices.length,
      paidCount: 0,
      overdueCount: 0
    };

    invoices.forEach(invoice => {
      const amount = invoice.amount || 0;
      summary.totalInvoiced += amount;
      
      if (invoice.status === INVOICE_STATUS.PAID) {
        summary.totalPaid += amount;
        summary.paidCount++;
      } else if (invoice.status === INVOICE_STATUS.OVERDUE) {
        summary.totalOutstanding += amount;
        summary.overdueAmount += amount;
        summary.overdueCount++;
      } else if (invoice.status === INVOICE_STATUS.SENT || invoice.status === INVOICE_STATUS.PENDING) {
        summary.totalOutstanding += amount;
      }
    });

    return summary;
  } catch (error) {
    console.error('Error getting user financial summary:', error);
    throw new Error('Failed to get financial summary');
  }
};

/**
 * Get system-wide financial summary (admin only)
 * @returns {Promise<Object>} System financial summary
 */
export const getSystemFinancialSummary = async () => {
  try {
    const invoicesQuery = query(collection(db, 'invoices'));
    const invoicesSnapshot = await getDocs(invoicesQuery);
    
    const paymentsQuery = query(collection(db, 'payments'));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    const donationsQuery = query(collection(db, 'donations'));
    const donationsSnapshot = await getDocs(donationsQuery);

    const summary = {
      totalInvoiced: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      totalDonations: 0,
      invoiceCount: invoicesSnapshot.size,
      paymentCount: paymentsSnapshot.size,
      donationCount: donationsSnapshot.size
    };

    if (invoicesSnapshot.docs && Array.isArray(invoicesSnapshot.docs)) {
      invoicesSnapshot.docs.forEach(doc => {
        const invoice = doc.data();
        const amount = invoice.amount || 0;
        summary.totalInvoiced += amount;
        
        if (invoice.status === INVOICE_STATUS.PAID) {
          summary.totalCollected += amount;
        } else if (invoice.status === INVOICE_STATUS.SENT || invoice.status === INVOICE_STATUS.OVERDUE) {
          summary.totalOutstanding += amount;
        }
      });
    }

    if (donationsSnapshot.docs && Array.isArray(donationsSnapshot.docs)) {
      donationsSnapshot.docs.forEach(doc => {
        const donation = doc.data();
        const amount = donation.amount || 0;
        summary.totalDonations += amount;
      });
    }

    return summary;
  } catch (error) {
    console.error('Error getting system financial summary:', error);
    throw new Error('Failed to get system financial summary');
  }
};
