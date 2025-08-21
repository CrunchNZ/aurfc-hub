# AURFC Store Implementation

## Overview

The AURFC Store is a comprehensive e-commerce solution integrated into the AURFC Hub application. It provides secure payment processing for merchandise, memberships, events, and fundraising campaigns using Stripe as the payment processor.

## Features

### 🛍️ Store Sections

1. **Merchandise** - Club gear and equipment sales
2. **Registration** - Membership fees and annual dues
3. **Clubroom** - Food and beverage ordering
4. **Events** - Ticket sales for club events
5. **Group Orders** - Team meals and social events
6. **Fundraising** - Donation campaigns with rewards

### 🔐 Payment Processing

- **Stripe Integration**: Secure payment processing with Stripe Elements
- **Multiple Payment Methods**: Credit cards, bank transfers
- **Real-time Updates**: Webhook-ready for payment confirmations
- **PCI Compliance**: Secure handling of payment information

### 👥 User Management

- **Role-based Access**: Different permissions for players, coaches, admins
- **Team Restrictions**: Some items limited to specific teams
- **Age Verification**: Membership eligibility based on age groups
- **Purchase History**: Track all user transactions

## Architecture

### Components Structure

```
src/components/Store/
├── Store.jsx                 # Main store container
├── StoreNavigation.jsx       # Navigation between sections
├── Cart.jsx                  # Shopping cart modal
├── CheckoutForm.jsx          # Stripe checkout integration
├── Merchandise.jsx           # Merchandise catalog
├── RegistrationPayments.jsx  # Membership management
├── ClubroomOrdering.jsx      # Food and beverage ordering
├── EventTicketing.jsx        # Event ticket sales
├── Ordering.jsx              # Group order management
├── Fundraising.jsx           # Donation campaigns
├── AdminStore.jsx            # Admin management interface
└── *.css                     # Component-specific styles
```

### Data Flow

1. **User Authentication**: Verify user role and permissions
2. **Item Browsing**: Display items based on user eligibility
3. **Cart Management**: Add/remove items with localStorage persistence
4. **Checkout Process**: Stripe integration for secure payments
5. **Order Confirmation**: Webhook handling for payment success
6. **Inventory Updates**: Real-time stock management

## Setup and Configuration

### Prerequisites

- React 18+ with hooks
- Stripe account and API keys
- Firebase project for backend services
- User authentication system

### Environment Variables

```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
REACT_APP_FIREBASE_CONFIG=your_firebase_config
```

### Stripe Configuration

1. Install Stripe packages:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. Configure Stripe in your app:
   ```javascript
   import { loadStripe } from '@stripe/stripe-js';
   const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
   ```

3. Set up Firebase Functions for webhook handling (recommended)

## Usage

### Basic Store Access

```javascript
import Store from './components/Store/Store';

// Add to your routes
<Route path="/store" element={<Store />} />
```

### Admin Access

```javascript
import AdminStore from './components/Store/AdminStore';

// Admin-only route
<Route path="/admin/store" element={<AdminStore />} />
```

### Cart Management

The store automatically manages cart state with localStorage persistence:

```javascript
// Cart state is managed internally
// Users can add/remove items, adjust quantities
// Cart persists across browser sessions
```

## Customization

### Adding New Store Sections

1. Create new component in `src/components/Store/`
2. Add to `Store.jsx` navigation
3. Update `StoreNavigation.jsx` with new tab
4. Add corresponding CSS file

### Modifying Item Types

1. Update data models in respective components
2. Modify cart handling for new item properties
3. Update admin interface for new fields
4. Adjust Stripe product creation logic

### Styling

All components use CSS modules with responsive design:

- Mobile-first approach
- CSS Grid and Flexbox layouts
- Consistent color scheme and typography
- Smooth animations and transitions

## Testing

### Running Tests

```bash
npm test -- store.test.js
```

### Test Coverage

- Component rendering
- User interactions
- Cart functionality
- Navigation between sections
- Responsive design validation

## Production Deployment

### Security Considerations

- Enable Firebase security rules
- Configure Stripe webhooks
- Implement rate limiting
- Add fraud detection
- Secure admin access

### Performance Optimization

- Lazy load store sections
- Optimize images and assets
- Implement caching strategies
- Monitor Stripe API usage

### Monitoring

- Track payment success rates
- Monitor inventory levels
- User engagement metrics
- Error logging and alerting

## Support and Maintenance

### Common Issues

1. **Stripe Integration**: Ensure API keys are correct
2. **Cart Persistence**: Check localStorage permissions
3. **Role Access**: Verify user permissions in AuthContext
4. **Responsive Design**: Test on various device sizes

### Updates and Maintenance

- Regular Stripe SDK updates
- Security patches and updates
- Performance monitoring and optimization
- User feedback integration

## Contributing

When contributing to the store implementation:

1. Follow existing component patterns
2. Maintain responsive design principles
3. Add comprehensive tests for new features
4. Update documentation for changes
5. Ensure accessibility compliance

## License

This store implementation is part of the AURFC Hub application and follows the same licensing terms.
