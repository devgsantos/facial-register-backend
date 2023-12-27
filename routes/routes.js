const getToken = require("../controllers/auth.controller");
const tokenization = require("../controllers/urlToken.controller");
const decryptToken = require("../controllers/tokenUrl.controller");
const photoIdentify = require("../controllers/photoIdentify.controller");
const sendTicket = require("../controllers/ticket.controller");
const sendDocument = require("../controllers/document.controller");
const verifyToken = require("../middleware/auth.jwt");
const requestLogRegister = require("../middleware/request-logger.middleware");
const savePartialTicket = require('../controllers/partialTicket.controller');
const ticketValidation = require("../controllers/ticketValidation.controller");
const ticketRevalidation = require("../controllers/ticketRevalidation.controller");
const checkTicket = require("../controllers/checkTicket.controller");
const responseLogRegister = require('../middleware/response-logger.middleware');
const uuidMiddleware = require('../middleware/uuid.middleware');


function routes(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        const send = res.send
        res.send = (data) => {
            responseLogRegister(data, req);
            res.send = send
            return res.send(data);
        }
        next();
    });
    
    app.post("/api/urltoken", [uuidMiddleware, requestLogRegister], tokenization);
    app.post("/api/decrypturl", [uuidMiddleware, requestLogRegister], decryptToken);
    app.post("/api/token", [uuidMiddleware, requestLogRegister], getToken);
    app.post("/api/photoIdentify",[uuidMiddleware, verifyToken, requestLogRegister] , photoIdentify);
    app.post("/api/ticket", [uuidMiddleware, verifyToken, requestLogRegister] , sendTicket);
    app.post("/api/document", [uuidMiddleware, verifyToken, requestLogRegister] , sendDocument);
    app.post("/api/ticketValidation",[uuidMiddleware, verifyToken, requestLogRegister] , ticketValidation);
    app.post("/api/savePartialTicket",[uuidMiddleware, verifyToken, requestLogRegister] , savePartialTicket);
    app.post("/api/checkTicket",[uuidMiddleware, verifyToken, requestLogRegister] , checkTicket);
    app.post("/api/ticketRevalidation",[uuidMiddleware, verifyToken, ticketRevalidation] , checkTicket);
}


module.exports = routes