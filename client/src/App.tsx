import { Toaster } from "react-hot-toast"
import HomePage from "./pages/public/HomePage"


const App = () => {
  return (
    <div>
      <HomePage />
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  )
}

export default App