import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer';
import Navbar from './../components/Navbar';

function UniversityLayout() {
  return (
    <div>

        <header>
            <Navbar  />
        </header>

        <main className="">
            <Outlet />
        </main>   

        <footer>
            <Footer />
        </footer>
  
  
    </div>
  )
}

export default UniversityLayout