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
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Категория
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Значение
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Количество
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Частота
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(data.frequencies.singleFreq).map(([category, values]) =>
                            Object.entries(values).map(([value, freqData]) => (
                                <tr key={`${category}-${value}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                        {category}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 border-r">
                                        {value}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 border-r">
                                        {freqData.count}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
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
        <div className="space-y-6">
            {/* Заголовок с кнопками действий */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Результаты детерминационного анализа
                    </h2>
                    <div className="flex space-x-3">
                        <button
                            onClick={onViewFull}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                        >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                            Открыть полностью
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Удалить
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <TableCellsIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Записей</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-800">{data.recordCount}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-900">Столбцов</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-800">{data.columnCount}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Дата анализа: {moment(data.date).format('DD/MM/YYYY, HH:mm')}
                </p>
            </div>

            {/* Навигация по вкладкам */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setCurrentStep('frequencies')}
                        className={`px-6 py-2 rounded-md font-medium ${
                            currentStep === 'frequencies'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Условные частоты
                    </button>
                    <button
                        onClick={() => setCurrentStep('intensity')}
                        className={`px-6 py-2 rounded-md font-medium ${
                            currentStep === 'intensity'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Интенсивность
                    </button>
                    <button
                        onClick={() => setCurrentStep('capacity')}
                        className={`px-6 py-2 rounded-md font-medium ${
                            currentStep === 'capacity'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Ёмкость
                    </button>
                </div>
            </div>

            {/* Отображение данных */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {currentStep === 'frequencies' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Условные частоты
                        </h3>
                        {renderFrequenciesTable()}
                    </div>
                )}
                {currentStep === 'intensity' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Интенсивность детерминации
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p>Данные об интенсивности сохранены и доступны для просмотра.</p>
                            <p className="mt-2">Для полного просмотра нажмите "Открыть полностью"</p>
                        </div>
                    </div>
                )}
                {currentStep === 'capacity' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ёмкость детерминации
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p>Данные о ёмкости сохранены и доступны для просмотра.</p>
                            <p className="mt-2">Для полного просмотра нажмите "Открыть полностью"</p>
                        </div>
                    </div>
                )}
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
            <div>
                <p>В истории ещё нет записей</p>
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
                            "w-full max-w-3xl h-32 shadow-sm rounded-lg font-medium px-6 py-4 text-gray-900/80 relative hover:shadow-xl transition-all ease-in-out duration-300 flex flex-col justify-between",
                            isDeterministicAnalysis 
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100" 
                                : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100"
                        )}
                        onClick={() => {setModalInfo(item)}}    
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {isDeterministicAnalysis ? (
                                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                                ) : (
                                    <DocumentTextIcon className="w-6 h-6 text-green-600" />
                                )}
                                <div>
                                    <p className="font-semibold text-lg">
                                        {isDeterministicAnalysis ? 'Детерминационный анализ' : 'Инвестиционный анализ'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {moment(item?.date).format('DD/MM/YYYY, HH:mm')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-4 text-sm">
                                {isDeterministicAnalysis ? (
                                    <>
                                        <div className="flex items-center space-x-1">
                                            <TableCellsIcon className="w-4 h-4 text-blue-500" />
                                            <span>{item?.recordCount} записей</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <ChartBarIcon className="w-4 h-4 text-blue-500" />
                                            <span>{item?.columnCount} столбцов</span>
                                        </div>
                                    </>
                                ) : (
                                    <span>α: {item?.alpha?.toFixed(5)}</span>
                                )}
                            </div>
                        </div>
                    </button>
                )
            })}
            <Modal isOpen={modalInfo && true} onClose={() => {setModalInfo(undefined)}}>
                <div className="px-4 py-2 font-medium text-gray-900/80 max-w-4xl max-h-[80vh] overflow-y-auto">
                    {modalInfo?.type === 'deterministic_analysis' ? (
                        <DeterministicAnalysisResults 
                            data={modalInfo} 
                            onDelete={() => handleDelete(modalInfo)}
                            onViewFull={() => handleViewFull(modalInfo)}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <p>Просмотр старых результатов анализа</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Дата: {moment(modalInfo?.date).format('DD/MM/YYYY, HH:mm')}
                            </p>
                            <button
                                onClick={() => handleDelete(modalInfo)}
                                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 flex items-center mx-auto"
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
