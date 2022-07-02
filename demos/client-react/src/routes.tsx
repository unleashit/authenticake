import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Login from './components/Login/Login';
import About from './components/pages/About';
import Admin from './components/pages/Admin';
import Home from './components/pages/Home';
import MembersOnly from './components/pages/MembersOnly';
import Products from './components/pages/Products';
import Signup from './components/Signup/Signup';

const NotFound = () => (
  <>
    <h1>404</h1>
    <p>Page not found</p>
  </>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/about" element={<About />} />
    <Route path="/members-only" element={<MembersOnly />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
