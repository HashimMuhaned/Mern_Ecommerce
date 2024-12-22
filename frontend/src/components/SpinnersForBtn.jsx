import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  marginLeft: "100px",
};

const SpinnersForBtn = () => {
  return <ClipLoader color="green" cssOverride={override} size={30} />;
};

export default SpinnersForBtn;
