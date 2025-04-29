import axios from 'axios';

const API_BASE_URL = 'https://country-state-city-search-rest-api.p.rapidapi.com/v1';

const headers = {
  'X-RapidAPI-Key': '32592c5f41msh645ed7f0e948df3p13d54ajsnc8885ffe83b9', // 🔐 Replace with your actual key
  'X-RapidAPI-Host': 'country-state-city-search-rest-api.p.rapidapi.com',
};

export const getCountries = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/countries`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

export const getStatesByCountryCode = async (countryCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/states/${countryCode}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching states for ${countryCode}:`, error);
    return [];
  }
};

export const getCitiesByCountryAndState = async (countryCode, stateCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cities/${countryCode}/${stateCode}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching cities for ${stateCode} in ${countryCode}:`, error);
    return [];
  }
};
