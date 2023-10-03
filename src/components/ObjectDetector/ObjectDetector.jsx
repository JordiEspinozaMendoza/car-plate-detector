import { useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-cpu";
import { normalizePredictions } from "../../utils";
import { TargetBox } from "../TargetBox/TargetBox";

const ObjectDetector = () => {
  const [image, setImage] = useState();
  const [foundedCarPlates, setFoundedCarPlates] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [foundedCars, setFoundedCars] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const imageRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const resetState = () => {
    setImage(null);
    setFoundedCarPlates([]);
    setPredictions([]);
    setFoundedCars([]);
    setError(null);
    setLoading(false);
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    resetState();

    setImage(file);

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      setLoading(true);

      const imageElement = document.createElement("img");
      imageElement.src = reader.result;

      imageElement.onload = async () => {
        const predictions = await detectObjectsOnImage(imageElement, {
          width: imageElement.width,
          height: imageElement.height,
        });

        if (predictions.length) {
          predictions.forEach((prediction) => {
            // create a canvas element
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const x = prediction.bbox[0];
            const y = prediction.bbox[1];
            const width = prediction.bbox[2];
            const height = prediction.bbox[3];

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(
              imageElement,
              x,
              y,
              width,
              height,
              0,
              0,
              width,
              height
            );

            setFoundedCars((prev) => [...prev, canvas.toDataURL("image/png")]);
          });
        }
      };

      setLoading(false);
    };
  };

  const detectObjectsOnImage = async (imageElement, imgSize) => {
    const model = await cocoSsd.load({});

    const predictions = await model.detect(imageElement, 7);
    const normalizedPredictions = normalizePredictions(
      predictions,
      imgSize,
      imageRef.current
    ).filter((p) => p.class === "car");

    setPredictions(normalizedPredictions);

    return normalizedPredictions;
  };

  const handleImageClick = async (e) => {
    setLoading(true);

    const base64 = e.target.src;

    await fetch(process.env.REACT_APP_API_SERVER + "/api/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64 }),
    })
      .then((response) => response.json())
      .then((data) => setFoundedCarPlates(data.result))
      .catch(() => setError(true));

    setLoading(false);
  };

  return (
    <div>
      <h1>Car plate detector</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChangeImage} />
      </form>
      {loading && <p>Processing image...</p>}
      {image && (
        <div className="detector_container">
          <img src={URL.createObjectURL(image)} alt="" ref={imageRef} />
          {predictions.length &&
            predictions.map((prediction, idx) => (
              <TargetBox
                key={idx}
                x={prediction.bbox[0]}
                y={prediction.bbox[1]}
                width={prediction.bbox[2]}
                height={prediction.bbox[3]}
                classType={prediction.class}
                score={prediction.score * 100}
              />
            ))}
        </div>
      )}
      {foundedCars.length > 0 && (
        <div className="founded_cars">
          <h2>Founded cars</h2>
          <span>Click on the car to see the car plate</span>
          <div className="founded_cars_list">
            {foundedCars.map((car, idx) => (
              <img
                key={idx}
                src={car}
                alt=""
                className="founded_car"
                onClick={handleImageClick}
              />
            ))}
          </div>
        </div>
      )}
      {foundedCarPlates.length > 0 && (
        <div className="image_result">
          <h2>Possible founded car plates:</h2>
          <div className="image_result_list">
            {foundedCarPlates.map((plate, idx) => (
              <img
                key={idx}
                src={"data:image/png;base64," + plate}
                alt=""
                className="image_result_item"
              />
            ))}
          </div>
        </div>
      )}
      {error && <p>Image not processed, please try again</p>}
    </div>
  );
};

export default ObjectDetector;
