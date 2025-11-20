const child = require('child_process');

test('cost-alert exits 0 when no SMTP_URL', done => {
  const env = {...process.env};
  delete env.SMTP_URL;
  
  const p = child.spawn('node', ['services/cost-alert/index.js'], {env});
  p.on('exit', code => {
    expect(code).toBe(0);
    done();
  });
});

