// Debug API to identify CORS issues
import type { ItineraryRequest } from './types';

/**
 * Ultra-minimal fetch for debugging CORS issues
 */
export async function debugFetch(payload: ItineraryRequest) {
  const apiBase = import.meta.env.VITE_API_BASE || '/api';
  const url = `${apiBase}/jobs/itinerary`;
  
  console.log('🔍 Debug Info:');
  console.log('- API Base:', apiBase);
  console.log('- Full URL:', url);
  console.log('- Origin:', window.location.origin);
  console.log('- User Agent:', navigator.userAgent.substring(0, 100));
  
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload),
    mode: 'cors',
    credentials: 'omit'
  };
  
  console.log('📤 Request Options:', requestOptions);
  
  try {
    console.log('🚀 Sending request...');
    const response = await fetch(url, requestOptions);
    
    console.log('✅ Response received:');
    console.log('- Status:', response.status);
    console.log('- OK:', response.ok);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Response data:', data);
      return data;
    } else {
      const text = await response.text();
      console.error('❌ Error response:', text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  } catch (error) {
    console.error('💥 Fetch error:', error);
    console.error('Error name:', (error as Error).name);
    console.error('Error message:', (error as Error).message);
    throw error;
  }
}

/**
 * Test CORS with minimal request
 */
export async function testCORS() {
  console.log('🧪 Testing CORS...');
  
  try {
    await debugFetch({
      destination: 'Paris',
      travelers_count: 2,
      duration_days: 3,
      start_date: '2024-12-01',
      end_date: '2024-12-03'
    });
    console.log('✅ CORS test successful!');
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
}