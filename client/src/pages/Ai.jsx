import { useContext } from "react"
import { InformationContext } from "../contexts/InformationContext"

const Ai = () => {
  const { analyze, message, addData } = useContext(InformationContext)

  return (
    <div>
      <p>AI</p>
      <button onClick={analyze}>Get AI Advice</button><br></br>
      {message != "" ? <p>{message}</p> : <p>loading...</p>}
      <button onClick={addData}>Add Data</button><br></br>
    </div>
  )
}

export default Ai