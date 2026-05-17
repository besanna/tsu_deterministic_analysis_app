import { getDeterministicAnalysisRoute } from './historyRoutes';

describe('getDeterministicAnalysisRoute', () => {
  it('builds the deterministic details route for deterministic analysis records', () => {
    expect(getDeterministicAnalysisRoute({
      id: 42,
      type: 'deterministic_analysis'
    })).toBe('/deterministic?id=42');
  });

  it('does not build the legacy loadData analyze route for deterministic analysis records', () => {
    const route = getDeterministicAnalysisRoute({
      id: 42,
      type: 'deterministic_analysis'
    });

    expect(route).not.toContain('/analyze');
    expect(route).not.toContain('loadData');
  });

  it('does not change routing for investment records', () => {
    expect(getDeterministicAnalysisRoute({
      id: 7,
      type: 'investment'
    })).toBeUndefined();
  });
});
