const express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser")
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


server.get("/usuarios", (req, res)=>{
    res.json(listaDeUsuarios)
});
server.get("/pedidos", (req, res)=>{
    res.json(listaDePedidos)
});
///////////////PRODUCTOS
//Get lista de productos
async function selectProductos(){
    listaDeProductos= await conexion.query("SELECT * FROM productos", {type: conexion.QueryTypes.SELECT})
}
server.get("/productos", (req, res)=>{
    selectProductos();
    res.json(listaDeProductos)
});
//Get producto por id 
let resultadoProductoPorId; 
server.get("/productos/:id", (req,res,err)=>{
    conexion.query("SELECT * FROM productos WHERE id = ?", {replacements: [req.params.id]}, {type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        resultadoProductoPorId = respuesta;
    })
    .catch((err)=>{
        res.status(404).json({ok:false, res:"No se encontró ningun producto con ese id"})
    })
    res.json(resultadoProductoPorId)
})
//Post productos por formulario
server.post("/productos", validarInfoCompletaProducto, (req,res,err)=>{
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
server.put("/productos/:id", validarInfoCompletaProducto,(req,res,err)=>{
    function verificarIdProducto (producto){
        return producto.id == req.params.id;
    }
    const verificarIdExistente = listaDeProductos.find(verificarIdProducto);
    if( verificarIdExistente != undefined){
    conexion.query("UPDATE productos SET nombre = ?, precio = ?, ingredientes = ?, stock = ? WHERE id = ?",
    {replacements: [ req.body.nombre, req.body.precio, req.body.ingredientes, req.body.stock, req.params.id]})
        .then((resultados)=>{
            console.log("Producto actualizado con éxito")
            res.status(201).json({ok:true, res:"Producto actualizado"})
            selectProductos;
        })
        .catch((error)=>{
            res.status(409).json({ ok: false, res: "Algo parece estar mal en los datos ingresados"})
            console.log("Algo salió mal....", error)
        })
    }else{
        res.status(404).json({ ok: false, res:"No hay ningun producto registrado con el id indicado"})
    }
})
//Delete productos por id 
server.delete("/productos/:id", (req,res,err)=>{
    function verificarIdEliminar (producto){
        return producto.id == req.params.id;
    }
    const verificarIdExistenteEliminar = listaDeProductos.find(verificarIdEliminar);
    if(verificarIdExistenteEliminar != undefined){
    conexion.query("DELETE FROM productos WHERE id= ?", {replacements: [req.params.id]})
        .then((resultados)=>{
            console.log("Producto eliminado con éxito")
            res.status(204)
            selectProductos;
        })
    }else{
        res.status(404).json({ok:false, res:"No se encontró ningun producto con el id indicado"})
    }
})
//Post usuarios por formulario
server.post("/usuarios", validarInfoCompletaUsuario, (req,res,err)=>{
    function verificarUsuarioExistente (usuario){
        return usuario.nombredeusuario === req.body.nombredeusuario;
    }
    const verificarUsuario = listaDeUsuarios.find(verificarUsuarioExistente);
    if(verificarUsuario != undefined){
        res.status(409).json({ok:false, err: "Ya existe un usuario con ese nombredeusuario"})
        console.log("upsi ya existe", err)
    }else{
        conexion.query("INSERT INTO usuarios (nombredeusuario, contraseña, nombre, apellido, email, telefono, direccion) VALUES (?,?,?,?,?,?,?)",
            {replacements: [req.body.nombredeusuario, req.body.contraseña, req.body.nombre, req.body.apellido, req.body.email, req.body.telefono, req.body.direccion]})
                .then((resultados)=>{
                    console.log( "Usuario creado con éxito" , resultados)
                    res.status(200).json({ ok:true, res:"Usuario"})
                    selectUsuarios();
            })
                .catch((error)=>{
                    console.log("Algo salió mal.......", err)
                })
    }
})
