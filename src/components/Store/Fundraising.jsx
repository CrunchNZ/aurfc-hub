import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Fundraising.css';

const Fundraising = ({ addToCart, user, cart }) => {
  const { user: authUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockCampaigns = [
        {
          id: 'campaign-1',
          name: 'New Training Equipment',
          description: 'Help us purchase new training equipment for all teams',
          goal: 5000.00,
          raised: 3200.00,
          category: 'equipment',
          image: 'https://via.placeholder.com/300x200?text=Training+Equipment',
          deadline: '2024-04-30',
          inStock: true,
          teamId: null, // Available to all teams
          rewards: [
            { amount: 25, description: 'Thank you card' },
            { amount: 50, description: 'Club sticker pack' },
            { amount: 100, description: 'Club t-shirt' },
            { amount: 250, description: 'Training session with coaches' },
            { amount: 500, description: 'VIP match day experience' }
          ],
          updates: [
            'Equipment list finalized - $3,200 raised so far!',
            'Training cones and agility ladders ordered',
            'New tackle bags arriving next week'
          ]
        },
        {
          id: 'campaign-2',
          name: 'Junior Development Fund',
          description: 'Support junior player development and coaching programs',
          goal: 3000.00,
          raised: 1800.00,
          category: 'development',
          image: 'https://via.placeholder.com/300x200?text=Junior+Development',
          deadline: '2024-05-15',
          inStock: true,
          teamId: 'junior-team',
          rewards: [
            { amount: 20, description: 'Junior supporter certificate' },
            { amount: 50, description: 'Junior team photo' },
            { amount: 100, description: 'Meet the team session' },
            { amount: 200, description: 'Coaching clinic participation' }
          ],
          updates: [
            'New coaching resources purchased',
            'Skills development program launched',
            'Junior tournament entry fees covered'
          ]
        },
        {
          id: 'campaign-3',
          name: 'Clubhouse Renovation',
          description: 'Modernize our clubhouse facilities for members',
          goal: 15000.00,
          raised: 8500.00,
          category: 'facilities',
          image: 'https://via.placeholder.com/300x200?text=Clubhouse+Renovation',
          deadline: '2024-06-30',
          inStock: true,
          teamId: null,
          rewards: [
            { amount: 100, description: 'Name on donor wall' },
            { amount: 250, description: 'VIP clubhouse access' },
            { amount: 500, description: 'Private function room booking' },
            { amount: 1000, description: 'Lifetime membership discount' }
          ],
          updates: [
            'New kitchen equipment installed',
            'Bathroom renovations completed',
            'Meeting room upgrades in progress'
          ]
        },
        {
          id: 'campaign-4',
          name: 'Tournament Travel Fund',
          description: 'Help teams travel to regional and national tournaments',
          goal: 8000.00,
          raised: 4200.00,
          category: 'travel',
          image: 'https://via.placeholder.com/300x200?text=Tournament+Travel',
          deadline: '2024-04-15',
          inStock: true,
          teamId: null,
          rewards: [
            { amount: 50, description: 'Tournament photo album' },
            { amount: 100, description: 'Team travel video' },
            { amount: 200, description: 'Tournament report and highlights' },
            { amount: 500, description: 'Travel with the team' }
          ],
          updates: [
            'Regional tournament registration paid',
            'Accommodation booked for national finals',
            'Transportation arranged for away games'
          ]
        }
      ];

      setCampaigns(mockCampaigns);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (campaign, amount) => {
    const cartItem = {
      ...campaign,
      type: 'donation',
      price: parseFloat(amount),
      cartId: `donation-${campaign.id}-${amount}`
    };
    addToCart(cartItem);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesFilter = filter === 'all' || campaign.category === filter;
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'equipment', 'development', 'facilities', 'travel'];

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getCampaignStatus = (campaign) => {
    const progress = getProgressPercentage(campaign.raised, campaign.goal);
    if (progress >= 100) return 'completed';
    if (progress >= 75) return 'nearly-complete';
    if (progress >= 50) return 'halfway';
    if (progress >= 25) return 'quarter-way';
    return 'just-started';
  };

  const getStatusText = (campaign) => {
    const status = getCampaignStatus(campaign);
    switch (status) {
      case 'completed':
        return 'Goal Achieved!';
      case 'nearly-complete':
        return 'Almost There!';
      case 'halfway':
        return 'Halfway There!';
      case 'quarter-way':
        return 'Making Progress!';
      default:
        return 'Just Started';
    }
  };

  const checkEligibility = (campaign) => {
    if (!authUser) return false;
    
    // Check team restrictions
    if (campaign.teamId && authUser.teamId !== campaign.teamId) {
      return false;
    }

    return true;
  };

  const formatDeadline = (date) => {
    const deadline = new Date(date);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Campaign Ended';
    if (diffDays === 0) return 'Ends Today';
    if (diffDays === 1) return 'Ends Tomorrow';
    return `${diffDays} days left`;
  };

  const handleDonationSubmit = (campaign) => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      return;
    }
    
    handleAddToCart(campaign, donationAmount);
    setDonationAmount('');
    setSelectedCampaign(null);
  };

  if (loading) {
    return (
      <div className="fundraising-container">
        <div className="loading">Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundraising-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="fundraising-container">
      <div className="fundraising-header">
        <h2>Fundraising Campaigns</h2>
        <p>Support AURFC and help us grow our rugby community!</p>
        <div className="fundraising-info">
          <p>💝 Every donation makes a difference</p>
          <p>🎁 Exclusive rewards for supporters</p>
          <p>📊 Transparent progress tracking</p>
        </div>
      </div>

      <div className="fundraising-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="campaigns-grid">
        {filteredCampaigns.map(campaign => {
          const status = getCampaignStatus(campaign);
          const statusText = getStatusText(campaign);
          const isEligible = checkEligibility(campaign);
          const progressPercentage = getProgressPercentage(campaign.raised, campaign.goal);
          const deadlineText = formatDeadline(campaign.deadline);

          return (
            <div key={campaign.id} className={`campaign-card ${status} ${!isEligible ? 'ineligible' : ''}`}>
              <div className="campaign-image">
                <img src={campaign.image} alt={campaign.name} />
                <div className={`campaign-status ${status}`}>
                  {statusText}
                </div>
              </div>
              
              <div className="campaign-details">
                <h3 className="campaign-name">{campaign.name}</h3>
                <p className="campaign-description">{campaign.description}</p>
                
                <div className="campaign-progress">
                  <div className="progress-header">
                    <span className="raised">${campaign.raised.toFixed(0)}</span>
                    <span className="goal">of ${campaign.goal.toFixed(0)} goal</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{progressPercentage.toFixed(1)}% complete</span>
                </div>
                
                <div className="campaign-deadline">
                  <span className="deadline-label">Campaign ends:</span>
                  <span className={`deadline-text ${deadlineText.includes('Ended') ? 'ended' : ''}`}>
                    {deadlineText}
                  </span>
                </div>
                
                <div className="campaign-rewards">
                  <h4>Rewards:</h4>
                  <div className="rewards-list">
                    {campaign.rewards.map((reward, index) => (
                      <div key={index} className="reward-item">
                        <span className="reward-amount">${reward.amount}+</span>
                        <span className="reward-description">{reward.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="campaign-updates">
                  <h4>Latest Updates:</h4>
                  <ul>
                    {campaign.updates.map((update, index) => (
                      <li key={index}>{update}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="campaign-actions">
                  {!isEligible ? (
                    <div className="ineligible-message">
                      {campaign.teamId && authUser?.teamId !== campaign.teamId && (
                        <p>This campaign is restricted to {campaign.teamId} members</p>
                      )}
                    </div>
                  ) : (
                    <button
                      className="donate-btn"
                      onClick={() => setSelectedCampaign(campaign)}
                      disabled={!campaign.inStock || deadlineText.includes('Ended')}
                    >
                      {deadlineText.includes('Ended') ? 'Campaign Ended' : 'Donate Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="no-results">
          <p>No campaigns found matching your criteria.</p>
        </div>
      )}

      {selectedCampaign && (
        <div className="donation-modal">
          <div className="donation-content">
            <div className="donation-header">
              <h3>Donate to {selectedCampaign.name}</h3>
              <button 
                className="close-button" 
                onClick={() => setSelectedCampaign(null)}
              >
                ×
              </button>
            </div>
            
            <div className="donation-form">
              <div className="campaign-summary">
                <p>{selectedCampaign.description}</p>
                <div className="campaign-progress-summary">
                  <span>${selectedCampaign.raised.toFixed(0)} raised of ${selectedCampaign.goal.toFixed(0)} goal</span>
                </div>
              </div>
              
              <div className="donation-amount">
                <label htmlFor="donation-amount">Donation Amount ($):</label>
                <input
                  type="number"
                  id="donation-amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />
              </div>
              
              <div className="donation-rewards">
                <h4>Available Rewards:</h4>
                <div className="rewards-preview">
                  {selectedCampaign.rewards
                    .filter(reward => parseFloat(donationAmount) >= reward.amount)
                    .map((reward, index) => (
                      <div key={index} className="reward-preview">
                        <span className="reward-amount">${reward.amount}+</span>
                        <span className="reward-description">{reward.description}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="donation-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedCampaign(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handleDonationSubmit(selectedCampaign)}
                  disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fundraising-info">
        <h3>Fundraising Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>💳 Payment Methods</h4>
            <p>Secure online payments via Stripe</p>
            <p>Credit/debit cards accepted</p>
            <p>Bank transfers available</p>
          </div>
          
          <div className="info-item">
            <h4>🧾 Tax Receipts</h4>
            <p>Automatic tax receipts for donations</p>
            <p>Charitable status pending</p>
            <p>Keep receipts for tax purposes</p>
          </div>
          
          <div className="info-item">
            <h4>🎁 Rewards & Recognition</h4>
            <p>Exclusive rewards for supporters</p>
            <p>Recognition on donor wall</p>
            <p>Special access to events</p>
          </div>
          
          <div className="info-item">
            <h4>❓ Questions?</h4>
            <p>Contact the fundraising committee</p>
            <p>Email: fundraising@aurfc.co.nz</p>
            <p>Phone: (09) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fundraising;
