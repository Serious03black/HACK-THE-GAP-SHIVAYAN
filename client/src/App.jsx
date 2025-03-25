import './App.css'
import StudentRouter from './routes/student/StudentRoute';
import UniversityRouter from './routes/university/UniversityRoute';
import { Route, Routes } from 'react-router-dom';


function App() {

  return (


    <Routes>  
      {/* Student Routes */}
      <Route path='/*' element={ <StudentRouter />} />


      {/* University Routes */}
      <Route path='/university/*' element={ <UniversityRouter />} />
      
      <Route path='*' element={<h1>404 Page Not Found</h1>} />

    </Routes>























  )
}










export default App