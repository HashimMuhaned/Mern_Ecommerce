import axios from "axios";

export const updateUserField = async (field, newName, otherName) => {
  try {
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

    const response = await axios.post(
      "/api/updateUserDetails",
      { [field]: newName },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
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

export const updateUserEmailField = async (newEmail) => {
  try {
    // Check for uniqueness if updating the first name or last name
    if (newEmail) {
      const isUnique = await checkEmailUnique(newEmail);

      if (!isUnique) {
        return {
          success: false,
          message: "This Email is already taken.",
        };
      }
    }

    const response = await axios.post(
      "/api/updateUserEmail",
      { newEmail },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status === 200 && response.data.message === true) {
      return {
        success: true,
        message: "Email has been changed successfuly",
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

const checkNameCombinationUnique = async (fname, lname) => {
  try {
    const response = await axios.post("/api/checkNameCombination", {
      fname,
      lname,
    });

    return response.data.isUnique;
  } catch (error) {
    return false;
  }
};

const checkEmailUnique = async (newEmail) => {
  try {
    const response = await axios.post("/api/checkEmailUnique", {
      newEmail,
    });

    return response.data.isUnique;
  } catch (error) {
    return false;
  }
};

