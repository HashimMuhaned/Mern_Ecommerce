import axios from "axios";

// Function to update a user field (e.g., first name, last name)
export const updateUserField = async (field, newName, otherName) => {
  try {
    const token = localStorage.getItem("authToken"); // Get token from localStorage

    // Check for uniqueness if updating the first name or last name
    if (field === "fname" || field === "lname") {
      const isUnique = await checkNameCombinationUnique(
        field === "fname" ? newName : otherName,
        field === "lname" ? newName : otherName
      );

      if (!isUnique) {
        return {
          success: false,
          message: "This name combination is already taken.",
        };
      }
    }

    // Send the update request
    const response = await axios.post(
      `${process.env.BACKEND_API}/updateUserDetails`,
      { [field]: newName },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      }
    );

    if (response.status === 200 && response.data.message === true) {
      return {
        success: true,
        message: `${
          field === "fname" ? "First Name" : "Last Name"
        } has been changed successfully`,
      };
    } else {
      return {
        success: false,
        message: "No changes were made, please try again later.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong, please try again.",
    };
  }
};

// Function to update the user's email field
export const updateUserEmailField = async (newEmail) => {
  try {
    const token = localStorage.getItem("authToken"); // Get token from localStorage

    // Check if the new email is unique
    if (newEmail) {
      const isUnique = await checkEmailUnique(newEmail);

      if (!isUnique) {
        return {
          success: false,
          message: "This email is already taken.",
        };
      }
    }

    // Send the update email request
    const response = await axios.post(
      `${process.env.BACKEND_API}/updateUserEmail`,
      { newEmail },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      }
    );

    if (response.status === 200 && response.data.message === true) {
      return {
        success: true,
        message: "Email has been changed successfully",
      };
    } else {
      return {
        success: false,
        message: "No changes were made, please try again later.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong, please try again.",
    };
  }
};

// Function to check the uniqueness of a first name and last name combination
const checkNameCombinationUnique = async (fname, lname) => {
  try {
    const token = localStorage.getItem("authToken"); // Get token from localStorage

    const response = await axios.post(
      `${process.env.BACKEND_API}/checkNameCombination`,
      { fname, lname },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      }
    );

    return response.data.isUnique;
  } catch (error) {
    return false;
  }
};

// Function to check if a new email is unique
const checkEmailUnique = async (newEmail) => {
  try {
    const token = localStorage.getItem("authToken"); // Get token from localStorage

    const response = await axios.post(
      `${process.env.BACKEND_API}/checkEmailUnique`,
      { newEmail },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      }
    );

    return response.data.isUnique;
  } catch (error) {
    return false;
  }
};
