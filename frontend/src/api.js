
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api';
export const fetchSalesOverTime = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sales-over-time`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    throw error; 
  }
};

