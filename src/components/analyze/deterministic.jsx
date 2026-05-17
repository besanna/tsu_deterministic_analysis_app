import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { TableCellsIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import {
  calculateAllFrequencies,
  calculateIntensity,
  calculateCapacity,
  calculateFocusAnalysis,
  calculateSignificanceAnalysis,
  extractUniqueValues,
  validateCsvData
} from '../helpers/deterministic-calculations';
import FileUploadStep from './FileUploadStep';
import IndexedDB from '../../api/IndexedDB';

// Progress bar component for calculations
const CalculationProgress = ({ progress, currentStep, totalSteps }) => {
  const percentage = Math.round((progress / totalSteps) * 100);
  
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-purple-500/10" />
      <div className="relative flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white tracking-wide">Выполняется анализ данных</h3>
        <span className="text-xs font-medium text-white/70 px-2 py-1 rounded-full bg-white/10">
          {progress}/{totalSteps}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="relative mt-2 text-xs text-white/70 uppercase tracking-[0.12em]">{currentStep}</p>
    </div>
  );
};

// Component for displaying unique values
const UniqueValuesDisplay = ({ data, columns }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)] mb-6">
      <div className="flex items-center mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/70 to-blue-700/70 shadow-lg shadow-blue-900/30 mr-3">
          <TableCellsIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white leading-none">Столбцы датасета</h3>
          <p className="text-xs text-white/60 mt-1">Быстрый обзор структуры</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {columns.map(column => (
          <div key={column} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
            <h4 className="font-semibold text-white tracking-tight">{column}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

// Intensity of determination table component
const IntensityTable = ({ frequencies }) => {
  const [intensityData, setIntensityData] = useState(null);

  useEffect(() => {
    if (!frequencies) return;

    const intensity = calculateIntensity(frequencies.singleFreq, frequencies.pairFreq);
    setIntensityData(intensity);
  }, [frequencies]);

  if (!intensityData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-white/60 text-center">Загрузка данных интенсивности...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-fuchsia-400" />
        Интенсивность детерминации
      </h3>
      
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10 bg-white/5">
                P(a&b)
              </th>
              {(() => {
                const allValues = [];
                Object.entries(frequencies.singleFreq).forEach(([category, values]) => {
                  Object.keys(values).forEach(value => {
                    allValues.push({ category, value });
                  });
                });
                
                return allValues.map(({ category, value }) => (
                  <th key={`${category}-${value}`} className="px-3 py-2 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    {value}
                  </th>
                ));
              })()}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(() => {
              const allValues = [];
              Object.entries(frequencies.singleFreq).forEach(([category, values]) => {
                Object.entries(values).forEach(([value, data]) => {
                  allValues.push({ category, value, data });
                });
              });
              
              const allCounts = [];
              Object.values(intensityData).forEach(pairData => {
                Object.values(pairData).forEach(valueData => {
                  Object.values(valueData).forEach(pairData => {
                    allCounts.push(pairData.count);
                  });
                });
              });
              const maxCount = Math.max(...allCounts);
              
              return allValues.map((rowValue, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10 bg-white/5">
                    {rowValue.category} {rowValue.value}
                  </td>
                  {allValues.map((colValue, colIndex) => {
                    let count = 0;
                    let frequency = 0;
                    let intensity = 0;
                    let isSameCategory = false;
                    
                    if (rowValue.category === colValue.category) {
                      isSameCategory = true;
                      if (rowValue.value === colValue.value) {
                        count = rowValue.data.count;
                        frequency = rowValue.data.frequency;
                        intensity = 1; // Same value, intensity = 1
                      }
                    } else {
                      const pairKey = `${rowValue.category} & ${colValue.category}`;
                      const reversePairKey = `${colValue.category} & ${rowValue.category}`;
                      
                      let pairData = intensityData[pairKey] || intensityData[reversePairKey];
                      if (pairData) {
                        const value1 = rowValue.value;
                        const value2 = colValue.value;
                        const data = pairData[value1]?.[value2];
                        count = data?.count || 0;
                        frequency = data?.frequency || 0;
                        intensity = data?.intensity || 0;
                      }
                    }
                    
                    const isMaxValue = count === maxCount && count > 0;
                    const hasData = count > 0;
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-3 py-2 text-sm text-center border-r border-white/10 ${
                          isSameCategory
                            ? 'bg-white/5'
                            : isMaxValue 
                              ? 'bg-fuchsia-400/25 border-fuchsia-300/60' 
                              : hasData 
                                ? 'bg-blue-500/20' 
                                : 'bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {isSameCategory ? (
                            <span className="text-white/30 font-bold">X</span>
                          ) : (
                            <>
                              <span className={`font-semibold text-lg ${
                                isMaxValue ? 'text-fuchsia-50' : hasData ? 'text-sky-50' : 'text-white/40'
                              }`}>
                                {count}
                              </span>
                              <span className={`text-xs ${
                                isMaxValue ? 'text-fuchsia-100' : hasData ? 'text-sky-100' : 'text-white/40'
                              }`}>
                                {(intensity * 100).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Focus analysis component
const FocusAnalysisTable = ({ frequencies, data }) => {
  const [focusCategory, setFocusCategory] = useState(null);
  const [focusValue, setFocusValue] = useState(null);
  const [focusData, setFocusData] = useState(null);
  const [significanceData, setSignificanceData] = useState(null);
  const [useSignificance, setUseSignificance] = useState(false);

  useEffect(() => {
    if (!frequencies || !focusCategory || !focusValue) return;

    const analysisData = calculateFocusAnalysis(
      frequencies.singleFreq, 
      frequencies.pairFreq, 
      focusCategory, 
      focusValue
    );
    
    setFocusData(analysisData);
    
    // Если включен анализ с уточнениями, рассчитываем существенность
    if (useSignificance && data) {
      const significanceResults = calculateSignificanceAnalysis(
        data,
        frequencies.singleFreq,
        frequencies.pairFreq,
        focusCategory,
        focusValue
      );
      setSignificanceData(significanceResults);
    } else {
      setSignificanceData(null);
    }
  }, [frequencies, focusCategory, focusValue, useSignificance, data]);

  const handleCategoryClick = (category, value) => {
    setFocusCategory(category);
    setFocusValue(value);
  };

  const clearFocus = () => {
    setFocusCategory(null);
    setFocusValue(null);
    setFocusData(null);
    setSignificanceData(null);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-rose-400" />
        Фокусный анализ
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-white/70 mb-3">
          Кликните на категорию и значение, чтобы проанализировать, кто его предпочитает
        </p>
        
        {focusCategory && focusValue ? (
          <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">
                  Анализ: {focusCategory} = "{focusValue}"
                </span>
                <p className="text-xs text-white/60 mt-1">
                  Показывает, кто предпочитает это значение
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="flex items-center text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={useSignificance}
                    onChange={(e) => setUseSignificance(e.target.checked)}
                    className="mr-2 accent-rose-500"
                  />
                  Считать с уточнениями
                </label>
                <button
                  onClick={clearFocus}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
                >
                  Сбросить
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(frequencies.singleFreq).map(([category, values]) => (
              <div key={category} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <h4 className="font-semibold text-white mb-2 text-sm">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(values).map((value) => (
                    <button
                      key={value}
                      onClick={() => handleCategoryClick(category, value)}
                      className="text-sm text-white/90 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full hover:border-rose-300/80 hover:text-white hover:bg-rose-500/20 transition-colors"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {focusData && focusData.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Ранг
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Кто предпочитает "{focusValue}"
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Количество
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Частота
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Интенсивность
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em]">
                  Ёмкость
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {focusData.map((item, index) => {
                const isTop3 = index < 3;
                const isTop10 = index < 10;
                
                return (
                  <tr key={index} className={`hover:bg-white/5 transition ${
                    isTop3 ? 'bg-amber-300/20' : isTop10 ? 'bg-emerald-300/10' : ''
                  }`}>
                    <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-amber-200 mr-1">🥇</span>}
                        {index === 1 && <span className="text-white/70 mr-1">🥈</span>}
                        {index === 2 && <span className="text-orange-200 mr-1">🥉</span>}
                        <span className={`font-bold ${
                          isTop3 ? 'text-amber-100' : isTop10 ? 'text-emerald-100' : 'text-white/80'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.otherValue}</span>
                        <span className="text-xs text-white/60">
                          {item.otherCategory}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                      <span className="font-semibold">{item.count}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                      <span className="font-semibold">{(item.frequency * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${
                          item.intensity > 0.8 ? 'text-emerald-200' : 
                          item.intensity > 0.5 ? 'text-amber-200' : 'text-rose-200'
                        }`}>
                          {(item.intensity * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 bg-white/10 rounded-full h-1 mt-1">
                          <div 
                            className="bg-gradient-to-r from-sky-400 to-fuchsia-500 h-1 rounded-full" 
                            style={{ width: `${Math.min(item.intensity * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${
                          item.capacity > 0.8 ? 'text-emerald-200' : 
                          item.capacity > 0.5 ? 'text-amber-200' : 'text-rose-200'
                        }`}>
                          {(item.capacity * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 bg-white/10 rounded-full h-1 mt-1">
                          <div 
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-1 rounded-full" 
                            style={{ width: `${Math.min(item.capacity * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {focusData && focusData.length === 0 && (
        <div className="text-center py-8 text-white/60">
          <p>Нет данных для выбранного фокуса</p>
        </div>
      )}
      
      {/* Анализ существенности */}
      {significanceData && significanceData.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-300" />
            Анализ существенности с уточнениями
          </h4>
          <p className="text-sm text-white/70 mb-4">
            Показывает, как дополнительные факторы влияют на предпочтение "{focusValue}"
          </p>
          
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    Ранг
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    Уточняющие факторы
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    Количество
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    Интенсивность
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    Ёмкость
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    Существенность 1
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em]">
                    Существенность 2
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {significanceData.map((item, index) => {
                  const isTop3 = index < 3;
                  const isTop10 = index < 10;
                  
                  return (
                    <tr key={index} className={`hover:bg-white/5 transition ${
                      isTop3 ? 'bg-amber-300/20' : isTop10 ? 'bg-emerald-300/10' : ''
                    }`}>
                      <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-amber-200 mr-1">🥇</span>}
                          {index === 1 && <span className="text-white/70 mr-1">🥈</span>}
                          {index === 2 && <span className="text-orange-200 mr-1">🥉</span>}
                          <span className={`font-bold ${
                            isTop3 ? 'text-amber-100' : isTop10 ? 'text-emerald-100' : 'text-white/80'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10">
                        <div className="flex flex-col">
                          <span className="font-semibold">{item.value1}</span>
                          <span className="text-xs text-white/60">{item.category1}</span>
                          <span className="text-sm font-medium mt-1 text-white/70">+</span>
                          <span className="font-semibold">{item.value2}</span>
                          <span className="text-xs text-white/60">{item.category2}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                        <span className="font-semibold">{item.tripleCount}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                        <span className="font-semibold">{(item.tripleIntensity * 100).toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                        <span className="font-semibold">{(item.tripleCapacity * 100).toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/80 text-center border-r border-white/10">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${
                            item.significance1 > 0 ? 'text-emerald-200' : 
                            item.significance1 < 0 ? 'text-rose-200' : 'text-white/70'
                          }`}>
                            {(item.significance1 * 100).toFixed(1)}%
                          </span>
                          <span className={`text-xs ${
                            item.significance1Type === 'positive' ? 'text-emerald-200' :
                            item.significance1Type === 'negative' ? 'text-rose-200' : 'text-white/60'
                          }`}>
                            {item.significance1Type === 'positive' ? 'Позитивное' :
                             item.significance1Type === 'negative' ? 'Негативное' : 'Нейтральное'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/80 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${
                            item.significance2 > 0 ? 'text-emerald-200' : 
                            item.significance2 < 0 ? 'text-rose-200' : 'text-white/70'
                          }`}>
                            {(item.significance2 * 100).toFixed(1)}%
                          </span>
                          <span className={`text-xs ${
                            item.significance2Type === 'positive' ? 'text-emerald-200' :
                            item.significance2Type === 'negative' ? 'text-rose-200' : 'text-white/60'
                          }`}>
                            {item.significance2Type === 'positive' ? 'Позитивное' :
                             item.significance2Type === 'negative' ? 'Негативное' : 'Нейтральное'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {significanceData && significanceData.length === 0 && useSignificance && (
        <div className="text-center py-8 text-white/60">
          <p>Нет данных для анализа существенности</p>
        </div>
      )}
    </div>
  );
};

// Capacity of determination table component
const CapacityTable = ({ frequencies }) => {
  const [capacityData, setCapacityData] = useState(null);

  useEffect(() => {
    if (!frequencies) return;

    const capacity = calculateCapacity(frequencies.singleFreq, frequencies.pairFreq);
    setCapacityData(capacity);
  }, [frequencies]);

  if (!capacityData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-white/60 text-center">Загрузка данных ёмкости...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-amber-400" />
        Ёмкость детерминации
      </h3>
      
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10 bg-white/5">
                P(a&b)
              </th>
              {(() => {
                const allValues = [];
                Object.entries(frequencies.singleFreq).forEach(([category, values]) => {
                  Object.keys(values).forEach(value => {
                    allValues.push({ category, value });
                  });
                });
                
                return allValues.map(({ category, value }) => (
                  <th key={`${category}-${value}`} className="px-3 py-2 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                    {value}
                  </th>
                ));
              })()}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(() => {
              const allValues = [];
              Object.entries(frequencies.singleFreq).forEach(([category, values]) => {
                Object.entries(values).forEach(([value, data]) => {
                  allValues.push({ category, value, data });
                });
              });
              
              const allCounts = [];
              Object.values(capacityData).forEach(pairData => {
                Object.values(pairData).forEach(valueData => {
                  Object.values(valueData).forEach(pairData => {
                    allCounts.push(pairData.count);
                  });
                });
              });
              const maxCount = Math.max(...allCounts);
              
              return allValues.map((rowValue, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10 bg-white/5">
                    {rowValue.category} {rowValue.value}
                  </td>
                  {allValues.map((colValue, colIndex) => {
                    let count = 0;
                    let frequency = 0;
                    let capacity = 0;
                    let isSameCategory = false;
                    
                    if (rowValue.category === colValue.category) {
                      isSameCategory = true;
                      if (rowValue.value === colValue.value) {
                        count = rowValue.data.count;
                        frequency = rowValue.data.frequency;
                        capacity = 1; // Same value, capacity = 1
                      }
                    } else {
                      const pairKey = `${rowValue.category} & ${colValue.category}`;
                      const reversePairKey = `${colValue.category} & ${rowValue.category}`;
                      
                      let pairData = capacityData[pairKey] || capacityData[reversePairKey];
                      if (pairData) {
                        const value1 = rowValue.value;
                        const value2 = colValue.value;
                        const data = pairData[value1]?.[value2];
                        count = data?.count || 0;
                        frequency = data?.frequency || 0;
                        capacity = data?.capacity || 0;
                      }
                    }
                    
                    const isMaxValue = count === maxCount && count > 0;
                    const hasData = count > 0;
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-3 py-2 text-sm text-center border-r border-white/10 ${
                          isSameCategory
                            ? 'bg-white/5'
                            : isMaxValue 
                              ? 'bg-amber-300/25 border-amber-300/60' 
                              : hasData 
                                ? 'bg-emerald-500/20' 
                                : 'bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {isSameCategory ? (
                            <span className="text-white/30 font-bold">X</span>
                          ) : (
                            <>
                              <span className={`font-semibold text-lg ${
                                isMaxValue ? 'text-amber-50' : hasData ? 'text-emerald-50' : 'text-white/40'
                              }`}>
                                {count}
                              </span>
                              <span className={`text-xs ${
                                isMaxValue ? 'text-amber-100' : hasData ? 'text-emerald-100' : 'text-white/40'
                              }`}>
                                {(capacity * 100).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main conditional frequency table component
const ConditionalFrequencyTable = ({ frequencies }) => {
  if (!frequencies) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-white/60 text-center">Загрузите данные для начала анализа</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-emerald-400" />
        Таблица условных частот
      </h3>
      
      {/* Single frequencies */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-white mb-4">Частоты отдельных категорий</h4>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Категория
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Значение
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                  Количество
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em]">
                  Частота
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(frequencies.singleFreq).map(([category, values]) =>
                Object.entries(values).map(([value, data]) => (
                  <tr key={`${category}-${value}`} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/5">
                      {category}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 border-r border-white/5">
                      {value}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 border-r border-white/5">
                      {data.count}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">
                      {(data.frequency * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pair frequencies - Symmetric matrix table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white">Условные частоты парных комбинаций</h4>
          <div className="flex items-center space-x-4 text-[11px] text-white/60">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-300/40 border border-amber-300/70 rounded mr-1"></div>
              <span>Максимальное значение</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-400/30 rounded mr-1"></div>
              <span>Есть данные</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white/10 rounded mr-1"></div>
              <span>Нет данных</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10 bg-white/5">
                  P(a&b)
                </th>
                {(() => {
                  // Collect all unique values from all categories for column headers
                  const allValues = [];
                  Object.entries(frequencies.singleFreq).forEach(([category, values]) => {
                    Object.keys(values).forEach(value => {
                      allValues.push({ category, value });
                    });
                  });
                  
                  return allValues.map(({ category, value }) => (
                    <th key={`${category}-${value}`} className="px-3 py-2 text-center text-[11px] font-semibold text-white/70 uppercase tracking-[0.14em] border-r border-white/10">
                      {value}
                    </th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(() => {
                // Collect all unique values for rows
                const allValues = [];
                Object.entries(frequencies.singleFreq).forEach(([category, values]) => {
                  Object.entries(values).forEach(([value, data]) => {
                    allValues.push({ category, value, data });
                  });
                });
                
                // Find max count for highlighting
                const allCounts = [];
                allValues.forEach(({ data }) => {
                  allCounts.push(data.count);
                });
                Object.values(frequencies.pairFreq).forEach(pairData => {
                  Object.values(pairData).forEach(valueData => {
                    Object.values(valueData).forEach(pairData => {
                      allCounts.push(pairData.count);
                    });
                  });
                });
                const maxCount = Math.max(...allCounts);
                
                return allValues.map((rowValue, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10 bg-white/5">
                      {rowValue.category} {rowValue.value}
                    </td>
                    {allValues.map((colValue, colIndex) => {
                      let count = 0;
                      let frequency = 0;
                      let isSameCategory = false;
                      
                      // Check if same category
                      if (rowValue.category === colValue.category) {
                        isSameCategory = true;
                        if (rowValue.value === colValue.value) {
                          count = rowValue.data.count;
                          frequency = rowValue.data.frequency;
                        }
                      } else {
                        // Different categories - look for pair frequency
                        const pairKey = `${rowValue.category} & ${colValue.category}`;
                        const reversePairKey = `${colValue.category} & ${rowValue.category}`;
                        
                        let pairData = frequencies.pairFreq[pairKey] || frequencies.pairFreq[reversePairKey];
                        if (pairData) {
                          const value1 = rowValue.value;
                          const value2 = colValue.value;
                          const data = pairData[value1]?.[value2];
                          count = data?.count || 0;
                          frequency = data?.frequency || 0;
                        }
                      }
                      
                      const isMaxValue = count === maxCount && count > 0;
                      const hasData = count > 0;
                      
                      return (
                        <td 
                          key={colIndex} 
                          className={`px-3 py-2 text-sm text-center border-r border-white/10 ${
                            isSameCategory
                              ? 'bg-white/5'
                              : isMaxValue 
                                ? 'bg-amber-300/30 border-amber-300/60' 
                                : hasData 
                                  ? 'bg-emerald-400/20' 
                                  : 'bg-white/5'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            {isSameCategory ? (
                              <span className="text-white/30 font-bold">X</span>
                            ) : (
                              <>
                                <span className={`font-semibold text-lg ${
                                  isMaxValue ? 'text-amber-100' : hasData ? 'text-emerald-100' : 'text-white/40'
                                }`}>
                                  {count}
                                </span>
                                <span className={`text-xs ${
                                  isMaxValue ? 'text-amber-200' : hasData ? 'text-emerald-200' : 'text-white/40'
                                }`}>
                                  {(frequency * 100).toFixed(1)}%
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// Main component
export default function DeterministicAnalysis() {
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisTotalSteps, setAnalysisTotalSteps] = useState(0);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('frequencies');
  const [frequencies, setFrequencies] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [rowLimit, setRowLimit] = useState(null);

  // Загрузка данных из URL параметров
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loadData = urlParams.get('loadData');
    
    if (loadData) {
      try {
        const data = JSON.parse(decodeURIComponent(loadData));
        setCsvData(data.csvData);
        setColumns(data.columns);
        setFrequencies(data.frequencies);
        setShowResults(true);
        setIsAnalysisComplete(true);
        setRowLimit(data.csvData?.length || null);
        
        // Очищаем URL параметры
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Ошибка при загрузке данных из URL:', error);
      }
    }
  }, []);

  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setShowResults(false);
    setIsAnalysisComplete(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Ошибка при чтении CSV файла: ' + results.errors[0].message);
          setIsLoading(false);
          return;
        }

        const data = results.data;
        const validation = validateCsvData(data);
        
        if (!validation.isValid) {
          setError(validation.error);
          setIsLoading(false);
          return;
        }

        const columnNames = Object.keys(data[0]);
        setColumns(columnNames);
        setCsvData(data);
        setRowLimit(data.length);
        setIsLoading(false);
      },
      error: (error) => {
        setError('Ошибка при чтении файла: ' + error.message);
        setIsLoading(false);
      }
    });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!csvData.length || !columns.length) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep('Инициализация анализа...');
    setAnalysisTotalSteps(100);
    setShowResults(false);

    try {
      const effectiveRows = rowLimit ? Math.max(1, Math.min(rowLimit, csvData.length)) : csvData.length;
      const dataForAnalysis = csvData.slice(0, effectiveRows);

      // Step 1: Анализ уникальных значений
      setAnalysisStep('Анализ уникальных значений...');
      setAnalysisProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 2: Расчет условных частот
      setAnalysisStep('Расчет условных частот...');
      setAnalysisProgress(30);
      
      const frequencies = await calculateAllFrequencies(dataForAnalysis, columns);
      setFrequencies(frequencies);
      
      // Step 3: Расчет интенсивности детерминации
      setAnalysisStep('Расчет интенсивности детерминации...');
      setAnalysisProgress(60);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 4: Расчет ёмкости детерминации
      setAnalysisStep('Расчет ёмкости детерминации...');
      setAnalysisProgress(80);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 5: Подготовка результатов
      setAnalysisStep('Подготовка результатов...');
      setAnalysisProgress(100);
      await new Promise(resolve => setTimeout(resolve, 100));

      setIsAnalyzing(false);
      setIsAnalysisComplete(true);
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка при анализе данных:', error);
      setError('Ошибка при анализе данных: ' + error.message);
      setIsAnalyzing(false);
    }
  }, [csvData, columns, rowLimit]);

  const handleClearData = useCallback(() => {
    setCsvData([]);
    setColumns([]);
    setError('');
    setShowResults(false);
    setIsAnalysisComplete(false);
    setFrequencies(null);
    setRowLimit(null);
  }, []);

  const handleRemoveColumn = useCallback((columnName) => {
    setColumns((prev) => prev.filter((col) => col !== columnName));
    setShowResults(false);
    setIsAnalysisComplete(false);
    setFrequencies(null);
  }, []);

  const handleSaveResults = useCallback(async () => {
    if (!frequencies || !csvData.length) return;

    try {
      const analysisData = {
        csvData,
        columns,
        frequencies,
        fileName: 'Анализ данных',
        recordCount: csvData.length,
        columnCount: columns.length,
        rowLimitUsed: rowLimit ? Math.min(rowLimit, csvData.length) : csvData.length
      };

      await IndexedDB.saveAnalysis(analysisData);
      alert('Результаты анализа сохранены в историю!');
    } catch (error) {
      console.error('Ошибка при сохранении результатов:', error);
      alert('Ошибка при сохранении результатов');
    }
  }, [csvData, columns, frequencies, rowLimit]);

  return (
    <div className="relative min-h-screen overflow-hidden analysis-shell">
      <div className="analysis-grid" />
      <div className="grain" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(130deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01)),radial-gradient(120%_110%_at_10%_20%,rgba(95,177,255,0.12),transparent_35%),radial-gradient(120%_110%_at_85%_0%,rgba(37,99,235,0.12),transparent_32%)] shadow-[0_30px_120px_-60px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'var(--bg-grid)', backgroundSize: 'var(--grid-size) var(--grid-size)' }} />
            <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="relative p-8 md:p-10 space-y-5">
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              Детерминационный анализ
            </h1>
            <p className="mt-1 max-w-3xl text-white/70">
              Загрузите CSV, чтобы построить условные частоты, интенсивность и ёмкость детерминации.
            </p>
          </div>
        </div>

        {/* File Upload Step - only show if no results yet */}
        {!showResults && (
          <FileUploadStep
            csvData={csvData}
            columns={columns}
            isLoading={isLoading}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
            analysisStep={analysisStep}
            analysisTotalSteps={analysisTotalSteps}
            isAnalysisComplete={isAnalysisComplete}
            error={error}
            rowLimit={rowLimit}
            onRowLimitChange={setRowLimit}
            onRemoveColumn={handleRemoveColumn}
            onFileUpload={handleFileUpload}
            onAnalyze={handleAnalyze}
            onClearData={handleClearData}
          />
        )}

        {/* Results */}
        {showResults && csvData.length > 0 && columns.length > 0 && (
          <>
            {/* Header with new file button */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)] mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Session</p>
                  <h2 className="text-2xl font-semibold text-white mt-1">Результаты анализа</h2>
                  <p className="text-white/70 mt-1">
                    Проанализировано {csvData.length} записей • {columns.length} колонок
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSaveResults}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-emerald-500/40 focus:outline-none"
                  >
                    Сохранить в историю
                  </button>
                  <button
                    onClick={handleClearData}
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10 focus:outline-none"
                  >
                    Загрузить новый файл
                  </button>
                </div>
              </div>
            </div>

            <UniqueValuesDisplay data={csvData} columns={columns} />
            
            {/* Navigation buttons */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setCurrentStep('frequencies')}
                  className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    currentStep === 'frequencies'
                      ? 'bg-[#0e1624] border border-white/30 text-white shadow-[0_10px_40px_-20px_rgba(95,177,255,0.8)]'
                      : 'bg-[#0b1019]/60 text-white/70 border border-white/10 hover:text-white'
                  }`}
                >
                  Условные частоты
                </button>
                <button
                  onClick={() => setCurrentStep('intensity')}
                  className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    currentStep === 'intensity'
                      ? 'bg-[#11142a] border border-white/30 text-white shadow-[0_10px_40px_-20px_rgba(95,177,255,0.6)]'
                      : 'bg-[#0b1019]/60 text-white/70 border border-white/10 hover:text-white'
                  }`}
                >
                  Интенсивность
                </button>
                <button
                  onClick={() => setCurrentStep('capacity')}
                  className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    currentStep === 'capacity'
                      ? 'bg-[#0f1829] border border-white/30 text-white shadow-[0_10px_40px_-20px_rgba(95,177,255,0.6)]'
                      : 'bg-[#0b1019]/60 text-white/70 border border-white/10 hover:text-white'
                  }`}
                >
                  Ёмкость
                </button>
                <button
                  onClick={() => setCurrentStep('focus')}
                  className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    currentStep === 'focus'
                      ? 'bg-[#0f1626] border border-white/30 text-white shadow-[0_10px_40px_-20px_rgba(95,177,255,0.6)]'
                      : 'bg-[#0b1019]/60 text-white/70 border border-white/10 hover:text-white'
                  }`}
                >
                  Фокус
                </button>
              </div>
            </div>

            {/* Step content */}
            {currentStep === 'frequencies' && (
              <ConditionalFrequencyTable frequencies={frequencies} />
            )}
            {currentStep === 'intensity' && frequencies && (
              <IntensityTable frequencies={frequencies} />
            )}
            {currentStep === 'capacity' && frequencies && (
              <CapacityTable frequencies={frequencies} />
            )}
            {currentStep === 'focus' && frequencies && (
              <FocusAnalysisTable frequencies={frequencies} data={csvData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
