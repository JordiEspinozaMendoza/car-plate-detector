export const normalizePredictions = (predictions, imgSize, imageRef) => {
  if (!predictions || !imgSize || !imageRef) return predictions || [];
  return predictions.map((prediction) => {
    const { bbox } = prediction;
    const oldX = bbox[0];
    const oldY = bbox[1];
    const oldWidth = bbox[2];
    const oldHeight = bbox[3];

    const imgWidth = imageRef.width;
    const imgHeight = imageRef.height;

    const x = (oldX * imgWidth) / imgSize.width;
    const y = (oldY * imgHeight) / imgSize.height;
    const width = (oldWidth * imgWidth) / imgSize.width;
    const height = (oldHeight * imgHeight) / imgSize.height;

    return { ...prediction, bbox: [x, y, width, height] };
  });
};
