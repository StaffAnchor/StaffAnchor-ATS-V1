import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

export function useLocationDropdowns() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/locations/countries`)
      .then(res => {
        setCountries(res.data.data);
      })
      .catch(err => {
        console.error('Error fetching countries:', err);
        setCountries([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchStates = async (country) => {
    setLoading(true);
    setStates([]);
    setCities([]);
    try {
      const res = await axios.post(`${API_URL}/api/locations/states`, { country });
      setStates(res.data.data);
    } catch (err) {
      console.error('Error fetching states:', err);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (country, state) => {
    setLoading(true);
    setCities([]);
    try {
      const res = await axios.post(`${API_URL}/api/locations/cities`, { country, state });
      setCities(res.data.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  return { countries, states, cities, fetchStates, fetchCities, loading };
} 