export const Loader = ({ message = "Loading your amazing results" }) => {
  return (
    <div className="spinner">
      <i className="fas fa-circle-notch fa-spin"></i>
      <span>{message}</span>

      <img
        src="https://media.tenor.com/XgaU95K_XiwAAAAC/kermit-typing.gif"
        alt="kermit typing"
      />
    </div>
  );
};
