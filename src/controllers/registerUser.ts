import { asycncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asycncHandler(async (req, res) => {
    res.status(200).json(
        apiResponse({ statusCode: 200, message: "Listening" })
    );
});

export { registerUser };
