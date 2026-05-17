import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import InsightsPanel, { filterInsights } from './InsightsPanel';

const deterministicResults = {
  singleFreq: {
    Segment: {
      Retail: { count: 50, frequency: 0.5 },
      Enterprise: { count: 50, frequency: 0.5 }
    },
    Outcome: {
      Buy: { count: 50, frequency: 0.5 },
      Churn: { count: 50, frequency: 0.5 }
    },
    Region: {
      North: { count: 50, frequency: 0.5 },
      South: { count: 50, frequency: 0.5 }
    },
    Channel: {
      Online: { count: 50, frequency: 0.5 },
      Store: { count: 50, frequency: 0.5 }
    }
  },
  pairFreq: {
    'Segment & Outcome': {
      Retail: {
        Buy: { count: 50, frequency: 0.5 },
        Churn: { count: 0, frequency: 0 }
      },
      Enterprise: {
        Buy: { count: 0, frequency: 0 },
        Churn: { count: 50, frequency: 0.5 }
      }
    },
    'Segment & Region': {
      Retail: {
        North: { count: 40, frequency: 0.4 },
        South: { count: 10, frequency: 0.1 }
      },
      Enterprise: {
        North: { count: 10, frequency: 0.1 },
        South: { count: 40, frequency: 0.4 }
      }
    },
    'Region & Channel': {
      North: {
        Online: { count: 35, frequency: 0.35 },
        Store: { count: 15, frequency: 0.15 }
      },
      South: {
        Online: { count: 15, frequency: 0.15 },
        Store: { count: 35, frequency: 0.35 }
      }
    },
    'Outcome & Channel': {
      Buy: {
        Online: { count: 25, frequency: 0.25 },
        Store: { count: 25, frequency: 0.25 }
      },
      Churn: {
        Online: { count: 25, frequency: 0.25 },
        Store: { count: 25, frequency: 0.25 }
      }
    }
  }
};

const balancedResults = {
  singleFreq: {
    A: {
      Yes: { count: 50, frequency: 0.5 },
      No: { count: 50, frequency: 0.5 }
    },
    B: {
      High: { count: 50, frequency: 0.5 },
      Low: { count: 50, frequency: 0.5 }
    }
  },
  pairFreq: {
    'A & B': {
      Yes: {
        High: { count: 25, frequency: 0.25 },
        Low: { count: 25, frequency: 0.25 }
      },
      No: {
        High: { count: 25, frequency: 0.25 },
        Low: { count: 25, frequency: 0.25 }
      }
    }
  }
};

describe('filterInsights', () => {
  it('returns only directed pairs that pass intensity and capacity thresholds', () => {
    const insights = filterInsights(deterministicResults, {
      mode: 'deterministic',
      features: ['Segment', 'Outcome', 'Region', 'Channel'],
      thresholds: {
        intensity: 0.75,
        capacity: 0.75
      }
    });

    expect(insights).toEqual([
      { source: 'Outcome', target: 'Segment', intensity: 1, capacity: 1 },
      { source: 'Segment', target: 'Outcome', intensity: 1, capacity: 1 },
      { source: 'Region', target: 'Segment', intensity: 0.8, capacity: 0.8 },
      { source: 'Segment', target: 'Region', intensity: 0.8, capacity: 0.8 }
    ]);
  });

  it('sorts insights by intensity in descending order', () => {
    const insights = filterInsights(deterministicResults, {
      mode: 'deterministic',
      features: ['Segment', 'Outcome', 'Region', 'Channel'],
      thresholds: {
        intensity: 0.6,
        capacity: 0.6
      }
    });

    const intensities = insights.map((insight) => insight.intensity);
    const sortedIntensities = [...intensities].sort((first, second) => second - first);

    expect(intensities).toEqual(sortedIntensities);
    expect(insights[0].intensity).toBe(1);
    expect(insights[insights.length - 1].intensity).toBe(0.7);
  });

  it('returns an empty array when no pairs pass configured thresholds', () => {
    const insights = filterInsights(balancedResults, {
      mode: 'deterministic',
      features: ['A', 'B'],
      thresholds: {
        intensity: 0.75,
        capacity: 0.75
      }
    });

    expect(insights).toEqual([]);
  });

  it('uses config.features and excludes pairs with features outside the selection', () => {
    const insights = filterInsights(deterministicResults, {
      mode: 'deterministic',
      features: ['Segment', 'Region'],
      thresholds: {
        intensity: 0.6,
        capacity: 0.6
      }
    });

    expect(insights).toEqual([
      { source: 'Region', target: 'Segment', intensity: 0.8, capacity: 0.8 },
      { source: 'Segment', target: 'Region', intensity: 0.8, capacity: 0.8 }
    ]);
  });

  it('works with the actual deterministic results shape containing singleFreq and pairFreq', () => {
    const insights = filterInsights(deterministicResults, {
      mode: 'deterministic',
      features: ['Segment', 'Outcome'],
      thresholds: {
        intensity: 0.9,
        capacity: 0.9
      }
    });

    expect(insights).toHaveLength(2);
    expect(insights).toContainEqual({
      source: 'Segment',
      target: 'Outcome',
      intensity: 1,
      capacity: 1
    });
    expect(insights).toContainEqual({
      source: 'Outcome',
      target: 'Segment',
      intensity: 1,
      capacity: 1
    });
  });
});

describe('InsightsPanel', () => {
  it('shows an empty state when there are no insights', () => {
    render(
      <InsightsPanel
        results={balancedResults}
        config={{
          mode: 'deterministic',
          features: ['A', 'B'],
          thresholds: {
            intensity: 0.75,
            capacity: 0.75
          }
        }}
      />
    );

    expect(screen.getByText(/значимые детерминации не найдены/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows a table when filterInsights returns results', () => {
    render(
      <InsightsPanel
        results={deterministicResults}
        config={{
          mode: 'deterministic',
          features: ['Segment', 'Outcome'],
          thresholds: {
            intensity: 0.9,
            capacity: 0.9
          }
        }}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Признак A')).toBeInTheDocument();
    expect(screen.getByText('Признак B')).toBeInTheDocument();
    expect(screen.getAllByText('Segment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Outcome').length).toBeGreaterThan(0);
  });

  it('renders rows in descending intensity order', () => {
    render(
      <InsightsPanel
        results={deterministicResults}
        config={{
          mode: 'deterministic',
          features: ['Segment', 'Outcome', 'Region', 'Channel'],
          thresholds: {
            intensity: 0.6,
            capacity: 0.6
          }
        }}
      />
    );

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    const intensities = rows.map((row) => (
      Number(row.querySelectorAll('td')[2].textContent.replace('%', ''))
    ));

    expect(intensities).toEqual([...intensities].sort((first, second) => second - first));
  });
});
