const child = require('child_process');

test('ingestor exits 0', (done) => {
  const env = { ...process.env, NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '' };
  const p = child.spawn('node', ['services/log-ingestor/index.js'], { env });
  
  p.on('exit', (code) => {
    expect(code).toBe(0);
    done();
  });
});
