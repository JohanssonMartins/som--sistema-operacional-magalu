import { api } from './src/api';

async function testHistory() {
  try {
    const res = await fetch('http://localhost:3333/api/autoauditoria/history/50');
    const history = await res.json();
    console.log('History for unit 50:');
    console.log(JSON.stringify(history, null, 2));
    
    if (history.length > 0) {
      console.log('\n✅ Success! History found.');
    } else {
      console.log('\n❌ Failed. History is empty.');
    }
  } catch (error) {
    console.error('❌ Error fetching history:', error);
  }
}

testHistory();
