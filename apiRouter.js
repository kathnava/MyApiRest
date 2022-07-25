var express = require('express');
const user = require('./models/user');
const getUser = require('./Route/userCtrl');
const getAllUsers = require('./Route/userCtrl');
var userCtrl = require('./Route/userCtrl')

//Router
exports.router = (()=> {
    var apiRouter = express.Router();

    //Pizza routes
    apiRouter.route('/add').post(userCtrl.adduser)
    apiRouter.route('/put/:id').put(userCtrl.PutUser)
    apiRouter.route('getUser/:id').get(userCtrl.getUser)
    apiRouter.route('/getAll').get(userCtrl.getAllUsers)
    apiRouter.route('/:id').delete(userCtrl.deleteUser)
    apiRouter.route('/me').get(userCtrl.getUserMe);
    apiRouter.route('/login/').post(userCtrl.login)
    return apiRouter;
})();