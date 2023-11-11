import { useState } from "react";
import { Loader } from "../Loader";

const ObjectDetector = () => {
  const [foundedCarPlates, setFoundedCarPlates] = useState([]);
  const [results, setResults] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setFoundedCarPlates([]);
    setError(null);
    setLoading(false);
    setResults(false);
  };

  const handleChangeImage = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file, file.name);

    resetState();
    setLoading(true);

    await fetch(process.env.REACT_APP_API_SERVER + "/api/process-image", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setFoundedCarPlates(data.car_plates);
        setResults(data.results);
      })
      .catch(() => setError(true));

    setLoading(false);
  };

  return (
    <div>
      <h1>Car plate detector</h1>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/bmp, image/webp"
        hidden
        onChange={handleChangeImage}
      />
      <button
        disabled={loading}
        onClick={() => document.querySelector("input[type=file]").click()}
      >
        Upload image
      </button>

      {loading && <Loader />}

      <div className="results">
        {results && (
          <div className="image_result">
            <h2>Results</h2>
            <div className="image_result_list">
              <img
                src={"data:image/png;base64," + results}
                alt=""
                className="image_result_item"
              />
            </div>
          </div>
        )}

        {foundedCarPlates.length > 0 && (
          <div className="image_result">
            <h3>Founded car plates: {foundedCarPlates.length}</h3>
            <div className="image_result_list">
              {foundedCarPlates.map((carPlate, index) => (
                <div key={index} className="image_result_item_container">
                  <img
                    src={"data:image/png;base64," + carPlate?.image}
                    alt=""
                    className="image_result_item"
                  />
                  {/* <span>Car plate: {carPlate?.text}</span> */}
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <p>Image not processed, please try again</p>}
      </div>
    </div>
  );
};

export default ObjectDetector;
