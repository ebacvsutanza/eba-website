import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';


import EBA from './EBA/EBA';
import News from './EBA/PAGES/News'
import AboutEBA from './EBA/PAGES/About';
import AboutDeveloper from './EBA/PAGES/AboutUs';


import EBAUserLogin from './EBA/PAGES/EBASTORE/UserLogin';
import EBAUserSignup from './EBA/PAGES/EBASTORE/UserSignup';
import EBAStore from './EBA/PAGES/EBASTORE/Store';
import EBACart from './EBA/PAGES/EBASTORE/Cart';
import Catalog from './EBA/PAGES/EBASTORE/Catalog';
import SetPassword from './EBA/PAGES/EBASTORE/SetPassword';

import AdminLogin from './EBA/PAGES/ADMIN/AdminLogin';
import Adminpanel from './EBA/PAGES/ADMIN/AdminPanel';
import StaffAdminpanel from './EBA/PAGES/ADMIN/StaffAdminPanel';

import './App.css';

function App() {
	return (
    <div className="text-(--primary-text) font-family text-sm">
      <BrowserRouter>
        <Routes>
          {/* BULLETIN PAGE */}
          <Route path="/" element={<EBA />}></Route>

          {/* EBA PAGE */}
          <Route path="/news" element={<News />}></Route>
          <Route path="/abouteba" element={<AboutEBA />}></Route>
          <Route path="/aboutdeveloper" element={<AboutDeveloper />}></Route>

          {/* EBA STORE PAGE */}
          <Route path="/userlogin" element={<EBAUserLogin />}></Route>
          <Route path="/usersignup" element={<EBAUserSignup />}></Route>
          <Route path="/ebastore" element={<EBAStore />}></Route>
          <Route path="/catalog" element={<Catalog />}></Route>
          <Route path="/ebacart" element={<EBACart />}></Route>
          <Route path="/set-password" element={<SetPassword />}></Route>

          {/* ADMIN PAGE */}
          <Route path="/adminlogin" element={<AdminLogin />}></Route>
          <Route path="/adminpanel" element={<Adminpanel />}></Route>
          <Route path="/staffadminpanel" element={<StaffAdminpanel />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;