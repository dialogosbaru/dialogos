import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_TTS_API_KEY || '{}'),
});

async function listSpanishVoices() {
  try {
    const [response] = await client.listVoices({});
    const voices = response.voices || [];
    
    // Filtrar solo voces en español
    const spanishVoices = voices.filter(voice => 
      voice.languageCodes && voice.languageCodes.some(code => code.startsWith('es'))
    );
    
    // Agrupar por país/región
    const voicesByRegion = {};
    
    spanishVoices.forEach(voice => {
      const langCode = voice.languageCodes[0];
      const region = langCode.split('-')[1]; // ES, MX, US, etc.
      
      if (!voicesByRegion[region]) {
        voicesByRegion[region] = [];
      }
      
      voicesByRegion[region].push({
        name: voice.name,
        gender: voice.ssmlGender,
        languageCode: langCode,
        type: voice.name.includes('Neural2') ? 'Neural2' : 
              voice.name.includes('Wavenet') ? 'WaveNet' : 
              voice.name.includes('Studio') ? 'Studio' : 'Standard'
      });
    });
    
    console.log('\n=== VOCES EN ESPAÑOL DISPONIBLES EN GOOGLE CLOUD TTS ===\n');
    
    Object.keys(voicesByRegion).sort().forEach(region => {
      const regionName = {
        'ES': 'España',
        'US': 'Estados Unidos (Latinoamérica)',
        'MX': 'México',
        'AR': 'Argentina',
        'CO': 'Colombia',
        'CL': 'Chile',
        'PE': 'Perú',
        'VE': 'Venezuela'
      }[region] || region;
      
      console.log(`\n📍 ${regionName} (${region})`);
      console.log('─'.repeat(60));
      
      const voices = voicesByRegion[region];
      voices.forEach(voice => {
        const genderIcon = voice.gender === 'MALE' ? '👨' : voice.gender === 'FEMALE' ? '👩' : '⚧';
        console.log(`  ${genderIcon} ${voice.name}`);
        console.log(`     Tipo: ${voice.type} | Género: ${voice.gender} | Código: ${voice.languageCode}`);
      });
    });
    
    console.log(`\n\nTotal de voces en español: ${spanishVoices.length}`);
    console.log(`Regiones disponibles: ${Object.keys(voicesByRegion).length}`);
    
  } catch (error) {
    console.error('Error listing voices:', error);
    process.exit(1);
  }
}

listSpanishVoices();
