const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const token = req.headers.auth;

    if(token){
        try {
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err) return err;
                if (decoded) {

                    const requested = {
                        ...req.body,
                        userId: decoded.userId,
                        email: decoded.email
                    };

                    req.body = requested;
                    next();
                }else{
            res.send({ "msg": "token is wrong.. login again...", issue: true });

                }
            })
        } catch (error) {
            res.send({ "msg": error.message, issue: true });
        }  
    }else{
        res.send({issue: true, msg: "Try to login again..."})
    }
}

module.exports = {
    auth
}