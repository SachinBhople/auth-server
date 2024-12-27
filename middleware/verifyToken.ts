
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(403).json({ message: 'No token provided. Access denied.' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        req.user = decoded; // Attach decoded user data to the request object
        next(); // Proceed to the next middleware or route handler
    });
}