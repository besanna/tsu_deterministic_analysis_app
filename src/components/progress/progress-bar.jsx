import { CheckIcon } from '@heroicons/react/24/solid'

const steps = [
  { id: 1, name: 'Значение капиталов'},
//   { id: 2, name: 'Portfolio Exists?'},
//   { id: 3, name: 'Your portfolio'},
//   { id: 2, name: 'Количество инвесторов'},
  { id: 2, name: 'Рекомендации'},
]

export default function ProgressBar(props) {
    const {
        click = () => {

        },
        currentStep = 1
    } = props;
    return (
        <nav aria-label="Progress">
        <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
            {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative md:flex md:flex-1">
                { (step.id) < currentStep ? (
                <a className="group flex w-full items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <CheckIcon aria-hidden="true" className="h-6 w-6 text-white" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                    </span>
                </a>
                // ) : (step.id + 1) == currentStep ? (
                //     <a className="group flex w-full items-center cursor-pointer" onClick={() => click(step.id)}>
                //     <span className="flex items-center px-6 py-4 text-sm font-medium">
                //     <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-700">
                //         <CheckIcon aria-hidden="true" className="h-6 w-6 text-white" />
                //     </span>
                //     <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                //     </span>
                // </a>
                ) : step.id == currentStep ? (
                <a aria-current="step" className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-blue-500">
                    <span className="text-blue-500">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-blue-500">{step.name}</span>
                </a>
                ) : (
                <a className="group flex items-center cursor-default">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                        <span className="text-gray-500">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500">{step.name}</span>
                    </span>
                </a>
                )}

                {stepIdx !== steps.length - 1 ? (
                <>
                    {/* Arrow separator for lg screens and up */}
                    <div aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-5 md:block">
                    <svg
                        fill="none"
                        viewBox="0 0 22 80"
                        preserveAspectRatio="none"
                        className="h-full w-full text-gray-300"
                    >
                        <path
                        d="M0 -2L20 40L0 82"
                        stroke="currentcolor"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                        />
                    </svg>
                    </div>
                </>
                ) : null}
            </li>
            ))}
        </ol>
        </nav>
    )
}