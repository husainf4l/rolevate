// Monitor heap size
const v8 = require('v8');

console.log('Starting heap monitoring...');
console.log(`Max heap size: ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} MB`);
console.log(`Total heap size: ${v8.getHeapStatistics().total_heap_size / (1024 * 1024)} MB`);
console.log(`Used heap size: ${v8.getHeapStatistics().used_heap_size / (1024 * 1024)} MB`);
console.log(`Heap size limit: ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} MB`);
