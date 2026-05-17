import React from "react";
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Main from "../pages/main";
import Sidebar from "../sidebar/sidebar";
import NotFound from "../pages/not-found";
import Contacts from "../pages/contacts";
import History from "../pages/history";
import Analyze from "../pages/analyze";
import { Toaster } from "react-hot-toast";
import Deterministic from "../analyze/deterministic";
// import CompatibilityTableGenerator from "../analyze/deterministic-simple";

const guestRoute = (
    <Routes>
        <Route path='/' element={<Main/>}/>
        <Route path='/analyze' element={<Analyze/>}/>
        <Route path='/deterministic' element={<Deterministic/>}/>
        {/* <Route path='/deterministic-simple' element={<CompatibilityTableGenerator/>}/>         */}
        <Route path='/history' element={<History/>} />
        <Route path='/contacts' element={<Contacts/>}/>
        <Route path='*' element={<NotFound/>}/>
    </Routes>
);

export default function RouterApp(props) {
    let route = guestRoute;

    return (
        <BrowserRouter basename="/tsu-invest-app">
            <Sidebar component={route}/>
            <Toaster/>
        </BrowserRouter>
    );
}