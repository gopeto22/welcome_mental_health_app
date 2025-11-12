// Vercel Edge Function - Audio File Proxy
export const config = {
  runtime: 'edge',
};

const BACKEND_URL = 'http://ec2-13-40-70-207.eu-west-2.compute.amazonaws.com';

export default async function handler(request: Request) {
  try {
    // Extract the audio filename from the URL
    const url = new URL(request.url);
    const audioPath = url.pathname; // e.g., /api/audio/abc123.mp3
    
    // Remove /api prefix to get the backend path
    const backendPath = audioPath.replace('/api', '');
    
    // Forward the request to EC2 backend
    const response = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Audio file not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return the audio file
    const audioBuffer = await response.arrayBuffer();
    
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Audio proxy failed', details: errorMessage }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
