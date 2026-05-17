import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  ClockIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { name: 'Главная', href: '/', icon: HomeIcon},
//   { name: 'Инвестиционный анализ', href: '/analyze', icon: PresentationChartLineIcon},
  { name: 'Детерминационный анализ', href: '/deterministic', icon: PresentationChartLineIcon},
//   { name: 'Детерминационный анализ (упр.)', href: '/deterministic-simple', icon: PresentationChartLineIcon},
  { name: 'История', href: '/history', icon: ClockIcon},
]

const getPageName = (pathname) => {
    const pageName = navigation?.map((item) => {
        if  (item.href === pathname) {
            return item?.name;
        }
    }) || '';
    return pageName
}

export default function Sidebar({component, props}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <>
            <div>
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                        transition
                        className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            </TransitionChild>
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                                <div className="flex h-16 shrink-0 items-center">
                                    <img
                                        alt="TSU"
                                        src="favicon.jpg"
                                        className="h-8 w-auto"
                                    />
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.name}>
                                                        <button
                                                            onClick={() => {navigate(item.href); setSidebarOpen(false)}}
                                                            className={clsx(`${item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6`)}
                                                        >
                                                            <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                                                            {item.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
                        <div className="flex h-24 shrink-0 items-center">
                            <img
                                alt="TSU"
                                src="favicon.jpg"
                                className="h-16 w-auto"
                            />
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                        <li key={item.name} className=''>
                                            <button 
                                                onClick={() => {navigate(item.href); setSidebarOpen(false)}}
                                                className={clsx(`${location.pathname === item?.href ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`, "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full")}
                                            >
                                                <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                                                {item.name}
                                            </button>
                                        </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
                    <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                    </button>
                    <div className="flex-1 text-sm font-semibold leading-6 text-white">{getPageName(location.pathname) ? getPageName(location.pathname) : 'URL not Found'}</div>

                </div>

                <main className="max-sm:py-10 lg:pl-72 bg-gray-50 min-h-screen">
                    <div className="max-sm:px-4">{component}</div>
                </main>
            </div>
        </>
    )
}