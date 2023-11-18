import { useState } from "react";
import { Loader } from "../Loader";
import Onboarding from "../Onboarding/Onboarding";

const ObjectDetector = () => {
  const [foundedCarPlates, setFoundedCarPlates] = useState([]);
  const [results, setResults] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setFoundedCarPlates([]);
    setError(null);
    setLoading(false);
    setResults(false);
    setSuccess(false);
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
        setSuccess(true);
      })
      .catch(() => {
        setError(true);
        setSuccess(false);
      });

    setLoading(false);
  };

  return (
    <div className="object_detector">
      {!loading && (
        <>
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
          {!success && !error && <Onboarding />}
        </>
      )}

      <div className="results">
        {loading && <Loader />}
        {results && foundedCarPlates.length > 0 && (
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
        {success && (
          <>
            {foundedCarPlates.length > 0 ? (
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
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="image_result">
                <h2>No car plates found</h2>
                <img
                  className="image_result_item"
                  src="https://media.tenor.com/GopcJIF_Y98AAAAC/lost-kermit.gif"
                  alt=""
                />
              </div>
            )}
          </>
        )}

        {error && <p>Image not processed, please try again</p>}
        {error || (success && <button onClick={resetState}>Try again</button>)}
      </div>
    </div>
  );
};

export default ObjectDetector;
