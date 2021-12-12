const runs = process.env.RUNS || 3;

async function runProfiling(name, run) {
  console.log('');
  console.log('####################################################');
  console.log(`WARMUP: Current memory usage: ${currentMemoryUsage({runGarbageCollector: true})} MB`);
  console.log(`WARMUP: ${name} profiling started`);
  const warmupStartTime = Date.now();
  await run();
  console.log(`WARMUP: ${name} profiling finished in ${Date.now() - warmupStartTime}ms`);
  console.log(`WARMUP: Current memory usage (before GC): ${currentMemoryUsage({runGarbageCollector: false})} MB`);
  console.log(`WARMUP: Current memory usage (after GC): ${currentMemoryUsage({runGarbageCollector: true})} MB`);

  for (let i = 1; i <= runs; i += 1) {
    console.log('');
    console.log('####################################################');
    console.log(`RUN ${i}: ${name} profiling started`);
    const startTime = Date.now();
    await run(); // eslint-disable-line no-await-in-loop
    console.log(`RUN ${i}: ${name} profiling finished in ${Date.now() - startTime}ms`);
    console.log(`RUN ${i}: Current memory usage (before GC): ${currentMemoryUsage({runGarbageCollector: false})} MB`);
    console.log(`RUN ${i}: Current memory usage (after GC): ${currentMemoryUsage({runGarbageCollector: true})} MB`);
  }
}

function currentMemoryUsage({runGarbageCollector}) {
  if (runGarbageCollector) global.gc();
  return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
}

module.exports = runProfiling;
