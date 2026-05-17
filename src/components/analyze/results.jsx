import moment from "moment";
import Recommendations from "../helpers/recommendations";
import clsx from "clsx";
import ResultCharts from "./charts";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Results({data = undefined}) {
    const componentRef = useRef();
    const [generating, setGenerating] = useState(false);

    const handleDownloadPdf = async () => {
        setGenerating(true);
        try {
            const element = componentRef.current;
            if (!element) {
                console.error('Element not found');
                return;
            }
    
            const elementsToHide = document.querySelectorAll('.exclude-from-pdf');
            elementsToHide.forEach(el => {
                el.style.display = 'none';
            });

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
            });

            elementsToHide.forEach(el => {
                el.style.display = '';
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            let yPosition = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();
    
            while (yPosition < pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, yPosition * -1, pdfWidth, pdfHeight);
                yPosition += pageHeight;
                if (yPosition < pdfHeight) {
                    pdf.addPage();
                }
            }
            
            pdf.save('result.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
        setGenerating(false);

    };

    return (
        <div ref={componentRef} className="h-full w-full">
            <h1 className="text-xl font-bold text-gray-900/80 mb-4">Рекомендации и графики</h1>
            <div>
                <div className="px-4 py-2 font-medium text-gray-900/80 max-w-2xl">
                    <p>{moment(data?.date).format('DD/MM/YYYY, HH:mm')}</p>
                    <div className={clsx(`border px-2 py-1 rounded-lg leading-tight my-4`)} style={{borderColor: data?.alpha > 3 ? "#86efac" : data?.alpha > 2 ? "#fdba74" : "#fca5a5",}}>
                        <p>{Recommendations.getTextByAlpha(data?.alpha)}</p>
                    </div>
                    <div className="-ml-10">
                        <ResultCharts coordinates={data?.density} capitals={data?.capitals}/>
                    </div>
                    <div>
                        <div className='grid grid-cols-1 py-3 px-6'>
                            <p className='text-center text-lg font-bold text-gray-900/80 mb-4'>Ключевые игроки (20% с наибольшими капиталами):</p>
                            <div className='grid grid-cols-1 max-h-96 overflow-y-auto'>
                                {data?.keyPlayers?.map((item, index) => {
                                    return (
                                        <div key={index} className='border-t py-2'>
                                            <p className='text-md text-gray-900/80'>Инвестор{` № ${index + 1} - `}<span className='font-semibold'>{item + ' рублей'} </span></p>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                    <div className="exclude-from-pdf">
                        <div className={clsx(generating ? 'hidden' : 'flex', "w-full items-center justify-end mt-6 mb-2")}>
                            <button onClick={handleDownloadPdf} className="transition-colors ease-in-out mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-500 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:mt-0 sm:w-auto">
                                Сохранить в PDF
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}