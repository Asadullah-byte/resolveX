import './App.css';
import FloatingShapes from './components/FloatingShapes';
import GoogleAuth from './components/GoogleAuth';
import SignUp from './components/SignUp';

function App() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-green-900 
    to-emerald-900 flex items-center justify-center relative overflow-hidden'>
      <FloatingShapes color={'bg-green-500'} size={'w-64 h-64'} top={'top-5'} left={'left-10'} delay={0} />
      <FloatingShapes color={'bg-emerald-500'} size={'w-48 h-48'} top={'top-70'} left={'left-80'} delay={5} />
      <FloatingShapes color={'bg-lime-500'} size={'w-32 h-32'} top={'top-40'} left={'left-10'} delay={2} />
      
      <SignUp />
      {/* <GoogleAuth /> Uncomment this to enable Google Auth */}
    </div>
  );
}

export default App;
