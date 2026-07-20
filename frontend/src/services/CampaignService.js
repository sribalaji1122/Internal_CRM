import api from './api';

// Encapsulates Campaign REST calls
const CampaignService = {
  // Get all campaigns (supports search, filters, pagination, sort)
  getCampaigns(params) {
    return api.get('/campaigns', { params });
  },

  // Get a single campaign by ID
  getCampaign(id) {
    return api.get(`/campaigns/${id}`);
  },

  // Create a new campaign
  createCampaign(campaignData) {
    return api.post('/campaigns', campaignData);
  },

  // Update an existing campaign
  updateCampaign(id, campaignData) {
    return api.put(`/campaigns/${id}`, campaignData);
  },

  // Delete a campaign
  deleteCampaign(id) {
    return api.delete(`/campaigns/${id}`);
  }
};

export default CampaignService;
