'use client'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx';

export default function Modal(props) {
    const {
        canClose = true,
        onClose = () => {

        },
        isOpen = false,
        maxWidth = undefined,
    } = props;

    return (
        <Dialog 
            open={isOpen} 
            onClose={() => {
                if (canClose) {
                    onClose();
                }
            }} 
            className="relative z-[100]"
        >
            <DialogBackdrop
                className="fixed top-0 left-0 inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
                    <DialogPanel
                        style={{maxWidth: maxWidth ? maxWidth : null}}
                        className={clsx(``, "no-scroll max-h-[calc(100dvh-48px)] overflow-hidden overflow-y-auto relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-fit sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95")}
                    >
                        {canClose == false ? null :
                            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                <button
                                    type="button"
                                    onClick={() => onClose()}
                                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-transparent focus:ring-offset-2"
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                                </button>
                            </div>
                        }

                        {props.children}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}