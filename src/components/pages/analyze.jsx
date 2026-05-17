import { useState } from "react";
import ProgressBar from "../progress/progress-bar";
import { Capitals } from "../analyze/capitals";
import { Investors } from "../analyze/investors";
import Results from "../analyze/results";
import InvestAPI from "../helpers/investments";
import IndexedDB from "../../api/IndexedDB";
import toast from "react-hot-toast";


export default function Analyze(props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [capitals, setCapitals] = useState([]);
    const [data, setData] = useState(undefined)
    // const [investors, setInvestors] = useState([]);

    return (
        <div className="flex flex-col items-center min-h-screen p-6">

            <div className="rounded-md bg-white shadow-md flex flex-col my-14">
                    <div>
                        <ProgressBar currentStep={currentStep} click={(stepId) => {setCurrentStep(stepId)}}/>
                        <div className="p-8 flex flex-col items-center ">
                            {currentStep == 1 && (
                                <div className="w-full">
                                    <Capitals array={capitals} onSave={(value) => {
                                        setCapitals(value);
                                        setCurrentStep(currentStep + 1);
                                        let obj = InvestAPI.analyzeInvestorCapital(value, 0.0001);
                                        IndexedDB.addItem('investment', {
                                            date: new Date(),
                                            capitals: value,
                                            ...obj
                                        })
                                        if (obj?.alpha < 1) {
                                            toast.error("Анализ таких значений невозможен")
                                            return;
                                        } 
                                        setData({...obj, capitals: value})
                                    }}/>
                                </div>
                            )}
                            {/* {currentStep == 2 && (
                                <div className="w-full">
                                    <Investors onSave={(value) => {
                                        setInvestors(value);
                                        setCurrentStep(currentStep + 1);
                                    }} />
                                </div>
                            )} */}
                            {currentStep == 2 && (
                                <div className="w-full">
                                    <Results data={data}/>
                                </div>
                            )}

                        </div>
                    </div>
            </div>
        </div>
    );
}


// import { useState } from "react";
// import InvestAPI from "../helpers/investments";
// import IndexedDB from "../../api/IndexedDB";
// import { Capitals } from "../analyze/capitals";
// import { Investors } from "../analyze/investors";
// import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// export default function Analyze (props) {
//     const [chartData, setChartData] = useState(undefined);
//     const [coordinates, setCoordinates] = useState(undefined)
//     const [keyPlayers, setKeyPlayers] = useState(undefined);
//     const [alpha, setAlpha] = useState(undefined);

//     const handleDrawAndSave = async (value) => {
//         setChartData({...chartData, investors: value});
//         let obj = InvestAPI.analyzeInvestorCapital(chartData?.capitals, +value);
//         setCoordinates(obj?.density)
//         let keyPlayersTemp = obj?.keyPlayers?.map((item, index) => {
//             return {
//                 value: item,
//                 index: index
//             }
//         })
//         setKeyPlayers(keyPlayersTemp)
//         setAlpha(obj?.alpha)
//         await IndexedDB.addItem('investment', {
//             date: new Date(),
//             capitals: chartData?.capitals,
//             investors: value,
//             coordinates: obj?.density,
//             alpha: obj?.alpha,
//             keyPlayers: keyPlayersTemp
//         })
//     }

//     return (
//         <div  className="px-4 py-2">
//             <h1 className='text-gray-900/80 text-4xl font-semibold'>Анализ</h1>
//             <div className='flex w-full gap-6 w-xl mx-auto my-4 gap-y-8 flex-col'>
//                 <div className='w-full flex gap-6 justify-start max-lg:flex-col max-lg:items-center'>
//                     <Capitals disabled={chartData?.capitals !== undefined} 
//                         onSave={(value) => {
//                             setChartData({...chartData, capitals: value});
//                             if (chartData?.capitals === undefined) {
//                                 setCoordinates(undefined)
//                             }
//                         }}
//                     />

//                     {chartData?.capitals !== undefined && chartData?.capitals.length > 1 && (
//                         <Investors disabled={chartData?.investors !== undefined} onSave={handleDrawAndSave}/>
//                     )}
//                 </div>


//                 {coordinates && chartData?.capitals && (
//                     <div className='flex gap-6 justify-start items-start max-xl:flex-col max-xl:items-center'>
//                         <div className='w-full max-w-2xl border shadow-md rounded-lg pr-4 py-4'>
//                             <p className='text-center text-xl font-bold text-gray-900/80 mb-4'>Прогнозируемый капитал</p>
//                             <ResponsiveContainer width='100%' height={300}>
//                                 <AreaChart data={coordinates}>
//                                     <XAxis
//                                         dataKey="x"
//                                         scale="log"
//                                         domain={['auto', 'auto']}
//                                         tickFormatter={(tick) => Math.floor(tick)}
//                                         type="number"
//                                     />
//                                     <YAxis />
//                                     <Tooltip  />
//                                     <Area type="monotone" dataKey="y" stroke="orange" fill="orange" fillOpacity={0.7} />
//                                 </AreaChart>
//                             </ResponsiveContainer>
//                         </div>

//                         <div className='grid grid-cols-1 border rounded-lg shadow-md py-3 px-6'>
//                             <p className='text-center text-lg font-bold text-gray-900/80 mb-4'>Ключевые игроки (20% с наибольшими капиталами):</p>
//                             {keyPlayers?.map((item, index) => {
//                                 return (
//                                     <div key={index} className='border-t py-2'>
//                                         <p className='text-md text-gray-900/80'>Инвестор{` № ${index + 1} - `}<span className='font-semibold'>{item?.value}</span></p>
//                                     </div>
//                                 );
//                             })

//                             }
//                         </div>
//                     </div>

//                 )}
//             </div>
//         </div>
//     );
// }