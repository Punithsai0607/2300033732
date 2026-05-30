import { useEffect } from "react";
import { Log } from "./logger";

function App() {
  useEffect(() => {
    Log(
      "frontend",
      "info",
      "page",
      "Home page loaded"
    );
  }, []);

  return (
    <div>
      <h1>Afford Medical Assessment</h1>
    </div>
  );
}

export default App;