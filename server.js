const express = require("express");
const bodyParser = require("body-parser");
const server = express();

const funcionesProductos = require("./funciones/productos"); 
const funcionesUsuarios = require("./funciones/usuarios");
const funcionesPedidos = require("./funciones/pedidos");
const middleware = require("./funciones/middlewares");

server.listen(3000, ()=>{
    console.log("Servidor iniciado")
})
server.use(bodyParser.json());

///////////////PRODUCTOS
//Get lista de productos
server.get("/productos", middleware.verificarLogIn, funcionesProductos.getListaDeProductos);
//Get producto por id  
server.get("/productos/:id", middleware.verificarLogIn, middleware.verificarIdExistenteProductos, funcionesProductos.getProductoPorId)
//Post productos por formulario
server.post("/productos", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.validarInfoCompletaProducto, funcionesProductos.guardarProductoPorFormulario)
//Put productos por id
server.put("/productos/:id", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.verificarIdExistenteProductos, middleware.validarInfoCompletaProducto, funcionesProductos.modificarProducto)
//Delete productos por id 
server.delete("/productos/:id", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.verificarIdExistenteProductos, funcionesProductos.deleteProducto)
//////////USUARIOS
//Post (sign up) usuarios por formulario
server.post("/usuarios/signup", middleware.validarInfoCompletaUsuario, funcionesUsuarios.signUpUsuario )
//Post (log in) usuarios 
server.post("/usuarios/login", middleware.validarUsuarioContraseña, funcionesUsuarios.logInUsuario)
//Get lista de usuarios 
server.get("/usuarios", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, funcionesUsuarios.getListaDeUsuarios);
//Get información del usuario logueado
server.get("/usuarios/myinfo", middleware.verificarLogIn, funcionesUsuarios.getMyInfoUsuarioLogueado )  
//Get usuario por nombredeusuario
server.get("/usuarios/:nombredeusuario", middleware.verificarLogIn,middleware.habilitarPermisosAdministrador, funcionesUsuarios.getUsuarioPorNombredeusuario )
//Put usuarios por nombredeusuario
server.put("/usuarios/:nombredeusuario", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.validarInfoCompletaUsuario, funcionesUsuarios.modificarUsuarioPorNombredeusuario )
//Delete usuario por nombredeusuario
server.delete("/usuarios/:nombredeusuario", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, funcionesUsuarios.deleteUsuariosPorNombredeusuario)
//////////////PEDIDOS
//Get lista de pedidos
server.get("/pedidos", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, funcionesPedidos.getListaDePedidos);
//Get pedido por id
server.get("/pedidos/:id", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.verificarIdExistentePedidos, funcionesPedidos.getPedidoPorId)
//Post pedidos 
server.post("/pedidos", middleware.verificarLogIn, middleware.validarInfoCompletaPedido, funcionesPedidos.guardarPedido)
//Get mis pedidos 
server.get("/mispedidos", middleware.verificarLogIn, funcionesPedidos.getMisPedidos)  
//Patch estado de pedido por id
server.patch("/pedidos/:id", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.verificarIdExistentePedidos, funcionesPedidos.modificarEstadoPedido)
//Delete pedidos por id
server.delete("/pedidos/:id", middleware.verificarLogIn, middleware.habilitarPermisosAdministrador, middleware.verificarIdExistenteProductos, funcionesPedidos.deletePedidoPorId)

