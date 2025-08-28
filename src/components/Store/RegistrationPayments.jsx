import React, { useState, useEffect } from 'react';

const RegistrationPayments = ({ addToCart, cart }) => {
  const [registrationOptions, setRegistrationOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);

  useEffect(() => {
    loadMembershipOptions();
  }, []);

  const loadMembershipOptions = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockMemberships = [
        {
          id: 'membership-junior',
          name: 'Junior Membership',
          description: 'For players under 18 years old',
          price: 150.00,
          duration: 'annual',
          benefits: [
            'Access to all training sessions',
            'Match participation',
            'Club facilities access',
            'Insurance coverage',
            'Tournament entry fees included'
          ],
          ageGroup: 'Under 18',
          maxAge: 17,
          inStock: true
        },
        {
          id: 'membership-senior',
          name: 'Senior Membership',
          description: 'For players 18 years and older',
          price: 200.00,
          duration: 'annual',
          benefits: [
            'Access to all training sessions',
            'Match participation',
            'Club facilities access',
            'Insurance coverage',
            'Tournament entry fees included',
            'Voting rights at AGM'
          ],
          ageGroup: '18+',
          minAge: 18,
          inStock: true
        },
        {
          id: 'membership-family',
          name: 'Family Membership',
          description: 'For families with multiple players',
          price: 350.00,
          duration: 'annual',
          benefits: [
            'Up to 3 family members',
            'All junior benefits',
            'All senior benefits',
            'Family discount applied',
            'Priority booking for events'
          ],
          maxMembers: 3,
          inStock: true
        },
        {
          id: 'membership-social',
          name: 'Social Membership',
          description: 'Non-playing membership for supporters',
          price: 50.00,
          duration: 'annual',
          benefits: [
            'Club facilities access',
            'Event participation',
            'Newsletter subscription',
            'Voting rights at AGM'
          ],
          type: 'non-playing',
          inStock: true
        }
      ];

      setRegistrationOptions(mockMemberships);
    } catch (err) {
      console.error('Error loading membership options:', err);
      setError('Failed to load membership options');
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipSelect = (membership) => {
    setSelectedMembership(membership);
  };

  const handleAddToCart = (membership) => {
    const cartItem = {
      ...membership,
      type: 'membership',
      cartId: `membership-${membership.id}`
    };
    addToCart(cartItem);
  };

  const checkEligibility = (membership) => {
    // Since store is now public, all registration options are available
    // In the future, this could be enhanced with age-based logic
    return true;
  };

  const getMembershipStatus = () => {
    // In production, this would check Firestore for current membership status
    return {
      hasActiveMembership: false,
      expiresAt: null,
      type: null
    };
  };

  if (loading) {
    return (
      <div className="registration-container">
        <div className="loading">Loading membership options...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registration-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const membershipStatus = getMembershipStatus();

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h2>Membership & Registration</h2>
        <p>Join AURFC and become part of our rugby community!</p>
        
        {membershipStatus.hasActiveMembership && (
          <div className="current-membership">
            <h3>Current Membership</h3>
            <p>You have an active {membershipStatus.type} membership</p>
            <p>Expires: {membershipStatus.expiresAt}</p>
          </div>
        )}
      </div>

      <div className="membership-options">
        {registrationOptions.map(membership => {
          const isEligible = checkEligibility(membership);
          const isInCart = cart.some(item => 
            item.type === 'membership' && item.id === membership.id
          );

          return (
            <div 
              key={membership.id} 
              className={`membership-card ${selectedMembership?.id === membership.id ? 'selected' : ''} ${!isEligible ? 'ineligible' : ''}`}
              onClick={() => isEligible && handleMembershipSelect(membership)}
            >
              <div className="membership-header">
                <h3 className="membership-name">{membership.name}</h3>
                <div className="membership-price">
                  ${membership.price.toFixed(2)}
                  <span className="duration">/{membership.duration}</span>
                </div>
              </div>
              
              <p className="membership-description">{membership.description}</p>
              
              <div className="membership-details">
                {membership.ageGroup && (
                  <span className="detail-tag">{membership.ageGroup}</span>
                )}
                {membership.maxMembers && (
                  <span className="detail-tag">Up to {membership.maxMembers} members</span>
                )}
                {membership.type && (
                  <span className="detail-tag">{membership.type}</span>
                )}
              </div>
              
              <div className="membership-benefits">
                <h4>Benefits:</h4>
                <ul>
                  {membership.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="membership-actions">
                {!isEligible ? (
                  <div className="ineligible-message">
                    {membership.maxAge && authUser?.age > membership.maxAge && (
                      <p>Age requirement: {membership.maxAge} or younger</p>
                    )}
                    {membership.minAge && authUser?.age < membership.minAge && (
                      <p>Age requirement: {membership.minAge} or older</p>
                    )}
                    {isInCart && (
                      <p>Already in cart</p>
                    )}
                  </div>
                ) : (
                  <button
                    className={`membership-btn ${isInCart ? 'in-cart' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInCart) {
                        // Remove from cart logic would go here
                      } else {
                        handleAddToCart(membership);
                      }
                    }}
                    disabled={!membership.inStock}
                  >
                    {isInCart ? 'In Cart' : 'Select Membership'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedMembership && (
        <div className="membership-summary">
          <h3>Selected Membership: {selectedMembership.name}</h3>
          <p>Price: ${selectedMembership.price.toFixed(2)}</p>
          <p>Duration: {selectedMembership.duration}</p>
          
          <div className="summary-actions">
            <button 
              className="btn-primary"
              onClick={() => handleAddToCart(selectedMembership)}
            >
              Add to Cart
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setSelectedMembership(null)}
            >
              Change Selection
            </button>
          </div>
        </div>
      )}

      <div className="registration-info">
        <h3>Important Information</h3>
        <ul>
          <li>Membership fees are non-refundable</li>
          <li>Membership runs from January 1st to December 31st</li>
          <li>Insurance coverage is included in all playing memberships</li>
          <li>Family memberships can include up to 3 family members</li>
          <li>Social memberships do not include playing privileges</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrationPayments;
