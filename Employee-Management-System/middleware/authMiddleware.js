const jwt = require('jsonwebtoken');

module.exports = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error("Authentication required");
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        return decodedToken;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};
