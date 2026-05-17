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
        <div className="px-4 py-2">
            <h1 className="text-4xl font-semibold text-gray-900/80 mb-6">История</h1>
            <div className="my-4 w-full">
                <List data={data} onDataChange={fetchData}/>
            </div>
        </div>
    );
}