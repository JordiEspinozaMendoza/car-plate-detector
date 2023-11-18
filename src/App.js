import { useState, useEffect } from "react";
import "./App.css";
import ObjectDetector from "./components/ObjectDetector/ObjectDetector";
import { Loader } from "./components/Loader";
import Footer from "./components/Footer/Footer";

function App() {
  const [loadingFetchServerStatus, setLoadingFetchServerStatus] =
    useState(false);
  const [serverStatus, setServerStatus] = useState(false);

  const handleFetchServerStatus = async () => {
    try {
      setLoadingFetchServerStatus(true);
      const response = await fetch(
        process.env.REACT_APP_API_SERVER + "/notify/v1/health"
      );
      const data = await response.json();
      setServerStatus(data.status);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingFetchServerStatus(false);
    }
  };

  useEffect(() => {
    handleFetchServerStatus();
  }, []);

  return (
    <div className="App">
      <div id="header">
        <h1>Car Plate Detector</h1>
      </div>
      {loadingFetchServerStatus ? (
        <Loader message="Loading server status" />
      ) : serverStatus === "UP" ? (
        <ObjectDetector />
      ) : (
        <div className="server-down">
          <h2>Server is down</h2>
          <img
            alt="kermit falling"
            src="https://media.tenor.com/wsbmWYxnJYQAAAAd/kermit-falling.gif"
          />
          <button onClick={handleFetchServerStatus}>Try again</button>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;
