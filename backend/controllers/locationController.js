const locationInfo = require('../config/locations');

// Get all countries
const getCountries = async (req, res) => {
  try {
    const countries = locationInfo
      .map(country => country.name)
      .sort();
    return res.json({ data: countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

// Get states for a country
const getStates = async (req, res) => {
  try {
    const { country } = req.body;
    if (!country) {
      return res.status(400).json({ error: 'Country is required' });
    }
    
    // Find the country in our data
    const countryData = locationInfo.find(c => c.name === country);
    
    if (!countryData || !countryData.states) {
      return res.json({ data: [] });
    }
    
    const states = countryData.states
      .map(state => state.name)
      .sort();
    
    return res.json({ data: states });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

// Get cities for a state in a country
const getCities = async (req, res) => {
  try {
    const { country, state } = req.body;
    if (!country || !state) {
      return res.status(400).json({ error: 'Country and state are required' });
    }
    
    // Find the country in our data
    const countryData = locationInfo.find(c => c.name === country);
    
    if (!countryData || !countryData.states) {
      return res.json({ data: [] });
    }
    
    // Find the state in the country's states
    const stateData = countryData.states.find(s => s.name === state);
    
    if (!stateData || !stateData.cities) {
      return res.json({ data: [] });
    }
    
    const cities = stateData.cities
      .map(city => city.name)
      .sort();
    
    return res.json({ data: cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

module.exports = {
  getCountries,
  getStates,
  getCities
};


