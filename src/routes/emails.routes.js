//Modulos requeridos
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')

const sgMail  = require('@sendgrid/mail')

const API_KEY= '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'


//Controlador de Email
const { enviarEmaildeContacto } = require('../controllers/emails.controller');

//Ruta de creacion de aplicacion a anuncio
//router.post('/formulario-contacto', enviarEmaildeContacto, crearMensajeDeContacto)
router.post('/send-mail', async (req,res) => {
    
    const { name, email, phone, message } = req.body;

    contentHTML = `
        <h1>Información del usuario</h1>
        <ul>
            <li>Nombre de usuario: ${name}</li>
            <li>Correo electrónico: ${email}</li>
            <li>Número de contacto: ${phone}</li>
        </ul>
        <p>${message}</p>
    `;
    console.log(contentHTML)
    console.log("Contacto");
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'studio73pty.noreply@gmail.com',
            pass: 'pfiakggdypqridiq'
        },
        tls:{
            rejectUnauthorized: false
        }

    })

    try {
        const info = await transporter.sendMail({
            from: "'Studio73pty' <test_web@studio73pty.com>",
            to: "info@studio73pty.com",
            subject:'Formulario de contacto',
    
            html: contentHTML
        })
     
        console.log('message sent', info.messageId)
        res.redirect('https://studio73pty.studio73pty.com/sucess.html')
        
    } catch (error) {
        console.log(error)
    }
    
    
})

router.post('/send-mail-user/', async (req,res) => {
    

    const { username, email, message, email_user } = req.body;
    console.log(username)
    console.log(email_user)


    contentHTML = `
        <h1>Información de usuario</h1>
        <ul>
            <li>Nombre de usuario: ${username}</li>
        </ul>
        <p>${message}</p>
    `;
    console.log(contentHTML)
    const transporter = nodemailer.createTransport({
        host: 'mail.studio73pty.com',
        port: 587,
        secure: false,
        auth: {
            user: 'test_web@studio73pty.com',
            pass: '123456qwerty'
        },
        tls:{
            rejectUnauthorized: false
        }
    })
    try {
        const info = await transporter.sendMail({
            from: "'Studio73pty Server' <test_web@studio73pty.com>",
            to: `${email_user}`,
            
            subject:'Alguien quiere contactar contigo!',
            //text:'hello world'
            html: contentHTML
        })
        res.redirect('/')
        
    } catch (error) {
        console.log(error)
    }
    
    
    
})


router.post('/send-mail-alquiworld', async (req,res) => {
    const { name, email, number, asunto } = req.body;
    sgMail.setApiKey(API_KEY);
    const message = {
        to: 'info@alquiworld.com',
        from: 'alquiworld-no-reply@hotmail.com',
        subject: 'Hello from sendgrid',
        text: 'hello frm sendgrid dog',
        html: `
                <h1>Información del usuario</h1>
        <ul>
            <li>Nombre de usuario: ${name}</li>
            <li>Correo electrónico: ${email}</li>
            <li>Número de contacto: ${number}</li>
        </ul>
        <p>${asunto}</p>
        `,
    }
    sgMail.send(message).then(response => {
        res.status(200).json({
            status: 'success',
            message: 'El correo ha sido enviado!',
        });
    })
    .catch(error => console.log(error.message));

})


// router.post('/send-mail-alquiworld', async (req,res) => {

//     console.log(req.body);
//     const { name, email, number, asunto } = req.body;

//     contentHTML = `
//         <h1>Información del usuario</h1>
//         <ul>
//             <li>Nombre de usuario: ${name}</li>
//             <li>Correo electrónico: ${email}</li>
//             <li>Número de contacto: ${number}</li>
//         </ul>
//         <p>${asunto}</p>
//     `;
//     console.log(contentHTML)
//     // const transporter = nodemailer.createTransport({
//     //     host: 'smtp.gmail.com',
//     //     port: 465,
//     //     secure: true,
//     //     auth: {
//     //         user: 'studio73pty.noreply@gmail.com',
//     //         pass: 'pfiakggdypqridiq'
//     //     },
//     //     tls:{
//     //         rejectUnauthorized: false
//     //     }

//     // })
//     const transporter = nodemailer.createTransport({
//         service:'Sendgrid',
//         auth: {
//             user: 'apikey',
//             pass: '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'
//         }

//     })

//     // const transporter = nodemailer.createTransport({
//     //     host: 'mail.studio73pty.com',
//     //     port: 587,
//     //     secure: false,
//     //     auth: {
//     //       user: 'test_web@studio73pty.com',
//     //       pass: '123456qwerty',
//     //     },
//     //     tls: {
//     //       rejectUnauthorized: false,
//     //     },
//     //   });

//     try {
//         const info = await transporter.sendMail({
//             from: "'Alquiworld' <alquiworld-api@no-reply.com>",
//             // to: "info@alquiworld.com",
//             to: "info@studio73pty.com",

//             subject:'Formulario de contacto',
    
//             html: contentHTML
//         })
     
//         if(info){
//             res.status(200).json({
//                 status: 'success',
//                 message: 'El correo ha sido enviado!',
//               });
//         }
        
//     } catch (error) {
//         res.status(200).json({
//             status: 'error',
//             message: 'Hubo un error intenta de nuevo!',
//           });
//     }
    
    
// })

//Exportando modulo
module.exports = router;
