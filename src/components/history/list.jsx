import clsx from "clsx";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../modals/modal";
import { ChartBarIcon, TableCellsIcon, DocumentTextIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import IndexedDB from "../../api/IndexedDB";
import { getDeterministicAnalysisRoute } from "./historyRoutes";

// Компонент для отображения результатов детерминационного анализа
const DeterministicAnalysisResults = ({ data, onDelete, onViewFull }) => {
    const [currentStep, setCurrentStep] = useState('frequencies');
    
    if (!data) return <div>Нет данных для отображения</div>;

    // Функция для отображения таблицы частот
    const renderFrequenciesTable = () => {
        if (!data.frequencies?.singleFreq) return <p>Нет данных о частотах</p>;
        
        return (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
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
                        {Object.entries(data.frequencies.singleFreq).map(([category, values]) =>
                            Object.entries(values).map(([value, freqData]) => (
                                <tr key={`${category}-${value}`} className="transition hover:bg-white/5">
                                    <td className="px-4 py-3 text-sm font-semibold text-white border-r border-white/10">
                                        {category}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80 border-r border-white/10">
                                        {value}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80 border-r border-white/10">
                                        {freqData.count}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-sky-100">
                                        {(freqData.frequency * 100).toFixed(2)}%
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#05070d] p-6 text-white shadow-[0_30px_120px_-60px_rgba(0,0,0,0.85)]">
            <div className="absolute inset-0 opacity-[0.32]" style={{ backgroundImage: 'var(--bg-grid)', backgroundSize: 'var(--grid-size) var(--grid-size)' }} />
            <div className="relative space-y-6">
            {/* Заголовок с кнопками действий */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">История анализа</p>
                        <h2 className="mt-1 text-2xl font-semibold text-white">
                            Результаты детерминационного анализа
                        </h2>
                        <p className="pt-15 pb-15 text-sm text-white/60">
                            Дата анализа: {moment(data.date).format('DD/MM/YYYY, HH:mm')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={onViewFull}
                            className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-300 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:shadow-sky-500/35 focus:outline-none"
                        >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                            Открыть полностью
                        </button>
                        <button
                            onClick={onDelete}
                            className="inline-flex items-center rounded-full border border-rose-300/25 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300/45 hover:bg-rose-500/20 focus:outline-none"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Удалить
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center space-x-2 text-white/70">
                            <TableCellsIcon className="w-5 h-5 text-sky-300" />
                            <span className="font-medium">Записей</span>
                        </div>
                        <p className="text-2xl font-semibold text-white font-mono-data">{data.recordCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center space-x-2 text-white/70">
                            <ChartBarIcon className="w-5 h-5 text-fuchsia-300" />
                            <span className="font-medium">Столбцов</span>
                        </div>
                        <p className="text-2xl font-semibold text-white font-mono-data">{data.columnCount}</p>
                    </div>
                </div>
            </div>

            {/* Навигация по вкладкам */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                </div>
            </div>

            {/* Отображение данных */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
                {currentStep === 'frequencies' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Условные частоты
                        </h3>
                        {renderFrequenciesTable()}
                    </div>
                )}
                {currentStep === 'intensity' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Интенсивность детерминации
                        </h3>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-white/70">
                            <p>Данные об интенсивности сохранены и доступны для просмотра.</p>
                            <p className="mt-2">Для полного просмотра нажмите "Открыть полностью"</p>
                        </div>
                    </div>
                )}
                {currentStep === 'capacity' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Ёмкость детерминации
                        </h3>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-white/70">
                            <p>Данные о ёмкости сохранены и доступны для просмотра.</p>
                            <p className="mt-2">Для полного просмотра нажмите "Открыть полностью"</p>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default function List(props) {
    const navigate = useNavigate();
    const [modalInfo, setModalInfo] = useState(undefined)    

    const handleDelete = async (item) => {
        if (window.confirm('Вы уверены, что хотите удалить этот анализ?')) {
            try {
                if (item.type === 'deterministic_analysis') {
                    await IndexedDB.deleteAnalysis(item.id);
                } else {
                    await IndexedDB.deleteItem('investment', item.id);
                }
                // Обновляем данные
                props.onDataChange?.();
                setModalInfo(undefined);
            } catch (error) {
                console.error('Ошибка при удалении:', error);
                alert('Ошибка при удалении записи');
            }
        }
    };

    const handleViewFull = (item) => {
        const route = getDeterministicAnalysisRoute(item);

        if (route) {
            navigate(route);
        }
    };

    if (props?.data == undefined || props?.data?.length == 0 ) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
                <p className="text-white/70">В истории ещё нет записей</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 w-full gap-6">
            {props.data?.map((item, index) => {
                if (item == undefined) {
                    return null;
                }

                // Определяем тип анализа
                const isDeterministicAnalysis = item?.type === 'deterministic_analysis';

                return (
                    <button
                        key={index}
		                        className={clsx(
		                            "w-full max-w-3xl min-h-[8rem] rounded-2xl px-6 py-5 relative transition-all duration-300 flex flex-col text-left border backdrop-blur hover:-translate-y-0.5",
		                            isDeterministicAnalysis
		                                ? "bg-white/5 border-white/10 text-white shadow-[0_18px_60px_-35px_rgba(95,177,255,0.65)] hover:border-sky-300/35 hover:bg-white/10"
		                                : "bg-emerald-400/10 border-emerald-300/20 text-white shadow-[0_18px_60px_-35px_rgba(16,185,129,0.55)] hover:border-emerald-300/40 hover:bg-emerald-400/15"
		                        )}
                        onClick={() => {setModalInfo(item)}}    
                    >
                        <div className="flex items-center space-x-3">
                            {isDeterministicAnalysis ? (
                                <ChartBarIcon className="w-6 h-6 text-sky-300" />
                            ) : (
                                <DocumentTextIcon className="w-6 h-6 text-emerald-300" />
                            )}
                            <p className="font-semibold text-lg text-white">
                                {isDeterministicAnalysis ? 'Детерминационный анализ' : 'Инвестиционный анализ'}
                            </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-white/55">
                                {moment(item?.date).format('DD/MM/YYYY, HH:mm')}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-white/70">
                                    {isDeterministicAnalysis ? (
                                        <>
                                            <div className="flex items-center space-x-1">
                                                <TableCellsIcon className="w-4 h-4 text-sky-300" />
                                                <span>{item?.recordCount} записей</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <ChartBarIcon className="w-4 h-4 text-fuchsia-300" />
                                                <span>{item?.columnCount} столбцов</span>
                                            </div>
                                        </>
                                    ) : (
                                        <span>α: {item?.alpha?.toFixed(5)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                )
            })}
	            <Modal
                    isOpen={modalInfo && true}
                    onClose={() => {setModalInfo(undefined)}}
                    maxWidth="min(96vw, 1120px)"
                    panelClassName="!p-0 !bg-transparent"
                    panelStyle={{ backgroundColor: 'transparent' }}
                >
	                <div className="font-medium max-h-[86vh] overflow-y-auto">
		                    {modalInfo?.type === 'deterministic_analysis' ? (
		                        <DeterministicAnalysisResults
	                            data={modalInfo}
                            onDelete={() => handleDelete(modalInfo)}
                            onViewFull={() => handleViewFull(modalInfo)}
                        />
	                    ) : (
	                        <div className="rounded-3xl border border-white/10 bg-[#05070d] p-8 text-center text-white shadow-[0_30px_120px_-60px_rgba(0,0,0,0.85)]">
	                            <p className="text-lg font-semibold">Просмотр старых результатов анализа</p>
	                            <p className="text-sm text-white/55 mt-2">
	                                Дата: {moment(modalInfo?.date).format('DD/MM/YYYY, HH:mm')}
	                            </p>
	                            <button
	                                onClick={() => handleDelete(modalInfo)}
	                                className="mt-4 inline-flex items-center rounded-full border border-rose-300/25 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300/45 hover:bg-rose-500/20"
	                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Удалить
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
