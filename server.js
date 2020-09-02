const express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser")
const conexion = new Sequelize("mysql://root@localhost:3306/delilah")

const server = express();

server.listen(3000, ()=>{
    console.log("Servidor iniciado")
})
server.use(bodyParser.json());
//Listas
let listaDeProductos;
let listaDeUsuarios;
let listaDePedidos;

async function selectProductos(){
    listaDeProductos= await conexion.query("SELECT * FROM productos", {type: conexion.QueryTypes.SELECT})
}
async function selectUsuarios(){
    listaDeUsuarios= await conexion.query("SELECT * FROM usuarios", {type: conexion.QueryTypes.SELECT})
}
async function selectPedidos(){
    listaDePedidos= await conexion.query("SELECT * FROM pedidos", {type: conexion.QueryTypes.SELECT})
}
selectProductos(); 
selectUsuarios();
selectPedidos();

server.get("/productos", (req, res)=>{
    res.json(listaDeProductos)
});
server.get("/usuarios", (req, res)=>{
    res.json(listaDeUsuarios)
});
server.get("/pedidos", (req, res)=>{
    res.json(listaDePedidos)
});
//Post usuarios por formulario

server.post("/usuarios", (req,res,err)=>{
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
//Post productos por formulario
var productoExistente = false;
server.post("/productos", (req,res,err)=>{
    if(req.body.nombre.length > 0){
        const indiceProductos = listaDeProductos.findIndex((element) =>{
            return element.nombre == req.body.nombre
        })
    if( productoExistente == true){
        res.status(409).json({ ok: false, error: "Ya existe un producto con ese nombre"})
        }else {
            conexion.query("INSERT INTO productos (nombre, precio, ingredientes, stock) VALUES (?,?,?,?)",
            {replacements: [req.body.nombre, req.body.precio, req.body.ingredientes, req.body.stock]})
                .then((resultados)=>{
                    console.log( "Producto creado con éxito" , resultados)
            });
        }
    }
});
//Post pedidos
