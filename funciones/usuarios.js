const Sequelize = require("sequelize");
const conexion = new Sequelize("mysql://root@localhost:3306/delilah")
const jwt = require("jsonwebtoken");
const CLAVE_CIFRADO_SERVER = "PROYECTO3DELILAHACAMICA";

module.exports = {
    signUpUsuario,
    logInUsuario,
    getListaDeUsuarios,
    getMyInfoUsuarioLogueado,
    modificarUsuarioPorNombredeusuario,
    getUsuarioPorNombredeusuario,
    deleteUsuariosPorNombredeusuario,
}

function getListaDeUsuarios(){ 
    conexion.query("SELECT * FROM usuarios", {type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        if(respuesta.lenght != undefined){
            res.json({respuesta})
        }else{
            res.status(404).json({ok:"false", res:"No hay ningún usuario registrado todavía"})
        }
    })
}
function signUpUsuario(req,res){
    conexion.query("SELECT * FROM usuarios WHERE nombredeusuario = ?", {replacements: [req.body.nombredeusuario], type: conexion.QueryTypes.SELECT})
        .then((usuario)=>{
            if(usuario > 0){
                res.status(409).json({ok:false, err: "Ya existe un usuario con ese nombredeusuario, por favor intenta con uno nuevo."})
            }else{ 
                conexion.query("INSERT INTO usuarios (nombredeusuario, contraseña, nombre, apellido, email, telefono, direccion, is_admin) VALUES (?,?,?,?,?,?,?,?)",
            {replacements: [req.body.nombredeusuario, req.body.contraseña, req.body.nombre, req.body.apellido, req.body.email, req.body.telefono, req.body.direccion, "false"]})
                .then((resultados)=>{
                    res.status(200).json({ ok:true, res:"Usuario creado con éxito", resultados})
                })
                .catch((error)=>{
                    console.log("Algo salió mal.......", error)
                })
            }
        })
    
}
function logInUsuario(req,res){
    const {nombredeusuario, contraseña} = req.body;
    const token = jwt.sign({nombredeusuario, contraseña}, CLAVE_CIFRADO_SERVER);
    res.status(200).json({token})
}
function getMyInfoUsuarioLogueado(req,res){
    const tokenRecibido = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenRecibido, CLAVE_CIFRADO_SERVER);
    conexion.query("SELECT * FROM usuarios WHERE nombredeusuario = ?", {replacements: [verificarToken.nombredeusuario], type: conexion.QueryTypes.SELECT})
    .then((usuario)=>{
        res.json({usuario})
    })
}
function getUsuarioPorNombredeusuario(req,res){
    conexion.query("SELECT * FROM usuarios WHERE nombredeusuario = ?", 
        {replacements: [req.params.nombredeusuario], type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        if(respuesta.length > 0){
        res.status(200).json(respuesta)
        }else{
            res.status(404).json({ok:false, res:"No hay ningún usuario registrado con ese nombredeusuario"})
        }
        
    })
}
function modificarUsuarioPorNombredeusuario(req,res){
    conexion.query("UPDATE usuarios SET nombredeusuario = ?, contraseña = ?, nombre = ?, apellido = ?,  email = ?, telefono = ?, direccion = ?, is_admin WHERE nombredeusuario = ?",
    {replacements: [ req.body.nombredeusuario, req.body.contraseña, req.body.nombre, req.body.apellido, req.body.email, req.body.telefono, req.body.direccion, "false", req.params.nombredeusuario ]})
        .then((resultados)=>{
            res.status(201).json({ok:true, res:"Usuario actualizado,", resultados})
        })
        .catch((error)=>{
            res.status(409).json({ ok: false, res: "Algo parece estar mal en los datos ingresados"})
            console.log("Algo salió mal....", error)
        }) 
 
}
function deleteUsuariosPorNombredeusuario(req,res){
    conexion.query("DELETE FROM usuarios WHERE nombredeusuario= ?", {replacements: [req.params.nombredeusuario]})
        .then((resultados)=>{
            console.log("Usuario eliminado con éxito")
            res.status(204)
        }
    )
}