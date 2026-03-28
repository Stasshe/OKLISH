import OKLISH from '../src/index';
import './idb-test';

// Initialize OKLISH devtools
OKLISH.init({
  theme: 'dark',
  defaultPanel: 'console',
  windowMode: 'floating',
});

console.log('[Dev] OKLISH initialized');
console.log('[Dev] Try clicking the buttons above to test different panels');
