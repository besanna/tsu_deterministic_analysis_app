import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AnalysisConfigForm from './AnalysisConfigForm';

const STORAGE_KEY = 'deterministicAnalysisConfig';

describe('AnalysisConfigForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a checkbox for every available feature and selects all by default', () => {
    render(
      <AnalysisConfigForm
        availableFeatures={['Segment', 'Outcome', 'Region']}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Segment')).toBeChecked();
    expect(screen.getByLabelText('Outcome')).toBeChecked();
    expect(screen.getByLabelText('Region')).toBeChecked();
  });

  it('restores selected features and thresholds from localStorage on mount', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode: 'deterministic',
      features: ['Segment'],
      thresholds: {
        intensity: 0.7,
        capacity: 0.3
      }
    }));

    render(
      <AnalysisConfigForm
        availableFeatures={['Segment', 'Outcome']}
        onSave={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Segment')).toBeChecked();
      expect(screen.getByLabelText('Outcome')).not.toBeChecked();
    });
    expect(screen.getByLabelText('Threshold intensity')).toHaveValue(0.7);
    expect(screen.getByLabelText('Threshold capacity')).toHaveValue(0.3);
  });

  it('disables save when a threshold is outside the [0, 1] range', () => {
    render(
      <AnalysisConfigForm
        availableFeatures={['Segment', 'Outcome']}
        onSave={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Threshold intensity/i), {
      target: { value: '-0.01' }
    });

    expect(screen.getByRole('button', { name: /сохранить конфигурацию/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Threshold intensity/i), {
      target: { value: '1.01' }
    });

    expect(screen.getByRole('button', { name: /сохранить конфигурацию/i })).toBeDisabled();
  });

  it('calls onSave with the expected config shape and stores it in localStorage', () => {
    const onSave = jest.fn();

    render(
      <AnalysisConfigForm
        availableFeatures={['Segment', 'Outcome']}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByLabelText(/Threshold intensity/i), {
      target: { value: '0.8' }
    });
    fireEvent.change(screen.getByLabelText(/Threshold capacity/i), {
      target: { value: '0.4' }
    });
    fireEvent.click(screen.getByRole('button', { name: /сохранить конфигурацию/i }));

    const expectedConfig = {
      mode: 'deterministic',
      features: ['Segment', 'Outcome'],
      thresholds: {
        intensity: 0.8,
        capacity: 0.4
      }
    };

    expect(onSave).toHaveBeenCalledWith(expectedConfig);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(expectedConfig);
  });
});
