
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(401).json({
        success: false,
        message: "Access denied. Please try again.",
        });
    }
    next();
    }


export default verifyAdmin;