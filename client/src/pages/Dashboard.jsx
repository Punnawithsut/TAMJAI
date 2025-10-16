import { useContext } from "react"
import { InformationContext } from "../contexts/InformationContext"

const Dashboard = () => {
  const { temp, humidity, lux, windowStatus, setWindowStatus } = useContext(InformationContext);

  return (
    <div className="w-full min-h-screen bg-[#f1f1f1]">
      Dashboard
    </div>
  )
}

export default Dashboard