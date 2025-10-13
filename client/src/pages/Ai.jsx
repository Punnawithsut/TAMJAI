import { useContext } from "react"
import { InformationContext } from "../contexts/InformationContext"

const Ai = () => {
  const {temp, humidity, lux, time} = useContext(InformationContext)
  

  return (
    <div>
      ai
    </div>
  )
}

export default Ai