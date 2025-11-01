const orchestrator = require('../backend/orchestrator');

describe('Orchestrator', () => {
  it('should run a simple pipeline', async () => {
    const tasks = [{ id: 'test-task' }];
    const results = await orchestrator.runPipeline(tasks);
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('completed');
  });
});
