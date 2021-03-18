//Creacion del controlador
const userCtrl = {};
const {randomNumber} = require('../helpers/libs');

const path = require('path');

//Importando modelo de Usuarios
const User = require('../models/Users')
const Admin = require('../models/Admins')
const Jobs = require('../models/Jobs')
const Categorias = require('../models/Categorias')

//Importando modulo de autenticacon
const passport = require('passport');

const { application } = require('express');
const flash = require('connect-flash')
const multer = require('multer');
const  fs  = require('fs-extra');
const paypal = require('paypal-rest-sdk');
const Users = require('../models/Users');
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})





//Vista de sección de elección
userCtrl.renderChooseSignupOption = (req, res) => {
    res.render('users/choose-signup-option')
}

//Vista de formulario de Signup 
userCtrl.renderSignupForm = (req, res) => {
    res.render('users/signup')
}
userCtrl.renderSignupFormE = (req, res) => {
    res.render('users/signup-enterprise')
}
userCtrl.renderMembership = (req, res) => {
    res.render('users/membresia')
}
userCtrl.renderMembershipSucess = async (req, res) => {
    const status = 'plus'
    const status_basic = 'basico'
    const plusExp = new Date()
    console.log(plusExp)
    const status_user = await User.findByIdAndUpdate(req.user.id,{$set:{isNewUser:status,plusExpires:plusExp}})
    //await User.createIndex(req.user.id,{creationDate:1}, {expireAfterSeconds:2592000, partialFilterExpression: {isNewUser: {$eq: "basico"}}})
    console.log(status_user)
    res.render('users/sucess')
}
userCtrl.renderSignupFormAdmin = (req, res) => {
    res.render('signup-admin')
}



//Creacion de Usuarios
userCtrl.signup = async (req, res) => {
    let errors = [];
    
    failureFlash: true;
    const { username, email, password, password_confirm, tipo_cuenta,ciudad,pais } = req.body;
    //tipo_cuenta='Empresa';
    //console.log(tipo_cuenta)
    if (password != password_confirm) {
       // req.flash('message','las contrasenas no coinciden');
       // res.redirect('/user/signup');
        console.log('ERROR CONTRASENA NO ES IGUAL')
        errors.push({ text: "Las Contraseñas no coinciden." });
    }
    if (password.length < 4) {
        errors.push({ text: "La Contraseña debe tener al menos 4 digitos." });
    }
    if (errors.length > 0) {
        //  res.redirect('/user/signup');
        //const alert = errors.array()
         console.log(errors);
         ///console.log(alert)
         console.log('errores')
         res.render('users/signup', {
           errors
        });
    }

    else {
        // Si el correo ya existe
        const emailUser = await User.findOne({ email: email });
        if (emailUser || errors.length>0) {
            //req.flash("error_msg", "El Email se encuentra en uso.");
            //res.redirect('/');
            errors.push({ text: "El email ya se encuentra en uso." });
            console.log(errors);
            console.log("ERROR EMAIL EN USO")
            res.render('users/signup', {
                errors
             });
        } else {
            // Guardo el usuario
            const newUser = new User({ username, email, password, tipo_cuenta,ciudad,pais });
            
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            
            req.flash('success_msg', 'Usuario registrado exitosamente.')
            res.redirect('/user/login');
            
            console.log(newUser)
        }
    }
    console.log(req.body);
    
    console.log('prueba')
};
//update data





userCtrl.signupAdmin = async (req, res) => {
    let errors = [];
    
    failureFlash: true;
    const { username, email, password, password_confirm } = req.body;
    //tipo_cuenta='Empresa';
    const tipo_cuenta='Admin';
    const pais='Admin'
    const ciudad='Admin'

    console.log(username)
    //console.log(tipo_cuenta)
    if (password != password_confirm) {
       // req.flash('message','las contrasenas no coinciden');
       // res.redirect('/user/signup');
        console.log('ERROR CONTRASENA NO ES IGUAL')
        errors.push({ text: "Las Contraseñas no coinciden!!!." });
    }
    if (password.length < 4) {
        errors.push({ text: "La Contraseña debe tener al menos 4 digitos !!!!!!!!." });
    }
    if (errors.length > 0) {
        //  res.redirect('/user/signup');
        //const alert = errors.array()
         console.log(errors);
         ///console.log(alert)
         console.log('errores')
         res.render('/administracion/signup_', {
           errors
        });
    }

    else {
        // Si el correo ya existe
        const emailAdmin = await Users.findOne({ email: email });
        if (emailAdmin || errors.length>0) {
            //req.flash("error_msg", "El Email se encuentra en uso.");
            //res.redirect('/');
            errors.push({ text: "El email ya se encuentra en uso." });
            console.log(errors);
            console.log("ERROR EMAIL EN USO")
            res.render('signup-admin', {
                errors
             });
        } else {
            // Guardo el usuario
            const newAdmin = new Users({ username, email, password, tipo_cuenta,pais, ciudad});
            
            newAdmin.password = await newAdmin.encryptPassword(password);
            await newAdmin.save();
            
            req.flash('success_msg', 'Usuario registrado exitosamente.')
            res.redirect('/administracion/login');
            
            console.log(newAdmin)
        }
    }
    console.log(req.body);
  
    console.log('TEST')
};

//Vista de formulario de Login
userCtrl.renderLoginForm =  (req, res) => {
    res.render('users/signin')
}
userCtrl.renderLoginFormAdmin =  (req, res) => {
    res.render('signin-admin')
}
var sum = 1;
//Inicio de Sesion 

//    userCtrl.login = passport.authenticate('local', {
   
//     failureRedirect: '/user/login',
//      successRedirect: '/user/edit-perfil',
//       failureFlash: true
//    }
//  );
userCtrl.login =  (req,res,next) => {
    passport.authenticate("local",(err,user,info)=>{
        if (err) throw err;
        if (!user) {
            req.flash('success_msg', 'Estas credenciales no coinciden.')
            res.redirect('/user/login')
        }
        else {
            req.logIn(user, (err) => {
                
                if (err) throw err;
                
                User.findOne({'email': user.email},(err,user)=>{
                    console.log(user)
                    var dateMem = user.plusExpires
                    var date1 = new Date();
                    console.log(dateMem)
                    console.log(date1)
                    
                    
                        if (user.isNewUser == "basico" ){
                        

                            if ( user.tipo_cuenta == 'Freelancer' ){
                                
                                res.redirect('/user/membresia')
                                
                            } else if (user.tipo_cuenta == 'Empresa') {
                               
                                res.redirect('/user/membresia')
                                    
                            } else {
                                
                                res.redirect('/user/edit-perfil')
                                console.log('admin')
    
                            }
                    }else {
                        if( user.isNewUser === "plus" ){
                            let diff = date1.getTime() - dateMem.getTime()
                            console.log(diff)
        
                            let msInDay = 1000 * 3600 * 24;
                            console.log(msInDay)
                            
                            result = diff/msInDay
                            console.log(result)
                            
                            if( result <= 30){
                                
                                
                                
                                res.redirect('/user/edit-perfil')
                            }
                            if(result >= 30) {
                                const status_basic = 'basico'
                                const plusExp = null
                                console.log(plusExp)

                                async function setToBasic() {
                                    const status_user = await User.findByIdAndUpdate(req.user.id,{$set:{isNewUser:status_basic,plusExpires:plusExp}})
                                     console.log(status_user)
                                  }
                                  setToBasic();
                            
                                
                                res.redirect('/user/membresia')
                            }
                            
                        }else {
                            
                        }
                    }              

                    
                    

                })

            })
        }
    })(req,res,next)
}
userCtrl.loginAdmin = (req,res,next) => {
    passport.authenticate("local",(err,user,info)=>{
        if (err) throw err;
        if (!user) res.send("No existe usuario")
        else {
            req.logIn(user, (err) => {
                
                if (err) throw err;
                
                Admin.findOne({'email': user.email},async(err,user)=>{
                    const users = await User.findById(req.params.id)
                 
                    
                    res.redirect('administracion/panel' ,{ users })
                    

                })

            })
        }
    })(req,res,next)
}

userCtrl.isPlus = (req,res) => {
    console.log(req.user)
}


// userCtrl.login = passport.authenticate('local', {
//     if()
// })

// userCtrl.login = passport.authenticate('local', {
        
//          failureRedirect: '/user/login'
//         // successRedirect: '/',
//         // successRedirect: '/user/edit-perfil',
//         // failureFlash: true
//           }),(req,res) => {
//               if (req.User.email === true) {
//                   res.redirect('/')
//               }
//           };


// userCtrl.login= passport.authenticate('local',{
//     failureRedirect:'/',
    
// }),(req,res)=>{
//     //const cargoUser = await User.findOne(cargo = ''));
//     if (req.User.tipo_cuenta === 'Empresa') {
//         console.log("Redirect")
//         res.redirect('/');
//     }
//     if (req.User.tipo_cuenta === 'Freelancer') {
//         console.log("Redirect2")
//         res.redirect('user/edit-perfil');
//     }
// }


// userCtrl.get('/', function(req, res, next){
//     passport.authenticate('local',function(err,user,info){
//         if(err) {return next(err);}

//         if(!user) {return res.redirect('user/login');}
//         req.logIn(user, function(err){
//             if(err){ return next(err);}
//             return res.redirect('/')
//         })
//     }) (req,res,next);
// })

//Vista de Cerrar sesion
userCtrl.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Tu sesion ha sido cerrada');
    res.redirect('/')
};

//Vista de lista de freelancer
userCtrl.renderListaCandidatos = async (req, res) => {
    if (req.query.buscar_free) {
        if (req.user) {
            const tipo_cuenta = req.user.tipo_cuenta;
            const buscar_free = req.query.buscar_free;
            const xPage = 6;
            const page = req.params.page || 1;
            const applicant = await User.find({ username: { $regex: '.*' + buscar_free + '.*', $options: 'i' }, tipo_cuenta: 'Freelancer' }, function (error, applicant) {
                if (error) {
                    console.log('error en el find')
                }
            })
                .skip((xPage * page) - xPage).limit(xPage).exec((err, applicant) => {
                    User.count({tipo_cuenta: 'Freelancer'}, (err, count) => {
                        if (err) {
                            console.log('error en el conteo')
                        } else {
                            res.render('./users/candidatos', { tipo_cuenta, applicant, current: page, pages: Math.ceil(count / xPage) })
                        }
                    })
                })
        } else {
            const buscar_free = req.query.buscar_free;
            const xPage = 6;
            const page = req.params.page || 1;
            const applicant = await User.find({ username: { $regex: '.*' + buscar_free + '.*', $options: 'i' }, tipo_cuenta: 'Freelancer' }, function (error, applicant) {
                if (error) {
                    console.log('error en el find')
                }
            })
                .skip((xPage * page) - xPage).limit(xPage).exec((err, applicant) => {
                    User.count({tipo_cuenta: 'Freelancer'}, (err, count) => {
                        if (err) {
                            console.log('error en el conteo')
                        } else {
                            res.render('./users/candidatos', { applicant, current: page, pages: Math.ceil(count / xPage) })
                        }
                    })
                })
        }
    }
    if (req.user) {
        const tipo_cuenta = req.user.tipo_cuenta;
        const xPage = 6;
        const page = req.params.page || 1;
        const applicant = await User.find({ tipo_cuenta: 'Freelancer' }).skip((xPage * page) - xPage).limit(xPage).exec((error, applicant) => {
            User.count({tipo_cuenta: 'Freelancer'}, (error, count) => {
                if (error) {
                    console.log('error1')
                } else {
                    res.render('./users/candidatos', {
                        tipo_cuenta, applicant, current: page, pages: Math.ceil(count / xPage)
                    })
                }
            })
        })
    } else {
        const xPage = 4;
        const page = req.params.page || 1;
        const applicant = await User.find({ tipo_cuenta: 'Freelancer' }).skip((xPage * page) - xPage).limit(xPage).exec((error, applicant) => {
            User.count({tipo_cuenta: 'Freelancer'}, (error, count) => {
                if (error) {
                    console.log('error1')
                } else {
                    res.render('./users/candidatos', {
                        applicant, current: page, pages: Math.ceil(count / xPage)
                    })
                }
            })
        })
    }
}

//Vista de perfil de freelancer
userCtrl.renderPerfilUser = async (req, res) => {
    if (req.user) {
        if (req.user.tipo_cuenta === 'Empresa') {
            const empresa = req.user.tipo_cuenta;
            const user = await User.findById(req.params.id)
            res.render('./users/perfil-user', { empresa, user })
        }
    }
    const user = await User.findById(req.params.id)
    res.render('./users/perfil-user', { user })
};

//Vista de Formulario de editar perfil
userCtrl.renderEditPerfil = async (req, res) => {
    const user = req.user;


    
    res.render('./users/perfil-user-edit', {user})
}

//Actualizar Perfil de Usuario
userCtrl.editPerfil = async (req, res) => {
    console.log(req.body)
    const  {cargo,direccion,salario,email,acerca,pais,tipoempresa,userfacebook,usertwitter,usergoogle,userlinkedin,skill_,skill_1,skill_2,skill_3} = req.body

    await User.findByIdAndUpdate(req.user.id,{$set:{cargo:cargo,direccion:direccion,salario:salario,email:email,acerca:acerca,pais:pais,
        tipoempresa:tipoempresa,userfacebook:userfacebook,usertwitter:usertwitter,usergoogle:usergoogle,userlinkedin:userlinkedin,
        skill_:skill_,skill_1:skill_1,skill_2:skill_2,skill_3:skill_3}})
    const user = await User.findById(req.user.id)
    res.render('./users/perfil-user-edit', {user})
     
    
}
userCtrl.updateDatos = async (req, res) => {
    let errors = [];
    
    console.log(req.body)
    const  {password, password_confirm} = req.body
    if (password != password_confirm) {
        // req.flash('message','las contrasenas no coinciden');
        // res.redirect('/user/signup');
         console.log('ERROR CONTRASENA NO ES IGUAL')
         errors.push({ text: "Las Contraseñas no coinciden!!!." });
     }
     if (password.length < 4) {
         errors.push({ text: "La Contraseña debe tener al menos 4 digitos !!!!!!!!." });
     }
     if (errors.length > 0) {
         //  res.redirect('/user/signup');
         //const alert = errors.array()
          console.log(errors);
          ///console.log(alert)
          console.log('errores')
          res.render('./users/cambio-pass', {
            errors
         });
     }
 
     else {
         // Si el correo ya existe
         await User.findByIdAndUpdate(req.user.id,{$set:{password:password}})
         console.log('YES')
            const user = await User.findById(req.user.id)
            user.password = await user.encryptPassword(password)
            await user.save()
            res.render('./users/perfil-user-edit', {user})

         }

    
     
    
}

userCtrl.renderEditJob = async (req, res) => {
    const user = req.user;
    const jobs = await Jobs.find({id_user: user._id});
    //const userCreador = await Users.findById(detailsJobs.id_user);

 console.log('trabajos')
    console.log(user._id)
    console.log(jobs)
   

    res.render('./users/edit-jobs', {user,jobs})
}
userCtrl.renderEditJobs = async (req, res) => {
//     const user = req.user;
//     const jobs = await Jobs.find({tipo_cuenta: "Empresa"}).sort({_id: -1}).limit(3);
    
   
//  console.log('trabajos')
//     console.log(user._id)
//     console.log(jobs)
   

//     res.render('./users/edit-jobs', {user,jobs})
 if (req.query.buscar_jobs || req.query.buscar_ubi) {
        if (req.user) {
            const tipo_cuenta = req.user.tipo_cuenta
            const buscar_jobs = req.query.buscar_jobs
            const buscar_ubi = req.query.buscar_ubi
            const xPage = 6
            const page = req.params.page || 1
            const categorias = await Categorias.find();
            const jobs = await Jobs.find({ titulo_trabajo: { $regex: '.*' + buscar_jobs + '.*', $options: "i" }, ubicacion: { $regex: '.*' + buscar_ubi + '.*', $options: "i" } }, function (error, jobs) {
                if (error) {
                    console.log('error en el find')
                }
            })
                .sort({ _id: -1 }).skip((xPage * page) - xPage).limit(xPage).exec((err, jobs) => {
                    Jobs.count((err, count) => {
                        if (err) {
                            console.log('error en el count')
                        } else {
                            res.render('./jobs/lista-trabajos-admin', { categorias, tipo_cuenta, jobs, current: page, pages: Math.ceil(count / xPage) })
                        }
                    })
                })
        } else {
            const buscar_jobs = req.query.buscar_jobs;
            const buscar_ubi = req.query.buscar_ubi;
            const xPage = 6;
            const page = req.params.page || 1;
            const categorias = Categorias.find();
            const jobs = await Jobs
                .find({ titulo_trabajo: { $regex: '.*' + buscar_jobs + '.*', $options: "i" }, ubicacion: { $regex: '.*' + buscar_ubi + '.*', $options: "i" } }, function (error, jobs) {
                    if (error) {
                        console.log('error en el find')
                    }
                })
                .sort({ _id: -1 }).skip((xPage * page) - xPage).limit(xPage).exec((err, jobs) => {
                    Jobs.count((err, count) => {
                        if (err) {
                        } else {
                            res.render('./jobs/lista-trabajos-admin', {
                                categorias,
                                jobs,
                                current: page,
                                pages: Math.ceil(count / xPage)
                            })
                        }
                    })
                })
        }
    }
    if (req.user) {
        const tipo_cuenta = req.user.tipo_cuenta;
        const xPage = 6;
        const page = req.params.page || 1;
        const categorias = await Categorias.find();
        const jobs = await Jobs.find().sort({ _id: -1 }).skip((xPage * page) - xPage).limit(xPage).exec((err, jobs) => {
            Jobs.count((err, count) => {
                if (err) {
                    console.log('error1')
                } else {
                    res.render('./jobs/lista-trabajos-admin', {
                        categorias,
                        tipo_cuenta,
                        jobs,
                        current: page,
                        pages: Math.ceil(count / xPage)
                    })
                }
            })
        })
    } else {
        const xPage = 6;
        const page = req.params.page || 1;
        const categorias = await Categorias.find();
        const jobs = await Jobs.find().sort({ _id: -1 }).skip((xPage * page) - xPage).limit(xPage).exec((err, jobs) => {
            Jobs.count((err, count) => {
                if (err) {
                    console.log('error')
                } else {
                    console.log(jobs)
                    res.render('./jobs/lista-trabajos-admin', {
                        categorias,
                        jobs,
                        current: page,
                        pages: Math.ceil(count / xPage)
                    })
                }
            })
        })
    }


}
userCtrl.renderEditPass = async (req, res) => {
   

     res.render('./users/cambio-pass')
}


userCtrl.eliminarTrabajo = async (req,res)=> {
    const {id} =req.params;
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    console.log(id);

    try {
        const userDelete = await Jobs.findByIdAndDelete(id)
        console.log('exito')
        res.redirect('/user/edit-jobs')
        
    } catch (error) {
        console.log(error);
        console.log('error')
    }


}
userCtrl.eliminarTrabajoAdmin = async (req,res)=> {
    const {id} =req.params;
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    console.log(id);

    try {
        const userDelete = await Jobs.findByIdAndDelete(id)
        console.log('exito')
        res.redirect('/user/edit-jobs')
        
    } catch (error) {
        console.log(error);
        console.log('error')
    }


}




userCtrl.editPic = async (req, res) => {
    const imgUrl = randomNumber();
    const imageTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.resolve(`src/public/uploads/${imgUrl}${ext}`)

    const cvUrl = randomNumber();
    const cvTempPath = req.file.path;
    const extt = path.extname(req.file.originalname).toLowerCase();
    const targetPath_ = path.resolve(`src/public/uploads/${cvUrl}${extt}`)

    if (ext === '.png' || ext === '.jpeg' ||ext === '.jpg' || ext === '.gif' ){
        await fs.rename(imageTempPath, targetPath);

        const newImg = imgUrl+ext

      try {
        const result = await cloudinary.v2.uploader.upload(`src/public/uploads/${newImg}`);
        console.log(result)
        console.log(result.url)
        const imageSaved = await User.findByIdAndUpdate(req.user.id,{$set:{filename:result.url}})

        await fs.unlink(req.file.path)

      } catch (error) {
          console.log(error)
      } 
      
       // const imageSaved = await User.findByIdAndUpdate(req.user.id,{$set:{filename:newImg}})
       // console.log(typeof(imageSaved))
        // console.log(typeof(newImg))
        // console.log(newImg +'ohshit')
        // console.log(imageSaved+'ohshit2')
        // console.log(typeof(imageSaved))
    } else if(extt === '.pdf') {

            await fs.rename(cvTempPath, targetPath_);
            const newCv = cvUrl+extt

            try {
                const result = await cloudinary.v2.uploader.upload(`src/public/uploads/${newCv}`);
                const cvSaved = await User.findByIdAndUpdate(req.user.id,{$set:{cvfilename:result.url}})
            } catch (error) {
                console.log(error)
            }
         
            
       
    } else {
         await fs.unlink(imageTempPath);
        res.status(500).json({error: 'Solo imagenes son admitidas'});
    }
    
    const user = await User.findById(req.user.id)
    res.render('./users/perfil-user-edit', {user})   
}


userCtrl.expeTrabajo = async (req, res) => {
    const expe_traba = {periodo: req.body.periodo_laboral, 
                    titulo_trabajo: req.body.titulo_trabajo,
                    nom_empresa: req.body.nom_empresa,
                    desc_trabajo: req.body.descripcion_trabajo,
                    deta_trabajo: req.body.detalles_trabajo }
    await User.findByIdAndUpdate(req.user.id, {$addToSet: {trabajos: expe_traba}})
    const user = await User.findById(req.user.id)
    res.render('./users/perfil-user-edit', {user})

}

userCtrl.expeEstudios = async  (req, res) => {
    const expe_estu = {periodo: req.body.periodo_estudio,
                        nom_academia: req.body.nom_estudio,
                        deta_estudio: req.body.detalles_estudio}
    await User.findByIdAndUpdate(req.user.id, {$addToSet: {estudios: expe_estu}})
    const user = await User.findById(req.user.id)
    res.render('./users/perfil-user-edit', {user})
}


userCtrl.descargarCv = async (req,res) => {
    const  idUser = await User.findByIdAndUpdate(req.user.id)
    console.log(idUser)
}


userCtrl.paymentMembership = async(req, res) => {
  


    const user = await User.findById(req.user.id)
    if(user.tipo_cuenta === 'Freelancer') {

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:4000/user/sucess",
                "cancel_url": "http://localhost:4000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Membresia ",
                        "sku": "001",
                        "price": "2.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "2.00"
                },
                "description": "Subscripcion membresia"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                    console.log('EXITO1')
                  }
                  console.log('EXITO11')
                }
            }
          });
      } else {
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:4000/user/sucess",
                "cancel_url": "http://localhost:4000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Membresia Empleador ",
                        "sku": "001",
                        "price": "5.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "5.00"
                },
                "description": "Subscripcion membresia empleador"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                    console.log('OOK')
                  }
                  console.log('OO1K')
                }
            }
          });

      }
      
        
    }
    
    




userCtrl.renderListaCandidatosPanel = async (req, res) => {
    if (req.query.buscar_free) {
        if (req.user) {
            const tipo_cuenta = req.user.tipo_cuenta;
            const buscar_free = req.query.buscar_free;
            const xPage = 6;
            const page = req.params.page || 1;
            const applicant = await User.find({ username: { $regex: '.*' + buscar_free + '.*', $options: 'i' }, tipo_cuenta: 'Freelancer' }, function (error, applicant) {
                if (error) {
                    console.log('error en el find')
                }
            })
                .skip((xPage * page) - xPage).limit(xPage).exec((err, applicant) => {
                    User.count({tipo_cuenta: 'Freelancer'}, (err, count) => {
                        if (err) {
                            console.log('error en el conteo')
                        } else {
                            res.render('administracion', { tipo_cuenta, applicant, current: page, pages: Math.ceil(count / xPage) })
                        }
                    })
                })
        } else {
            const buscar_free = req.query.buscar_free;
            const xPage = 6;
            const page = req.params.page || 1;
            const applicant = await User.find({ username: { $regex: '.*' + buscar_free + '.*', $options: 'i' }, tipo_cuenta: 'Freelancer' }, function (error, applicant) {
                if (error) {
                    console.log('error en el find')
                }
            })
                .skip((xPage * page) - xPage).limit(xPage).exec((err, applicant) => {
                    User.count({tipo_cuenta: 'Freelancer'}, (err, count) => {
                        if (err) {
                            console.log('error en el conteo')
                        } else {
                            res.render('administracion', { applicant, current: page, pages: Math.ceil(count / xPage) })
                        }
                    })
                })
        }
    }
    if (req.user) {
        const tipo_cuenta = req.user.tipo_cuenta;
        const xPage = 6;
        const page = req.params.page || 1;
        const applicant = await User.find({ tipo_cuenta: 'Freelancer' }).skip((xPage * page) - xPage).limit(xPage).exec((error, applicant) => {
            User.count({tipo_cuenta: 'Freelancer'}, (error, count) => {
                if (error) {
                    console.log('error1')
                } else {
                    res.render('administracion', {
                        tipo_cuenta, applicant, current: page, pages: Math.ceil(count / xPage)
                    })
                }
            })
        })
    } else {
        const xPage = 4;
        const page = req.params.page || 1;
        const applicant = await User.find({ tipo_cuenta: 'Freelancer' }).skip((xPage * page) - xPage).limit(xPage).exec((error, applicant) => {
            User.count({tipo_cuenta: 'Freelancer'}, (error, count) => {
                if (error) {
                    console.log('error1')
                } else {
                    res.render('administracion', {
                        applicant, current: page, pages: Math.ceil(count / xPage)
                    })
                }
            })
        })
    }
}

//Exportando Modulo
module.exports = userCtrl;


