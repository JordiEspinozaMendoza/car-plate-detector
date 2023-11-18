const steps = [
  {
    title: "Find your car plate image",
    description: "Upload an image of your car plate or take a photo of it.",
    iconClass: "fas fa-camera",
  },
  {
    title: "Upload the image",
    description: "Upload the image to the website.",
    iconClass: "fas fa-file-upload",
  },
  {
    title: "Get the results",
    description: "Get the results of the car plate detection.",
    iconClass: "fas fa-check",
  },
];

const Onboarding = () => {
  return (
    <div className="onboarding">
      <h2>How does it work?</h2>
      <div className="steps">
        {steps.map((step, index) => (
          <div key={index} className="step">
            <i className={step.iconClass}></i>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
