import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { ContextProvider } from './MyContext.jsx'; 
function App() {
  return (
    <div className='app'>
      {/* We use ContextProvider here. 
         It holds ALL state (Auth + Chat + Threads), 
         so Sidebar and ChatWindow can access everything.
      */}
      <ContextProvider>
        <Sidebar />
        <ChatWindow />
      </ContextProvider>
    </div>
  )
}

export default App;