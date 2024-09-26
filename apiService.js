import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const fetchHello = async () => {
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
