var models = require('../models');
var asyncLib = require('async');
var bcrypt = require('bcrypt');
var jwtutils = require('../jwtutils');

// constants
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PASSWORD_REGEX = /^.{4,8}$/
//mot de passe de 4 à 8 caracteres 


//Routes
module.exports= {
    adduser:(req,res)=>{
        var nom =req.body.nom;
        var prenom=req.body.prenom;
        var email =req.body.email;
        var password = req.body.password;
        var role=req.body.role;

        if (email == null || nom == null || prenom == null || password == null) {
            return res.status(400).json({'error': 'Parametres manquantes'})
        }

       if(!EMAIL_REGEX.test(email)) {
            return res.status(400).json({'error': 'Email not valid'})
        }

        if(!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({'error': 'Password not valid'})
        }

        asyncLib.waterfall([
            (done) => {
                models.User.findOne({
                    attributes : ['email'],
                    where:{email:email}
                })
                .then((userFound) => {
                    done(null,userFound);
                })
                .catch((err) => {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                })
            },             
                (userFound, done) => {
                   if (!userFound) {
                    bcrypt.hash(password, 5, (err, bcryptPassword) => {
                        done(null, userFound, bcryptPassword)
                    })
                } else {
                    return res.status(409).json({ 'error' : 'User Already exists'});
                }
            },
        (userFound, bcryptPassword, done) => {

            var newUser = models.User.create({                 
                 nom : nom,
                 prenom : prenom,
                 email: email,
                 password: bcryptPassword,
                 role: role
            })
            .then((newUser) => {done(newUser)
            })
            .catch((err) => {              
              return res.status(400).json({ 'error': 'An error occurred' });
            })        
        }
    ], 
        (newUser) => {
            if (newUser) {
                return res.status(201).json({
                    'id': newUser.id,
                     'message': 'User successfully created'
                    }) 
            } else {    
                        return res.status(400).json({ 'error': 'An error occurred' });                             
            }
    })
    },
    getUserMe: (req, res) => {
        
        let headerAuth = req.headers['authorization']
        let userId = jwtutils.getUserId(headerAuth)


        if(userId < 0) {
          return res.status(400).json({'error':'An error occured mauvais token'})
        }
    
        models.User.findOne({
            attributes: [ 'id', 'nom', 'prenom', 'email', 'role' ],
            where: { id: userId }
          })
          .then((user) => {
            if (user) {
              res.status(201).json(user);
            }
            else {
              res.status(404).json({ 'error': 'user not found' });
            }
          })
          .catch((err) => {
            res.status(500).json({ 'error': 'cannot fetch user' });
          });
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
            res.status(500).json({'error': 'Cannot fetch user'});
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

    login: (req, res) => {
        
        // Params
        var email    = req.body.email;
        var password = req.body.password;

        if (email == null ||  password == null) {
          return res.status(400).json({ 'error': 'missing parameters' });
        }
        asyncLib.waterfall([
            (done) => {
              models.User.findOne({
                  where: { email: email }
              })
              .then((userFound) => {
                  done(null, userFound);
              })
              .catch((err) => {
                  return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            (userFound, done) => {
              if (userFound) {
                bcrypt.compare(password, userFound.password, (errBycrypt, resBycrypt) => {
                  done(null, userFound, resBycrypt);
                });
              } 
              else {
                return res.status(404).json({ 'error': 'user not exist in DB' });
              }
            },
            (userFound, resBycrypt, done) => {
              if(resBycrypt) {
                done(userFound);
              } 
              else {
                return res.status(403).json({ 'error': 'invalid password' });
              }
            }
          ], 
          (userFound) => {
            if (userFound) {
              return res.status(201).json({
                'id': userFound.id,
                'token': jwtutils.generateTokenForUser(userFound)
              });
            } 
            else {
              return res.status(500).json({ 'error': 'cannot log on user' });
            }
          });
        },
    deleteUser: (req, res) => {
        
            let headerAuth  = req.headers['authorization'];
            let userId      = jwtutils.getUserId(headerAuth);
    
            asyncLib.waterfall([
                (done) => {
                    models.User.destroy({
                        where: { id: userId }
                    })
                    .then((userFound) => {
                        done(userFound)
                    })
                    .catch((err) => {
                        return res.status(400).json({ 'error': 'An error occurred' });
                    });
                }],
                (userFound) => {
                    if (userFound) {
                        return res.status(200).json({'success':`User successfuly deleted`})
                    }
                    else {
                        return res.status(404).json({ 'error': 'User was not found' });
                    }
                });
        },
    PutUser: ( req, res) => {
       let headerAuth  = req.headers['authorization'];
       let userId = jwtutils.getUserId(headerAuth);
       
       let nom = req.body.nom;
       let prenom = req.body.prenom;
       let email = req.body.email;
       let role = req.body.role;
       
       //var userId = req.params.id;

    asyncLib.waterfall([
        (done) => {
            models.User.findOne({
                attributes: [ 'id','nom','prenom','email','role'],
                where :{ id: userId}
            })
            .then((userFound)=> {
                done(null,userFound);
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
