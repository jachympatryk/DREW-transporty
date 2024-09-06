// routificClient.js

export default class RoutificClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.routific.com/v1/vrp';
  }

  async calculateTransports(bodyData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        console.log('Route created');
      }

      return await response.json();
    } catch (error) {
      console.error('Error during request:', error);
      throw error;
    }
  }
}
