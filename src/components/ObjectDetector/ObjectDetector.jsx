import { useState } from "react";

const ObjectDetector = () => {
  const [imageResult, setImageResult] = useState(null);
  const [error, setError] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      await fetch(process.env.REACT_APP_API_SERVER + "/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64: reader.result }),
      })
        .then((response) => response.json())
        .then((data) => setImageResult(data.result))
        .catch((err) => setError(err));
    };
  };

  return (
    <div>
      <h1>Car plate detector</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChangeImage} />
      </form>
      {imageResult && (
        <div className="image_result">
          <img src={`data:image/png;base64,${imageResult}`} alt="" />
        </div>
      )}
      {error && <p>Image not processed, please try again</p>}
    </div>
  );
};

export default ObjectDetector;
