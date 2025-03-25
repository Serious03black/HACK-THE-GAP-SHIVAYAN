import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function StudentLayout() {
  return (
    <div>

        <header>
              <Navbar />
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

export default StudentLayout