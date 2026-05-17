import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="text-center text-4xl">
            <div className="mt-8">
                <p>Извините, но такая страница не существует.</p>
                    <Link to="/"><span className="transition-all ease-in-out duration-300 hover:text-[#007aca]">Вернуться на главную страницу</span></Link>
            </div>

      </div>
    );
}