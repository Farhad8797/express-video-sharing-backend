import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "OK!"
        })
    );
});

export default healthcheck;
