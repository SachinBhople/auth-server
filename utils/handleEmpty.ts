import validator from "validator";

// Define a type for the config object
type Config = { [key: string]: any };

// Define a type for the return object
interface ValidationResult {
  isError: boolean;
  error: { [key: string]: string };
}

// Create a function to check the required fields
export const checkEmpty = (config: Config): ValidationResult => {
  const error: { [key: string]: string } = {};
  let isError = false;

  for (const item in config) {
    if (!config[item]) {
      error[item] = `${item} is required`;
      isError = true;
    } else if (validator.isEmpty(String(config[item] || ""))) {
      error[item] = `${item} is required`;
      isError = true;
    }
  }

  return { isError, error };
};
