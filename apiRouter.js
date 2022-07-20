var express = require('express');
const user = require('./models/user');
const {getUser} = require('./Route/userCtrl');
const {getAllUser} = require('./Route/userCtrl');
var userCtrl = require('./Route/userCtrl');

//Router
exports.router = (()=> {
    var apiRouter = express.Router();

    //Pizza routes
    apiRouter.route('/add').post(userCtrl.adduser)
    apiRouter.route('/put').put(userCtrl.PutUser)
    apiRouter.route('getUser/:id').get(userCtrl.getUser)
    apiRouter.route('/getAll').get(userCtrl.getAllUsers)
    apiRouter.route('/:id').delete(userCtrl.Deleteuser)

    // apiRouter.route('/pizzas/getPizza/').get(pizzaCtrl.getPizza)
    // apiRouter.route('/pizzas/getAllPizza/').get(pizzaCtrl.getAllPizza)
    // apiRouter.route('/pizzas/updatePizza/').put(pizzaCtrl.updatePizza)
    // apiRouter.route('/pizzas/deletePizza/').delete(pizzaCtrl.deletePizza
    return apiRouter;
})();