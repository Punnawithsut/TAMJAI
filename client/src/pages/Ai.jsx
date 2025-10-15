import { useContext } from "react"
import { InformationContext } from "../contexts/InformationContext"

const Ai = () => {
  const { analyze, message } = useContext(InformationContext)

  return (
    <div>
      <p>AI</p>
      <button onClick={analyze}>Get AI Advice</button><br></br>
      {message != "" ? <p>{message}</p> : <p>loading...</p>}
    </div>
  )
}

export default Ai