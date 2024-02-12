const asyncHandler = require("express-async-handler");
const JWT = require("../configs/JWT");
const User = require("../models/user");


const signup = asyncHandler(async (req, res) => {
    let responseObject = {};


    const { company_name, display_name, email, password, confirm_password } = req.body;
    if (!company_name || !display_name || !email || !password || !confirm_password) {
        responseObject.code = 400;
        responseObject.message = "All fields are required";
        return res.error(responseObject);
    }
    let user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
        responseObject.code = 403;
        responseObject.message = "This email is already registered, please try logging in!";

        return res.error(responseObject);
    }

    let result = await User.create({ company_name, display_name, email, password, confirm_password });

    responseObject.message = "You have successfully registered!";

    delete result.salt;
    delete result.encrypted_password;
    delete result.status;

    const accessToken = JWT.generate(result, "15m");
    const refreshToken = JWT.generate(result, "8h");

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

    responseObject.result = { accessToken };
    return res.success(responseObject);
});

const login = asyncHandler(async (req, res) => {
    let responseObject = {};

    const { email, password } = req.body;

    if (!email || !password) {
        responseObject.code = 400;
        responseObject.message = "All fields are required";
        return res.error(responseObject);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
        responseObject.code = 404;
        responseObject.message = "User not found";

        return res.success(responseObject);
    }

    if (user.authenticate(password)) {
        delete user.salt;
        delete user.encrypted_password;
        delete user.status;

        const accessToken = JWT.generate(user, "15m");
        const refreshToken = JWT.generate(user, "8h");

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        },);

        responseObject.message = "Successfully logged in";
        responseObject.result = { accessToken };

        return res.success(responseObject);
    }
    else {
        responseObject.message = "Wrong password";

        return res.error(responseObject);
    }
});


const logout = asyncHandler(async (req, res) => {
    let responseObject = {};
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    responseObject.message = "Successfully logged out";
    return res.success(responseObject);
});

const refreshToken = asyncHandler(async (req, res) => {
    let responseObject = {};

    const { jwt } = req.cookies;

    if (jwt) {
        const decoded = JWT.validate(jwt);
        if (decoded) {
            const accessToken = JWT.generate(decoded.user, "15m");

            responseObject.message = "Successfully refreshed access token";
            responseObject.result = { accessToken };

            return res.success(responseObject);
        }
        else {
            responseObject.code = 401;
            responseObject.message = "Invalid refresh token";

            return res.error(responseObject);
        }
    }
    else {
        responseObject.code = 401;
        responseObject.message = "Invalid refresh token";

        return res.error(responseObject);
    }
});


module.exports = {
    signup,
    login,
    logout,
    refreshToken
};
