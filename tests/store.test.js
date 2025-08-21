import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import Store from '../src/components/Store/Store';

// Mock the auth context
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  role: 'player',
  teamId: 'test-team'
};

const MockStore = () => (
  <BrowserRouter>
    <AuthProvider>
      <Store />
    </AuthProvider>
  </BrowserRouter>
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('Store Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  test('renders store header', () => {
    render(<MockStore />);
    expect(screen.getByText('AURFC Store')).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<MockStore />);
    expect(screen.getByText('Merchandise')).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Clubroom')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Group Orders')).toBeInTheDocument();
    expect(screen.getByText('Fundraising')).toBeInTheDocument();
  });

  test('shows cart button', () => {
    render(<MockStore />);
    expect(screen.getByText(/🛒 Cart/)).toBeInTheDocument();
  });

  test('defaults to merchandise section', () => {
    render(<MockStore />);
    expect(screen.getByText('Club Merchandise')).toBeInTheDocument();
  });

  test('can switch between sections', () => {
    render(<MockStore />);
    
    // Click on Registration tab
    fireEvent.click(screen.getByText('Registration'));
    expect(screen.getByText('Membership & Registration')).toBeInTheDocument();
    
    // Click on Clubroom tab
    fireEvent.click(screen.getByText('Clubroom'));
    expect(screen.getByText('Clubroom Menu')).toBeInTheDocument();
  });

  test('cart starts empty', () => {
    render(<MockStore />);
    const cartButton = screen.getByText(/🛒 Cart/);
    expect(cartButton).toHaveTextContent('🛒 Cart (0 items)');
  });

  test('can add items to cart', () => {
    render(<MockStore />);
    
    // Find and click an add to cart button
    const addButtons = screen.getAllByText('Add to Cart');
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      
      // Check if cart count increased
      const cartButton = screen.getByText(/🛒 Cart/);
      expect(cartButton).toHaveTextContent('🛒 Cart (1 items)');
    }
  });
});

describe('Store Navigation', () => {
  test('navigation tabs are clickable', () => {
    render(<MockStore />);
    
    const tabs = [
      'Merchandise',
      'Registration', 
      'Clubroom',
      'Events',
      'Group Orders',
      'Fundraising'
    ];
    
    tabs.forEach(tabText => {
      const tab = screen.getByText(tabText);
      expect(tab).toBeInTheDocument();
      expect(tab.closest('button')).toBeInTheDocument();
    });
  });
});

describe('Store Responsiveness', () => {
  test('store container has proper styling classes', () => {
    render(<MockStore />);
    const storeContainer = screen.getByText('AURFC Store').closest('.store-container');
    expect(storeContainer).toBeInTheDocument();
  });
});
