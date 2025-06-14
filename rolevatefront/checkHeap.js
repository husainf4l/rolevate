console.log(`Max heap size: ${require("v8").getHeapStatistics().heap_size_limit / (1024 * 1024)} MB`);
