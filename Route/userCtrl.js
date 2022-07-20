var models =require('../models');
var asyncLib =require('async');
var bcrypt = require('bcrypt');
var  http = require ('http');

module.exports= {
    adduser:(req,res)=>{
        var nom =req.body.nom;
        var prenom=req.body.prenom;
        var email =req.body.email;
        var password = req.body.password;
        var role=req.body.role;

        asyncLib.waterfall([
            (done) => {
                models.User.findOne({
                    attributes : ['email'],
                    where:{email:email}
                })
                .then((Userfound) => {
                    done(null,Userfound);
                })
                .catch((err) => {
                    console.log(err)
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
            },             
                (UserFound, done) => {
                   if (!UserFound) {
                    bcrypt.hash(password, 5, (err, bcryptPassword) => {
                        done(null, UserFound, bcryptPassword)
                    })
                } else {
                    return res.status(400).json({ 'error' : 'An error occurred'});
                }
        },
        (UserFound, bcryptPassword, done) => {
            var newUser = models.User.create({                 
                 nom : nom,
                 prenom : prenom,
                 email: email,
                 password: bcryptPassword,
                 role: role
            })
            .then((newUser) => {done(newUser)})
            .catch((err) => {              
              console.log(err, 'iciiiiiii')
              return res.status(500).json({ 'error': 'cannot add User' });
            });              
        }
    ], 
        (newUser) => {
            if (newUser) {
                return res.status(201).json({
                    'id': newUser.id,
                     'message': 'User successfully created'
                    }); 
            } else {    
                        console.log(err, 'laaaaaaa') 
                        return res.status(400).json({ 'error': 'An error occurred' });                             

            }
    })
    },
    getUser: (req, res) => {
        var userId = req.params.id;

        models.User.findOne({
            attributes: ['id', 'nom', 'prenom', 'email', 'role'],
            where: {id: userId}
        })
        .then((user) => {
            if(user){
                res.status(201).json(user)   
            }
            else {
                res.status(404).json({'error': 'User not found'})
            }
        })
        .catch((err) =>  {
            res.status(500).json({'error': 'Cannot fetch user'})
        })
    },
    
    getAllUsers: (req, res) => {
        models.User.findAll({
            attributes: [ 'id', 'nom', 'prenom', 'email', 'role' ]
        })
        .then((users) => {
            res.status(200).json(users)
        })
        .catch((err) => {
            res.status(400).json({ 'error': 'An error occurred' });
        });
    },

    Deleteuser: (req,res) => {
    var userId = req.params.id;

    models.User.destroy({
        //attributes: ['id', 'nom', 'prenom', 'email', 'role'],
        where: {id: userId}
    })
    .then((user) => {
        if(user){
            res.status(200).json({'message': 'User successfully deleted'})   
        }
        else {
            res.status(400).json({'error': 'An error occurred'})
        }
    })
    .catch((err) =>  {
        res.status(404).json({'error': 'Cannot find user'})
    })
},

    PutUser: ( req, res) => {
    let nom = req.body.nom;
    let prenom = req.body.prenom;
    let email = req.body.email;
    let role = req.body.role;
    var userId = req.params.id;

    asyncLib.waterfall([
        (done) => {
            models.User.findOne({
                attributes: [ 'id','nom','prenom','email','role'],
                where :{ id: userId}
            })
            .then((UserFound)=> {
                done(null,UserFound);
            })
            .catch((err) => {
                return res.status(400).json({ 'error': 'Unable to verify user' });
            });
        },
        (userFound, done) => {
            if(userFound) {
              userFound.update({
                  nom: (nom ? nom : userFound.nom),
                  prenom: (prenom ? prenom : userFound.prenom),
                  role: (role ? role : userFound.role)
              })
              .then((userFound) => {
                  done(userFound);
              })
              .catch((err) => {
                  res.status(400).json({ 'error': 'An error occurred' });
              });
            }
            else {
              res.status(404).json({ 'error': 'An error occurred' });
            }
          },
        ], 
        (userFound) => {
          if (userFound) {
              res.status(200).json({'success': 'User successfuly modified'})
          } 
          else {
            return res.status(400).json({ 'error': 'An error occurred' });
          }
        });
  },
}
