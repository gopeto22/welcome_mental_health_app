// Vercel Edge Function - Audio Cache Proxy
export const config = {
  runtime: 'edge',
};

const BACKEND_URL = 'http://ec2-13-40-70-207.eu-west-2.compute.amazonaws.com';

export default async function handler(request: Request) {
  try {
    // Extract the filename from the URL
    // URL will be like: /api/audio/cache/abc123.mp3
    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop(); // Get the last part
    
    // Forward the request to EC2 backend
    const response = await fetch(`${BACKEND_URL}/audio/cache/${filename}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Audio file not found', file: filename }), {
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
