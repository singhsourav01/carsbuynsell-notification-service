import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { API_ERRORS } from "../constants/app.constant";

export const queryHandler = async <T>(
  queryPromise: () => Promise<T>
): Promise<T> => {
  try {
    return await queryPromise();
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      API_ERRORS.DATABASE_ERROR
    );
  }
};
