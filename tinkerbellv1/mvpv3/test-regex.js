const text = '```json\n{"company_name": "SEOmonitor"}\n```';

console.log('Original text:');
console.log(text);
console.log('\n');

// Test regex extraction
const match = text.match(/```json\s*([\s\S]*?)\s*```/);
if (match && match[1]) {
  console.log('Extracted JSON:');
  console.log(match[1]);
  console.log('\n');
  
  try {
    const parsed = JSON.parse(match[1]);
    console.log('Parsed successfully:');
    console.log(parsed);
  } catch (err) {
    console.error('Parse error:', err.message);
  }
} else {
  console.log('NO MATCH');
}
