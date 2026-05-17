import { useEffect, useState } from "react";
import IndexedDB from "../../api/IndexedDB";
import List from "../history/list";

export default function History() {

    const [data, setData] = useState([])

    const fetchData = async () => {
        // Получаем данные из обеих таблиц
        const investmentData = await IndexedDB.getItems('investment');
        const analysisData = await IndexedDB.getItems('analysis');
        
        // Объединяем и сортируем по дате
        const allData = [...(investmentData || []), ...(analysisData || [])]
            .sort((a, b) => b.date - a.date);
        
        console.log('All data:', allData);
        setData(allData);
    };

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden analysis-shell">
            <div className="analysis-grid" />
            <div className="grain" />

            <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(130deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01)),radial-gradient(120%_110%_at_10%_20%,rgba(95,177,255,0.12),transparent_35%),radial-gradient(120%_110%_at_85%_0%,rgba(37,99,235,0.12),transparent_32%)] p-8 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.65)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Сохраненные расчеты</p>
                    <h1 className="mt-2 text-4xl font-semibold text-white">История</h1>
                </div>

                <div className="w-full">
                    <List data={data} onDataChange={fetchData}/>
                </div>
            </div>
        </div>
    );
}
