import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'deterministicAnalysisConfig';
const DEFAULT_THRESHOLDS = {
  intensity: 0,
  capacity: 0
};

const toValidThreshold = (value, fallback) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 1
    ? numericValue
    : fallback;
};

const readStoredConfig = () => {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY);
    return storedConfig ? JSON.parse(storedConfig) : null;
  } catch (error) {
    console.error('Ошибка при чтении конфигурации анализа:', error);
    return null;
  }
};

const getThresholdError = (value) => {
  const numericValue = Number(value);

  if (value === '' || !Number.isFinite(numericValue)) {
    return 'Порог должен быть числом от 0 до 1';
  }

  if (numericValue < 0 || numericValue > 1) {
    return 'Порог должен быть в диапазоне от 0 до 1';
  }

  return '';
};

export default function AnalysisConfigForm({
  availableFeatures = [],
  initialConfig,
  onSave,
  onBack
}) {
  const features = useMemo(() => {
    const normalizedFeatures = Array.isArray(availableFeatures) ? availableFeatures : [];
    return Array.from(
      new Set(normalizedFeatures.filter((feature) => typeof feature === 'string' && feature.trim()))
    );
  }, [availableFeatures]);

  const [selectedFeatures, setSelectedFeatures] = useState(features);
  const [intensityThreshold, setIntensityThreshold] = useState(String(DEFAULT_THRESHOLDS.intensity));
  const [capacityThreshold, setCapacityThreshold] = useState(String(DEFAULT_THRESHOLDS.capacity));
  const [formError, setFormError] = useState('');

  const applyConfig = useCallback((config) => {
    const sourceFeatures = Array.isArray(config?.features) ? config.features : features;
    const filteredFeatures = sourceFeatures.filter((feature) => features.includes(feature));
    const thresholds = config?.thresholds || DEFAULT_THRESHOLDS;

    setSelectedFeatures(filteredFeatures);
    setIntensityThreshold(String(toValidThreshold(thresholds.intensity, DEFAULT_THRESHOLDS.intensity)));
    setCapacityThreshold(String(toValidThreshold(thresholds.capacity, DEFAULT_THRESHOLDS.capacity)));
    setFormError('');
  }, [features]);

  useEffect(() => {
    const storedConfig = readStoredConfig();
    const configToApply = initialConfig || storedConfig;

    if (configToApply) {
      applyConfig(configToApply);
      return;
    }

    setSelectedFeatures(features);
    setIntensityThreshold(String(DEFAULT_THRESHOLDS.intensity));
    setCapacityThreshold(String(DEFAULT_THRESHOLDS.capacity));
    setFormError('');
  }, [applyConfig, features, initialConfig]);

  const intensityError = getThresholdError(intensityThreshold);
  const capacityError = getThresholdError(capacityThreshold);
  const hasThresholdError = Boolean(intensityError || capacityError);
  const hasNoFeaturesSelected = selectedFeatures.length === 0;

  const toggleFeature = useCallback((feature) => {
    setFormError('');
    setSelectedFeatures((currentFeatures) => {
      if (currentFeatures.includes(feature)) {
        return currentFeatures.filter((currentFeature) => currentFeature !== feature);
      }

      return [...currentFeatures, feature];
    });
  }, []);

  const selectAllFeatures = useCallback(() => {
    setFormError('');
    setSelectedFeatures(features);
  }, [features]);

  const clearFeatures = useCallback(() => {
    setSelectedFeatures([]);
    setFormError('Выберите хотя бы один признак для анализа');
  }, []);

  const handleSave = useCallback(() => {
    if (hasThresholdError) {
      const message = intensityError || capacityError;
      setFormError(message);
      toast.error(message);
      return;
    }

    if (hasNoFeaturesSelected) {
      const message = 'Выберите хотя бы один признак для анализа';
      setFormError(message);
      toast.error(message);
      return;
    }

    const config = {
      mode: 'deterministic',
      features: selectedFeatures,
      thresholds: {
        intensity: Number(intensityThreshold),
        capacity: Number(capacityThreshold)
      }
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setFormError('');
      onSave?.(config);
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации анализа:', error);
      const message = 'Не удалось сохранить конфигурацию анализа';
      setFormError(message);
      toast.error(message);
    }
  }, [
    capacityError,
    capacityThreshold,
    hasNoFeaturesSelected,
    hasThresholdError,
    intensityError,
    intensityThreshold,
    onSave,
    selectedFeatures
  ]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-900/30">
            <AdjustmentsHorizontalIcon className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Configuration</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Параметры анализа</h2>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Назад
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-white/10 bg-[#0d111b]/80 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Признаки</h3>
              <p className="mt-1 text-sm text-white/55">
                Выбрано {selectedFeatures.length} из {features.length}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllFeatures}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Выбрать все
              </button>
              <button
                type="button"
                onClick={clearFeatures}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Снять все
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {features.map((feature) => {
              const isChecked = selectedFeatures.includes(feature);

              return (
                <label
                  key={feature}
                  className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    isChecked
                      ? 'border-sky-300/50 bg-sky-400/10 text-white'
                      : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFeature(feature)}
                    className="h-4 w-4 rounded border-white/30 bg-slate-950 text-sky-500 focus:ring-sky-400"
                  />
                  <span className="min-w-0 truncate text-sm font-medium">{feature}</span>
                </label>
              );
            })}
          </div>

          {!features.length && (
            <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Нет доступных признаков для настройки.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0d111b]/80 p-5">
          <h3 className="text-base font-semibold text-white">Пороговые значения</h3>

          <div className="mt-4 space-y-4">
            <label htmlFor="threshold-intensity" className="block">
              <span className="text-sm font-medium text-white/80">Threshold intensity</span>
              <input
                id="threshold-intensity"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={intensityThreshold}
                onChange={(event) => {
                  setFormError('');
                  setIntensityThreshold(event.target.value);
                }}
                className={`mt-2 w-full rounded-xl border bg-slate-950/70 px-3 py-2.5 text-white outline-none transition focus:ring-2 ${
                  intensityError
                    ? 'border-rose-300/60 focus:ring-rose-400/30'
                    : 'border-white/15 focus:border-sky-300/70 focus:ring-sky-400/20'
                }`}
              />
              {intensityError && <span className="mt-2 block text-xs text-rose-200">{intensityError}</span>}
            </label>

            <label htmlFor="threshold-capacity" className="block">
              <span className="text-sm font-medium text-white/80">Threshold capacity</span>
              <input
                id="threshold-capacity"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={capacityThreshold}
                onChange={(event) => {
                  setFormError('');
                  setCapacityThreshold(event.target.value);
                }}
                className={`mt-2 w-full rounded-xl border bg-slate-950/70 px-3 py-2.5 text-white outline-none transition focus:ring-2 ${
                  capacityError
                    ? 'border-rose-300/60 focus:ring-rose-400/30'
                    : 'border-white/15 focus:border-sky-300/70 focus:ring-sky-400/20'
                }`}
              />
              {capacityError && <span className="mt-2 block text-xs text-rose-200">{capacityError}</span>}
            </label>
          </div>

          {(formError || hasNoFeaturesSelected) && (
            <div className="mt-5 flex gap-3 rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-100">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-rose-200" />
              <span>{formError || 'Выберите хотя бы один признак для анализа'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={hasThresholdError || hasNoFeaturesSelected}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <CheckCircleIcon className="mr-2 h-5 w-5" />
            Сохранить конфигурацию
          </button>
        </section>
      </div>
    </div>
  );
}
