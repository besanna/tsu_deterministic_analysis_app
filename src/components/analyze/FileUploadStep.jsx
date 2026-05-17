import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { DocumentArrowUpIcon, CheckCircleIcon, XMarkIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { validateCsvData } from '../helpers/deterministic-calculations';

// Drag and Drop File Upload Component
const DragDropUpload = ({ onFileUpload, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] px-4">
      <div
        className={`relative w-full max-w-3xl p-14 rounded-[28px] transition-all duration-300 transform ${
          isDragOver
            ? 'scale-[1.02] border border-sky-300/70 shadow-[0_30px_120px_-50px_rgba(59,130,246,0.55)]'
            : 'border border-white/12'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''} bg-[#0c111a]/95`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'var(--bg-grid)', backgroundSize: 'var(--grid-size) var(--grid-size)' }}></div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className={`mx-auto w-24 h-24 bg-gradient-to-br from-[#7ab8ff] to-[#3b82f6] rounded-3xl flex items-center justify-center mb-6 transition-all duration-300 ${isDragOver ? 'rotate-12 scale-110' : 'hover:-translate-y-1'}`}>
            <DocumentArrowUpIcon className="h-12 w-12 text-slate-900" />
          </div>
          
          <h3 className="text-3xl font-semibold text-white mb-3 tracking-tight">
            Загрузите CSV файл
          </h3>
          <p className="text-white/70 mb-8 text-lg text-center">
            Перетащите файл или выберите с диска.
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-9 py-4 bg-white text-slate-900 font-semibold rounded-full cursor-pointer transition-all duration-200 shadow-[0_20px_80px_-50px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 hover:shadow-[0_25px_120px_-60px_rgba(95,177,255,0.45)]"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Выбрать файл
          </label>
          
          <div className="mt-10 flex items-center justify-center space-x-8 text-sm text-white/60">
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1.5 text-sky-400" />
              <span>CSV формат</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1.5 text-sky-400" />
              <span>С заголовками</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1.5 text-sky-400" />
              <span>UTF-8</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Helper text */}
      {/* <div className="mt-6 max-w-2xl text-center">
        <p className="text-sm text-gray-500">
          Пример структуры: <code className="bg-gray-100 px-2 py-1 rounded text-xs">Пол, Статус, Супермаркет</code>
        </p>
      </div> */}
    </div>
  );
};

// Analysis Progress Component
const AnalysisProgress = ({ progress, currentStep, totalSteps, isComplete }) => {
  const safeTotalSteps = Number.isFinite(Number(totalSteps)) && Number(totalSteps) > 0
    ? Number(totalSteps)
    : 100;
  const numericProgress = Number.isFinite(Number(progress)) ? Number(progress) : 0;
  const boundedProgress = Math.min(Math.max(numericProgress, 0), safeTotalSteps);
  const percentage = isComplete
    ? 100
    : Math.round((boundedProgress / safeTotalSteps) * 100);
  const displayProgress = isComplete ? safeTotalSteps : Math.round(boundedProgress);
  const indicatorLeft = isComplete ? 100 : Math.min(percentage, 88);
  const dotCount = Math.max(1, Math.min(Math.round(safeTotalSteps), 5));
  const activeDotCount = Math.round((percentage / 100) * dotCount);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-[0_25px_80px_-40px_rgba(0,0,0,0.7)]">
          <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 animate-pulse"></div>
          
          <div className="p-10">
            <div className="flex justify-center mb-6">
              {isComplete ? (
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/30">
                  <CheckCircleIcon className="w-12 h-12 text-slate-900" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
                  <ArrowPathIcon className="w-12 h-12 text-slate-950 animate-spin" />
                </div>
              )}
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                {isComplete ? 'Анализ завершен!' : 'Анализируем данные'}
              </h3>
              <p className="text-white/70 text-lg">
                {isComplete ? 'Результаты готовы к просмотру' : currentStep}
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between text-sm font-semibold mb-3">
                <span className="text-white/70">Прогресс</span>
                <span className="text-cyan-200">{displayProgress}/{safeTotalSteps}</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 rounded-full relative overflow-hidden ${
                      isComplete ? '' : 'transition-all duration-700 ease-out'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </div>
                </div>
                
                <div
                  className={`absolute -top-10 ${isComplete ? '' : 'transition-all duration-700 ease-out'}`}
                  style={{
                    left: `${indicatorLeft}%`,
                    transform: isComplete ? 'translateX(-100%)' : undefined
                  }}
                >
                  <div className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded-lg shadow">
                    {percentage}%
                  </div>
                </div>
              </div>
            </div>
            
            {!isComplete && (
              <div className="flex justify-center space-x-2">
                {[...Array(dotCount)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < activeDotCount
                        ? 'bg-cyan-400 w-8' 
                        : i === activeDotCount && activeDotCount < dotCount
                        ? 'bg-blue-400 w-6 animate-pulse' 
                        : 'bg-white/15'
                    }`}
                  ></div>
                ))}
              </div>
            )}
            
            {isComplete && (
              <div className="text-center animate-fade-in">
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-300 to-emerald-500 text-slate-950 font-semibold rounded-full hover:from-emerald-200 hover:to-emerald-400 transition-all duration-200 shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5">
                  Просмотреть результаты
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Analysis Button Component
const AnalysisButton = ({ csvData, columns, onAnalyze, onClearData, rowLimit, onRowLimitChange, onRemoveColumn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-[28px] border border-white/12 bg-[#0d111b]/95 backdrop-blur overflow-hidden shadow-[0_25px_90px_-50px_rgba(0,0,0,0.75)]">
          <div className="bg-gradient-to-r from-[#9ac8ff] via-[#7ab8ff] to-[#3b82f6] p-6 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 mr-3" />
                <h3 className="text-xl font-bold">Файл загружен</h3>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">готовы к анализу</span>
            </div>
          </div>
          
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-[0.12em] text-white/60">
                  <span>Записей</span>
                  <DocumentTextIcon className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-3xl font-semibold text-white font-mono-data">{csvData.length.toLocaleString()}</div>
              </div>
              
              <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-[0.12em] text-white/60">
                  <span>Столбцов</span>
                  <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div className="text-3xl font-semibold text-white font-mono-data">{columns.length}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-[0.14em]">Обнаруженные столбцы</h4>
              <div className="flex flex-wrap gap-2">
                {columns.map((col) => (
                  <span
                    key={col}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium border border-white/15 shadow-[0_6px_16px_-10px_rgba(0,0,0,0.6)]"
                  >
                    <span>{col}</span>
                    {onRemoveColumn && (
                      <button
                        type="button"
                        onClick={() => onRemoveColumn(col)}
                        className="flex items-center justify-center w-6 h-6 rounded-full border border-white/25 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 hover:border-white/40 transition"
                        aria-label={`Удалить столбец ${col}`}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </span>
                ))}
                {!columns.length && (
                  <span className="text-white/60 text-sm">Все столбцы удалены. Добавьте файл заново.</span>
                )}
              </div>
            </div>
            
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-white/80">
                Использовать первые строки для анализа
                <div className="text-xs text-white/50">Всего в файле: {csvData.length.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={csvData.length}
                  value={rowLimit ?? csvData.length}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!onRowLimitChange) return;
                    if (Number.isNaN(val)) {
                      onRowLimitChange(csvData.length);
                      return;
                    }
                    const clamped = Math.min(Math.max(1, val), csvData.length);
                    onRowLimitChange(clamped);
                  }}
                  className="w-32 rounded-lg border border-white/20 bg-[#0d111b] px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                />
                <span className="text-xs text-white/60">строк</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onAnalyze}
                className="flex-1 px-8 py-4 bg-white text-slate-900 font-semibold rounded-full transition-all duration-200 shadow-[0_20px_80px_-50px_rgba(255,255,255,0.75)] hover:-translate-y-0.5 hover:shadow-[0_30px_120px_-60px_rgba(124,242,255,0.65)] flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Начать анализ
              </button>
              <button
                onClick={onClearData}
                className="px-6 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-200 flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Другой файл
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main File Upload Step Component
const FileUploadStep = ({ 
  csvData, 
  columns, 
  isLoading, 
  isAnalyzing, 
  analysisProgress, 
  analysisStep, 
  analysisTotalSteps, 
  isAnalysisComplete, 
  error, 
  rowLimit,
  onRowLimitChange,
  onRemoveColumn,
  onFileUpload, 
  onAnalyze,
  onClearData 
}) => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {error && (
        <div className="mb-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 shadow-lg shadow-rose-500/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-semibold text-rose-100">Ошибка при обработке файла</h3>
                  <p className="mt-1 text-sm text-rose-200">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!csvData.length && !isAnalyzing && (
        <DragDropUpload onFileUpload={onFileUpload} isLoading={isLoading} />
      )}

      {csvData.length > 0 && !isAnalyzing && (
        <AnalysisButton 
          csvData={csvData}
          columns={columns}
          rowLimit={rowLimit}
          onRowLimitChange={onRowLimitChange}
          onRemoveColumn={onRemoveColumn}
          onAnalyze={onAnalyze}
          onClearData={onClearData}
        />
      )}

      {isAnalyzing && (
        <AnalysisProgress 
          progress={analysisProgress}
          currentStep={analysisStep}
          totalSteps={analysisTotalSteps}
          isComplete={isAnalysisComplete}
        />
      )}
    </div>
  );
};

// CSS animations (add to your global CSS or styled-components)
const styles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
`;

export default FileUploadStep;
