
import './App.css';
import { Main } from './Main';
import { Routes, Route } from 'react-router-dom';
import { Miners } from './components/Miners';

function App() {
  
  return (
    <>

    <Routes>
      <Route path='/' element={<Main/>} />
      <Route path='/Miners' element={<Miners/>} />
    </Routes>
    </>
  );
}

export default App;
