#!/usr/bin/env node
require('dotenv/config');

(async () => {
  try {
    console.log('Testing API endpoint...\n');
    
    const response = await fetch('http://localhost:4173/api/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyUrl: 'https://seomonitor.com' })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    console.log('✓ API Response Received\n');
    console.log(`Source: ${data.metadata.source}`);
    console.log(`Company: ${data.context.company_name}`);
    console.log(`Industry: ${data.context.industry}`);
    console.log(`Description: ${data.context.description.substring(0, 100)}...`);
    
    if (data.metadata.urlContextMetadata) {
      console.log(`\nURL Status: ${data.metadata.urlContextMetadata.urlMetadata[0].urlRetrievalStatus}`);
    }
    
    if (data.metadata.source === 'gemini-context-extraction') {
      console.log('\n✅ SUCCESS: Using real Gemini data!');
    } else {
      console.log('\n⚠️  WARNING: Using fallback data');
      if (data.metadata.error) {
        console.log(`Error: ${data.metadata.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
