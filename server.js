const express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const CLAVE_CIFRADO_SERVER = "PROYECTO3DELILAHACAMICA";
const conexion = new Sequelize("mysql://root@localhost:3306/delilah")
const server = express();

server.listen(3000, ()=>{
    console.log("Servidor iniciado")
})
server.use(bodyParser.json());
//Middlewares
function validarInfoCompletaUsuario (req, res, next){
    const {nombredeusuario, contraseña, nombre, apellido, email, telefono, direccion} = req.body;
    if(!nombredeusuario || !contraseña || !nombre || !apellido || !email || !telefono || !direccion){
        res.status(400).json({ok : false, res:"Debe completar todos los datos para la creación de la cuenta"});
    }else {
        next();
    }
}
function validarInfoCompletaProducto (req,res,next){
    const {nombre, precio, ingredientes, stock} = req.body;
    if( !nombre || !precio || !ingredientes || !stock){
        res.status(400).json({ok:false, res:"Debe completar todos los datos para la creación de un producto nuevo"})
    }else{
        next();
    }
}
function verificarIdExistenteProductos (req,res,next){
    function verificarIdProducto (producto){
        return producto.id == req.params.id;
    }
    const verificarIdExistente = listaDeProductos.find(verificarIdProducto);
    if(verificarIdExistente != undefined){
        next();
    }else{
        res.status(404).json({ok:false, res:"No se encontró ningún producto registrado con ese id."})
    }
}
function verificarNombredeusuario (req,res,next){
    function verificarUsuario (usuario){
        return usuario.nombredeusuario == req.params.nombredeusuario;
    }
    const verificarUsuarioExistente = listaDeUsuarios.find(verificarUsuario);
    console.log(verificarUsuarioExistente)
    if(verificarUsuarioExistente != undefined){
        next();
    }else{
        res.status(404).json({ok:false, res:"No se encontró ningún usuario registrado con ese nombredeusuario."})
    }
}
function validarUsuarioContraseña (req,res,next){
    function validarDatos (usuario){
       return (usuario.nombredeusuario == req.body.nombredeusuario &&
               usuario.contraseña == req.body.contraseña)
    }
    const usuarioEncontrado = listaDeUsuarios.find(validarDatos)
    if(usuarioEncontrado != undefined){
        next();
        }else{
        res.status(401).json({ok:false, res:"Usuario o contraseña incorrecta"})
    }
}
let verificarToken;
function autenticarUsuario (req,res,next){
    try{
        const tokenRecibido = req.headers.authorization.split(" ")[1];
        verificarToken = jwt.verify(tokenRecibido, CLAVE_CIFRADO_SERVER);
        if(verificarToken){
            req.usuario = verificarToken;
            console.log(req.usuario)
            return next();
        }
    }catch(err){
        res.json({error: "error al validar el usuario"})
    }
}
function habilitarPermisosAdministrador(req,res,next){
    const tokenRecibido = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenRecibido, CLAVE_CIFRADO_SERVER);
    function buscarUsuarioAdministrador (usuario){
        return usuario.nombredeusuario === verificarToken.nombredeusuario;
    }
    const verificarAdminstrador = listaDeUsuarios.find(buscarUsuarioAdministrador)
    if(verificarAdminstrador.is_admin == "true"){
        next();
    }else{
        res.status(401).json({ok:false, res:"No posees los permisos necesarios"})
    }
}
function verificarLogIn (req,res,next){
    const headerAutorizacion = req.headers.authorization;
    if(headerAutorizacion != undefined){
        next();
    }else{
        res.json({ res:"Debes iniciar sesion, dirígete a /usuarios/login"})
    }
}

//Listas
let listaDeProductos;
let listaDeUsuarios;
let listaDePedidos;

async function selectUsuarios(){
    listaDeUsuarios= await conexion.query("SELECT * FROM usuarios", {type: conexion.QueryTypes.SELECT})
}
async function selectPedidos(){
    listaDePedidos= await conexion.query("SELECT * FROM pedidos", {type: conexion.QueryTypes.SELECT})
}
selectProductos(); 
selectUsuarios();
selectPedidos();

///////////////PRODUCTOS
//Get lista de productos
async function selectProductos(){
    listaDeProductos= await conexion.query("SELECT * FROM productos", {type: conexion.QueryTypes.SELECT})
}
server.get("/productos", verificarLogIn, autenticarUsuario, (req, res)=>{
    if(listaDeProductos.length > 0){
        res.json(listaDeProductos)
    }else{
        res.status(404).json({ok:false, res:"No hay ningún producto registrado por el momento"})
    }
});
//Get producto por id  
server.get("/productos/:id", verificarLogIn, autenticarUsuario, verificarIdExistenteProductos, (req,res,err)=>{
    conexion.query("SELECT * FROM productos WHERE id = ?", 
        {replacements: [req.params.id], type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        res.json(respuesta)
    })
})
//Post productos por formulario
server.post("/productos", verificarLogIn, habilitarPermisosAdministrador, validarInfoCompletaProducto, (req,res,err)=>{
    function verificarProductoExistente (producto){
        return producto.nombre === req.body.nombre;
    }
    const verificarProducto = listaDeProductos.find(verificarProductoExistente);
    if(verificarProducto != undefined){
        res.status(409).json({ok:false, err: "Ya existe un producto con ese nombre"})
        console.log("Ya existe un producto con ese nombre", err)
    }else{
        conexion.query("INSERT INTO productos (nombre, precio, ingredientes, stock) VALUES (?,?,?,?)",
        {replacements: [req.body.nombre, req.body.precio, req.body.ingredientes, req.body.stock]})
            .then((resultados)=>{
                console.log( "Producto creado con éxito" , resultados)
                res.status(200).json({ ok:true, res:"Producto creado"})
                selectProductos();
            })
            .catch((err)=>{
                console.log("Algo salió mal.......", err)
            })
    }
})
//Put productos por id
server.put("/productos/:id", verificarLogIn, habilitarPermisosAdministrador, verificarIdExistenteProductos, validarInfoCompletaProducto,(req,res,err)=>{
    conexion.query("UPDATE productos SET nombre = ?, precio = ?, ingredientes = ?, stock = ? WHERE id = ?",
    {replacements: [ req.body.nombre, req.body.precio, req.body.ingredientes, req.body.stock, req.params.id]})
        .then((resultados)=>{
            console.log(resultados)
            console.log("Producto actualizado con éxito")
            res.status(201).json({ok:true, res:"Producto actualizado"})
            selectProductos;
        })
        .catch((error)=>{
            res.status(409).json({ ok: false, res: "Algo parece estar mal en los datos ingresados"})
            console.log("Algo salió mal....", error)
        })
})
//Delete productos por id 
server.delete("/productos/:id", verificarLogIn, habilitarPermisosAdministrador, verificarIdExistenteProductos, (req,res,err)=>{
    conexion.query("DELETE FROM productos WHERE id= ?", {replacements: [req.params.id]})
        .then((resultados)=>{
            console.log("Producto eliminado con éxito")
            res.status(204)
            selectProductos;
        })
})
//////////USUARIOS
//Post (sign up) usuarios por formulario
server.post("/usuarios/signup", validarInfoCompletaUsuario, (req,res,err)=>{
    function verificarUsuarioExistente (usuario){
        return usuario.nombredeusuario === req.body.nombredeusuario;
    }
    const verificarUsuario = listaDeUsuarios.find(verificarUsuarioExistente)
    if(verificarUsuario != undefined){
        res.status(409).json({ok:false, err: "Ya existe un usuario con ese nombredeusuario"})
    }else{ 
        conexion.query("INSERT INTO usuarios (nombredeusuario, contraseña, nombre, apellido, email, telefono, direccion, is_admin) VALUES (?,?,?,?,?,?,?,?)",
    {replacements: [req.body.nombredeusuario, req.body.contraseña, req.body.nombre, req.body.apellido, req.body.email, req.body.telefono, req.body.direccion, "false"]})
        .then((resultados)=>{
            console.log( "Usuario creado con éxito" , resultados)
            res.status(200).json({ ok:true, res:"Usuario creado con éxito"})
            selectUsuarios();
        })
        .catch((error)=>{
            console.log("Algo salió mal.......", error)
        })
    }
})
//Post (log in) usuarios 
server.post("/usuarios/login", validarUsuarioContraseña, (req,res,err)=>{
    const {nombredeusuario, contraseña} = req.body;
    const token = jwt.sign({nombredeusuario, contraseña}, CLAVE_CIFRADO_SERVER);
    res.json({token})
})
//Get lista de usuarios 
server.get("/usuarios", verificarLogIn, habilitarPermisosAdministrador, (req, res)=>{
    if(listaDeUsuarios.length > 0){
        res.json(listaDeUsuarios)
    }else{
        res.status(404).json({ok:false, res:"No hay ningún usuario registrado por el momento"})
    }
});
//Get información del usuario logueado
server.get("/usuarios/myinfo", verificarLogIn, (req,res,err)=>{
    const tokenUsuario = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenUsuario, CLAVE_CIFRADO_SERVER);
    function buscarInfoUsuario (usuario){
        return usuario.nombredeusuario === verificarToken.nombredeusuario;
    }
    const infoDeUsuario = listaDeUsuarios.find(buscarInfoUsuario)
    res.json({infoDeUsuario})
})
//Put información del usuario logueado
/*server.put("/usuarios/myinfo",verificarLogIn, (req,res,err)=>{
    const tokenUsuario = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenUsuario, CLAVE_CIFRADO_SERVER);
    conexion.query("UPDATE usuarios SET nombredeusuario = ?, contraseña = ?, nombre = ?, apellido = ?,  email = ?, telefono = ?, direccion = ? WHERE nombredeusuario = ?",
    {replacements: [ req.body.nombredeusuario, req.body.contraseña, req.body.nombre, req.body.apellido, req.body.email, req.body.telefono, req.body.direccion,  verificarToken.nombredeusuario ]})
        .then((resultados)=>{
            console.log("Usuario actualizado con éxito")
            res.status(201).json({ok:true, res:"Usuario actualizado"})
            
        })
        .catch((error)=>{
            res.status(409).json({ ok: false, res: "Algo parece estar mal en los datos ingresados"})
            console.log("Algo salió mal....", error)
        }) 
        selectUsuarios;
})*/
    
//Get usuario por nombredeusuario
server.get("/usuarios/:nombredeusuario", verificarLogIn, habilitarPermisosAdministrador, verificarNombredeusuario, (req,res,err)=>{
    conexion.query("SELECT * FROM usuarios WHERE nombredeusuario = ?", 
        {replacements: [req.params.nombredeusuario], type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        res.status(200).json(respuesta)
    })
})
//Put usuarios por nombredeusuario
server.put("/usuarios/:nombredeusuario", verificarLogIn, habilitarPermisosAdministrador, verificarNombredeusuario, (req,res,err)=>{
    conexion.query("UPDATE usuarios SET nombredeusuario = ?, contraseña = ?, nombre = ?, apellido = ?,  email = ?, telefono = ?, direccion = ? WHERE nombredeusuario = ?",
    {replacements: [ req.body.nombredeusuario, req.body.contraseña, req.body.nombre, req.body.apellido, req.body.email, req.body.telefono, req.body.direccion,  req.params.nombredeusuario ]})
        .then((resultados)=>{
            console.log("Usuario actualizado con éxito")
            res.status(201).json({ok:true, res:"Usuario actualizado"})
            selectUsuarios;
        })
        .catch((error)=>{
            res.status(409).json({ ok: false, res: "Algo parece estar mal en los datos ingresados"})
            console.log("Algo salió mal....", error)
        }) 
 
})
//Delete usuario por nombredeusuario
server.delete("/usuarios/:nombredeusuario", verificarLogIn, habilitarPermisosAdministrador, verificarNombredeusuario, (req,res,err)=>{
    conexion.query("DELETE FROM usuarios WHERE nombredeusuario= ?", {replacements: [req.params.nombredeusuario]})
        .then((resultados)=>{
            console.log("Usuario eliminado con éxito")
            res.status(204)
            selectUsuarios;
        }
    )
})
//////////////PEDIDOS
//Get lista de pedidos
server.get("/pedidos", (req, res)=>{
    if(listaDePedidos.length > 0){
        res.json(listaDePedidos)
    }else{
        res.status(404).json({ok:false, res:"No hay ningún pedido registrado por el momento"})
    }
});
//Post pedidos 
server.post("/pedidos", verificarLogIn, (req,res,err)=>{
    
}  )