import { ChartBarIcon } from '@heroicons/react/24/outline';

const PAIR_SEPARATOR = ' & ';
const DEFAULT_THRESHOLDS = {
  intensity: 0,
  capacity: 0
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const toFiniteNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeThreshold = (value, fallback = 0) => {
  const numericValue = toFiniteNumber(value, fallback);
  return Math.min(1, Math.max(0, numericValue));
};

const getThresholds = (config) => ({
  intensity: normalizeThreshold(config?.thresholds?.intensity, DEFAULT_THRESHOLDS.intensity),
  capacity: normalizeThreshold(config?.thresholds?.capacity, DEFAULT_THRESHOLDS.capacity)
});

const getSelectedFeatureSet = (config) => {
  if (!Array.isArray(config?.features)) {
    return null;
  }

  return new Set(config.features.filter((feature) => typeof feature === 'string' && feature.trim()));
};

const formatPercent = (value) => `${(toFiniteNumber(value) * 100).toFixed(1)}%`;

const shouldUseFeatures = (source, target, selectedFeatureSet) => {
  if (!selectedFeatureSet) {
    return true;
  }

  return selectedFeatureSet.has(source) && selectedFeatureSet.has(target);
};

const addInsightCandidate = ({
  insightsByPair,
  selectedFeatureSet,
  thresholds,
  source,
  target,
  intensity,
  capacity
}) => {
  if (!shouldUseFeatures(source, target, selectedFeatureSet)) {
    return;
  }

  if (intensity < thresholds.intensity || capacity < thresholds.capacity) {
    return;
  }

  const key = `${source}->${target}`;
  const currentInsight = insightsByPair.get(key);

  if (
    !currentInsight ||
    intensity > currentInsight.intensity ||
    (intensity === currentInsight.intensity && capacity > currentInsight.capacity)
  ) {
    insightsByPair.set(key, {
      source,
      target,
      intensity,
      capacity
    });
  }
};

export function filterInsights(results, config = {}) {
  const singleFreq = results?.singleFreq;
  const pairFreq = results?.pairFreq;

  if (!isObject(singleFreq) || !isObject(pairFreq)) {
    return [];
  }

  const thresholds = getThresholds(config);
  const selectedFeatureSet = getSelectedFeatureSet(config);
  const insightsByPair = new Map();

  Object.entries(pairFreq).forEach(([pairName, pairData]) => {
    const [sourceFeature, targetFeature] = pairName.split(PAIR_SEPARATOR);

    if (!sourceFeature || !targetFeature || !isObject(pairData)) {
      return;
    }

    Object.entries(pairData).forEach(([sourceValue, targetValues]) => {
      if (!isObject(targetValues)) {
        return;
      }

      Object.entries(targetValues).forEach(([targetValue, cellData]) => {
        const jointFrequency = toFiniteNumber(cellData?.frequency);
        const sourceFrequency = toFiniteNumber(singleFreq?.[sourceFeature]?.[sourceValue]?.frequency);
        const targetFrequency = toFiniteNumber(singleFreq?.[targetFeature]?.[targetValue]?.frequency);

        if (jointFrequency <= 0 || sourceFrequency <= 0 || targetFrequency <= 0) {
          return;
        }

        addInsightCandidate({
          insightsByPair,
          selectedFeatureSet,
          thresholds,
          source: sourceFeature,
          target: targetFeature,
          intensity: jointFrequency / sourceFrequency,
          capacity: jointFrequency / targetFrequency
        });

        addInsightCandidate({
          insightsByPair,
          selectedFeatureSet,
          thresholds,
          source: targetFeature,
          target: sourceFeature,
          intensity: jointFrequency / targetFrequency,
          capacity: jointFrequency / sourceFrequency
        });
      });
    });
  });

  return Array.from(insightsByPair.values()).sort((first, second) => {
    if (second.intensity !== first.intensity) {
      return second.intensity - first.intensity;
    }

    if (second.capacity !== first.capacity) {
      return second.capacity - first.capacity;
    }

    return `${first.source} ${first.target}`.localeCompare(`${second.source} ${second.target}`, 'ru');
  });
}

export default function InsightsPanel({ results, config }) {
  const insights = filterInsights(results, config);
  const thresholds = getThresholds(config);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-500 shadow-lg shadow-emerald-900/30">
            <ChartBarIcon className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Ключевые выводы</h3>
            <p className="mt-1 text-sm text-white/60">
              Пороги: интенсивность >= {formatPercent(thresholds.intensity)} • емкость >= {formatPercent(thresholds.capacity)}
            </p>
          </div>
        </div>
      </div>

      {!insights.length ? (
        <div className="mt-5 rounded-2xl border border-sky-300/25 bg-sky-400/10 p-5 text-sm text-sky-100">
          По текущим порогам значимые детерминации не найдены. Попробуйте снизить пороговые значения.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 border-r border-white/10">
                  Признак A
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 border-r border-white/10">
                  Признак B
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 border-r border-white/10">
                  Интенсивность
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  Емкость
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {insights.map((insight) => (
                <tr key={`${insight.source}->${insight.target}`} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10">
                    {insight.source}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80 border-r border-white/10">
                    {insight.target}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-emerald-100 border-r border-white/10">
                    {formatPercent(insight.intensity)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-amber-100">
                    {formatPercent(insight.capacity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
