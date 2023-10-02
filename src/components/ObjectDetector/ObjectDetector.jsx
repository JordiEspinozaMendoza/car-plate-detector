import { useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-cpu";
import { normalizePredictions } from "../../utils";
import { TargetBox } from "../TargetBox/TargetBox";

const ObjectDetector = () => {
  const [image, setImage] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const imageRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    setImage(file);

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      setLoading(true);
      setError(false);
      setImageResult(null);

      const imageElement = document.createElement("img");
      imageElement.src = reader.result;

      imageElement.onload = async () => {
        const predictions = await detectObjectsOnImage(imageElement, {
          width: imageElement.width,
          height: imageElement.height,
        });

        if (predictions.length) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const x = predictions[0].bbox[0];
          const y = predictions[0].bbox[1];
          const width = predictions[0].bbox[2];
          const height = predictions[0].bbox[3];

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(imageElement, x, y, width, height, 0, 0, width, height);

          document.body.appendChild(canvas);

          const base64 = canvas.toDataURL("image/png");

          await fetch(process.env.REACT_APP_API_SERVER + "/api/process-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ base64 }),
          })
            .then((response) => response.json())
            .then((data) => setImageResult(data.result))
            .catch(() => setError(true));
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
      {imageResult && (
        <div className="image_result">
          <h2>Predicted car plate</h2>
          <img src={`data:image/png;base64,${imageResult}`} alt="" />
          <span>The value of the car plate is:</span>
        </div>
      )}
      {error && <p>Image not processed, please try again</p>}
    </div>
  );
};

export default ObjectDetector;
