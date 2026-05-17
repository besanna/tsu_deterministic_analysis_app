import clsx from "clsx";
import { useState } from "react";
import toast from "react-hot-toast";

export const Investors = (props) => {
    const {
        onSave = () => {},
    } = props;
    const [value, setValue] = useState(undefined);

    return (
        <div className="w-full p-4 max-h-52">
            <h1 className="text-xl font-bold text-gray-900/80">Количество инвесторов</h1>
            <p className="mb-4 text-gray-900/80 text-sm font-semibold">Введите количество инвесторов (должно быть натуральным, положительным, {` < 10000`})</p>

            <div className="flex mb-4">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-lg p-2 mr-2"
                    placeholder="Введите значение"
                />
            </div>


            <div className={clsx(`${(value == undefined || value === '') && 'hidden'}`, 'w-full flex items-center justify-center')}>
                <button
                    onClick={() => {
                        if (value > 1 && value < 10000) {
                            onSave(value)
                        } else {
                            toast.error('Количество инвесторов должно быть больше 1 и меньше 10000')
                        }
                    }}
                    className={clsx("bg-blue-500 hover:bg-blue-400 transition-all ease-in-out duration-200 text-white px-4 py-2 rounded-lg font-semibold")}

                >
                    Анализировать
                </button>
            </div>
        </div>
    );
}