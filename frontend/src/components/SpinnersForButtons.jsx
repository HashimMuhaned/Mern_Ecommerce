import ClipLoader from "react-spinners/ClipLoader";
import React from "react";

const override = {
  display: "flex",
  justifyContent: "center", // Corrected property
  alignItems: "center", // Added for proper centering
};

const SpinnersForButtons = () => {
  return <ClipLoader color="green" cssOverride={override} size={30} />;
};

export default SpinnersForButtons;
