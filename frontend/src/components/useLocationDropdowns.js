import { useState, useEffect } from 'react';
import axios from 'axios';

export function useLocationDropdowns() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('https://countriesnow.space/api/v0.1/countries/iso')
      .then(res => {
        setCountries(res.data.data.map(c => c.name));
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchStates = async (country) => {
    setLoading(true);
    setStates([]);
    setCities([]);
    try {
      const res = await axios.post('https://countriesnow.space/api/v0.1/countries/states', { country });
      setStates(res.data.data.states.map(s => s.name));
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (country, state) => {
    setLoading(true);
    setCities([]);
    try {
      const res = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', { country, state });
      setCities(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return { countries, states, cities, fetchStates, fetchCities, loading };
} 