import OKLISH from '../src/index';
import { samplePlugin } from '../src/plugins/samplePlugin';
import './idb-test';
import './heavy';

// Initialize OKLISH devtools
OKLISH.init({
  theme: 'dark',
  plugins: [samplePlugin],
});

console.log('[Dev] OKLISH initialized (with sample plugin)');
console.log('[Dev] Try clicking the buttons above to test different panels');
