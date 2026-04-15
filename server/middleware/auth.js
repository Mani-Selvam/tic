import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        console.log(
            "Auth middleware - Authorization header:",
            req.header("Authorization"),
        ); // Debug
        console.log("Auth middleware - Token extracted:", token); // Debug

        if (!token) {
            console.log("Auth middleware - No token found"); // Debug
            return res
                .status(401)
                .json({ message: "No token, authorization denied" });
        }

        console.log("Auth middleware - Verifying token with JWT_SECRET"); // Debug
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Auth middleware - Token verified, decoded:", decoded); // Debug

        req.user = decoded; // Add user payload to the request
        next();
    } catch (error) {
        console.error(
            "Auth middleware - JWT verification error:",
            error.message,
        ); // Debug
        res.status(401).json({ message: "Token is not valid" });
    }
};
