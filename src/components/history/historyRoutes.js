export const getDeterministicAnalysisRoute = (record) => (
  record?.type === 'deterministic_analysis' && record.id !== undefined
    ? `/deterministic?id=${record.id}`
    : undefined
);
