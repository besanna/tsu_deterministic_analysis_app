import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import toast from "react-hot-toast";
import { CSVReader } from "./file-reader";
import { Switch } from "@headlessui/react";

export const Capitals = (props) => {
    const {
        onSave = () => { },
        array = []
    } = props;

    const [enabled, setEnabled] = useState(false)
    const [numbers, setNumbers] = useState(array);
    const [inputValue, setInputValue] = useState('');


    const addNumber = () => {
        const num = parseFloat(inputValue);
        if (num > 0 && num < 100000000) {
            setNumbers([...numbers, num]);
            setInputValue('');
        } else {
            toast.error(`Значение должно быть в диапазоне (1 ⩽ x ⩽ 100000000)`)
        }
    };

    const removeNumber = (index) => {
        const newNumbers = numbers.filter((_, i) => i !== index);
        setNumbers(newNumbers);

    };

    return (
        <div className="w-full p-4 h-fit relative">
            <h1 className="text-xl font-bold text-gray-900/80">Значения капиталов</h1>
            <p className="mb-4 text-gray-900/80 text-sm font-semibold">Введите суммы капиталов для анализа (должно быть два и более значений)</p>

            <div className="w-full flex items-center justify-center gap-4 mb-6">
                <p>Вручную</p>
                <Switch
                    checked={enabled}
                    onChange={setEnabled}
                    className={`${
                        enabled ? 'bg-blue-200' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                    <span className="sr-only">Enable notifications</span>
                    <span
                        className={`${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                </Switch>
                <p>Файлом</p>
            </div>

            <div className={clsx(enabled && "hidden", "flex w-full flex-col items-center justify-center gap-2")}>
                <div className="flex w-full">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-grow border border-gray-300 rounded-lg p-2 mr-2"
                        placeholder="Введите значение"
                        onKeyPress={(e) => e.key === 'Enter' && addNumber()}
                    />
                    <button
                        onClick={addNumber}
                        className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded-lg transition-all ease-in-out duration-200"
                    >
                        <PlusIcon className='w-6 h-6'/>
                    </button>
                </div>

                <ul className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                    {numbers.map((num, index) => (
                        <li key={index} className="flex justify-between items-center border-b py-2">
                            <span className='text-gray-500 font-semibold text-sm'>{num}</span>
                            <button
                                onClick={() => {
                                    removeNumber(index);
                                }}
                                className={clsx("text-red-500 hover:text-red-700 transition-all ease-in-out duration-200")}
                            >
                                <TrashIcon className='w-6 h-6'/>
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="flex w-full items-center justify-center mt-6">
                    <button
                        type="button"
                        className="transition-colors ease-in-out mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-500 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:mt-0 sm:w-auto"
                        onClick={() => {
                            if (numbers == undefined || numbers?.length < 2) {
                                toast.error(`Вы должны ввести два и более значения`)
                            } else {
                                onSave(numbers)
                            }
                        }}
                    >
                    Анализировать
                    </button>
                </div>
            </div>
            {/* <p className={clsx(`${numbers.length > 1 && 'hidden'}`, 'absolute bottom-0 right-1 italic text-[13px] font-medium text-gray-500')}>должно быть два и более значений</p> */}

            <div className={clsx(enabled == false && "hidden")}>
                <CSVReader onDataParsed={(values) => {
                    if (values?.errors > 0) {
                        toast.error(`Файл содержит "${values?.errors}" значений вне допустимого диапазона (1 ⩽ x ⩽ 100000000)`)
                    } else if (values?.length <= 2) {
                        toast.error(`В файле должно быть два и более значений`)
                    } else {
                        onSave(values)
                    }
                }}/>
            </div>


        </div>
    );
};