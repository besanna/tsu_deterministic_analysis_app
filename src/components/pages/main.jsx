import { ChartBarIcon, TableCellsIcon, MagnifyingGlassIcon, DocumentArrowDownIcon, ClockIcon, CheckCircleIcon, ArrowRightIcon, BeakerIcon, CpuChipIcon, ArrowTrendingUpIcon, CubeTransparentIcon, DocumentTextIcon, CalculatorIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Main() {
    // В реальном приложении здесь будет useNavigate() из react-router-dom
    // const navigate = (path) => console.log(`Navigate to: ${path}`);
    const navigate = useNavigate();




    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden relative">

            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-5 z-0">
                <div className="h-full w-full" style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Main Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-indigo-500/20">
                        <CubeTransparentIcon className="w-10 h-10 text-white" />
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Детерминационный анализ
                        </span>
                    </h1>
                    
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Математический инструмент для анализа зависимостей в данных. 
                        Загрузите CSV или Excel файл и получите полный анализ условных частот, 
                        интенсивностей и ёмкостей детерминации.
                    </p>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4 justify-center mt-10">
                        <button 
                            onClick={() => navigate('/analyze')}
                            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-indigo-500/30 flex items-center"
                        >
                            <BeakerIcon className="w-5 h-5 mr-2" />
                            Начать анализ
                            <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => navigate('/history')}
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 flex items-center"
                        >
                            <ClockIcon className="w-5 h-5 mr-2" />
                            История анализов
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    <FeatureCard 
                        icon={<TableCellsIcon className="w-6 h-6" />}
                        title="Условные частоты"
                        description="Анализ частот появления значений в различных категориях и их взаимосвязей"
                        formula="P(A|B) = P(A∩B)/P(B)"
                        color="blue"
                    />
                    <FeatureCard 
                        icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
                        title="Интенсивность детерминации"
                        description="Определение силы влияния одного признака на другой"
                        formula="I(X;Y) = H(X) - H(X|Y)"
                        color="purple"
                    />
                    <FeatureCard 
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        title="Ёмкость детерминации"
                        description="Оценка доли случаев для конкретных комбинаций значений"
                        formula="D = Σ p(x,y) log(p(x,y)/(p(x)p(y)))"
                        color="indigo"
                    />
                    <FeatureCard 
                        icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                        title="Фокусный анализ"
                        description="Поиск наилучших зависимостей для выбранных значений"
                        formula="λ = (Σmax(fij) - max(fi+))/(n - max(fi+))"
                        color="green"
                    />
                    <FeatureCard 
                        icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />}
                        title="Анализ существенности"
                        description="Выявление уточняющих факторов через тройные комбинации"
                        formula="χ² = Σ (O-E)²/E"
                        color="orange"
                    />
                    <FeatureCard 
                        icon={<DocumentTextIcon className="w-6 h-6" />}
                        title="Экспорт в PDF"
                        description="Сохранение результатов анализа в удобном формате"
                        formula="R² = 1 - SSres/SStot"
                        color="red"
                    />
                </div>

                {/* Process Flow */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center">Процесс анализа</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <ProcessStep 
                            icon={<DocumentArrowDownIcon className="w-8 h-8" />}
                            title="Загрузка"
                            subtitle="CSV/Excel"
                        />
                        <ArrowRight />
                        <ProcessStep 
                            icon={<CalculatorIcon className="w-8 h-8" />}
                            title="Расчёт"
                            subtitle="Автоматический"
                        />
                        <ArrowRight />
                        <ProcessStep 
                            icon={<ChartBarIcon className="w-8 h-8" />}
                            title="Визуализация"
                            subtitle="Таблицы и графики"
                        />
                        <ArrowRight />
                        <ProcessStep 
                            icon={<MagnifyingGlassIcon className="w-8 h-8" />}
                            title="Анализ"
                            subtitle="Зависимости"
                        />
                        <ArrowRight />
                        <ProcessStep 
                            icon={<DocumentTextIcon className="w-8 h-8" />}
                            title="Экспорт"
                            subtitle="PDF отчёт"
                        />
                    </div>
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <CpuChipIcon className="w-6 h-6 mr-2 text-indigo-400" />
                            Технические возможности
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Обработка больших массивов данных (до 10,000 строк)</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Поддержка множественных переменных</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Автоматическое определение типов данных</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Расчёт статистической значимости</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <DocumentTextIcon className="w-6 h-6 mr-2 text-purple-400" />
                            Формат результатов
                        </h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Интерактивные таблицы с сортировкой</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Визуализация через тепловые карты</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Подробные текстовые интерпретации</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>PDF отчёт с полным анализом</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, formula, color }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        indigo: 'from-indigo-500 to-indigo-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
        red: 'from-red-500 to-red-600'
    };

    return (
        <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">{description}</p>
            {/* <div className="text-xs font-mono text-blue-300 opacity-70">{formula}</div> */}
        </div>
    );
}

function ProcessStep({ icon, title, subtitle }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-white/10 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-gray-400">{subtitle}</div>
        </div>
    );
}

function ArrowRight() {
    return (
        <div className="hidden md:flex justify-center">
            <ArrowRightIcon className="w-6 h-6 text-gray-500" />
        </div>
    );
}