import { Link } from "react-router-dom"

const NavBar = () => {
  return (
    <div className="w-full h-20 bg-[#1800ad] flex justify-between items-center px-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Comfort Zone</h1>
      </div>
      <div className="flex gap-20 mr-20">
        <Link to="/" className="text-white hover:underline">Home</Link>
        <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
        <Link to="/ai" className="text-white hover:underline">AI</Link>
      </div>
    </div>
  )
}

export default NavBar
