import { describe, it, expect } from 'vitest';
import { GoogleAuth } from 'google-auth-library';

describe('Google Cloud TTS API with Service Account', () => {
  it('should validate service account credentials by making a test request', async () => {
    const credentials = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    expect(credentials).toBeDefined();
    expect(credentials).not.toBe('');

    // Parse credentials JSON
    const credentialsJson = JSON.parse(credentials!);
    expect(credentialsJson.type).toBe('service_account');
    expect(credentialsJson.project_id).toBeDefined();
    expect(credentialsJson.private_key).toBeDefined();
    expect(credentialsJson.client_email).toBeDefined();

    // Create Google Auth client
    const auth = new GoogleAuth({
      credentials: credentialsJson,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    expect(accessToken.token).toBeDefined();
    expect(accessToken.token).not.toBe('');

    // Test API by listing voices
    const response = await fetch(
      'https://texttospeech.googleapis.com/v1/voices',
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
    }
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.voices).toBeDefined();
    expect(Array.isArray(data.voices)).toBe(true);
    expect(data.voices.length).toBeGreaterThan(0);

    // Verify Spanish WaveNet voices are available
    const spanishWaveNetVoices = data.voices.filter((voice: any) =>
      voice.languageCodes.some((lang: string) => lang.startsWith('es')) &&
      voice.name.includes('Wavenet')
    );
    expect(spanishWaveNetVoices.length).toBeGreaterThan(0);

    console.log(`✅ Google Cloud TTS service account is valid. Found ${spanishWaveNetVoices.length} Spanish WaveNet voices.`);
  }, 15000); // 15 second timeout
});
