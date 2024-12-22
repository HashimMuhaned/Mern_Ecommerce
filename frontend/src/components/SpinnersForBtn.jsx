import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  position: "absolute",
  top: "50%",
  left: "70%",
};

const SpinnersForBtn = () => {
  return <ClipLoader color="green" cssOverride={override} size={30} />;
};

export default SpinnersForBtn;
