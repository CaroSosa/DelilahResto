
const Sequelize = require("sequelize");
const conexion = new Sequelize("mysql://root@localhost:3306/delilah");
const jwt = require("jsonwebtoken");
const CLAVE_CIFRADO_SERVER = "PROYECTO3DELILAHACAMICA";
const moment = require("moment");
const productos = require("./productos");

module.exports ={
    getListaDePedidos,
    getPedidoPorId,
    postPedido,
    getMisPedidos,
    deletePedidoPorId,
    patchModificarEstadoPedido
}
function getListaDePedidos(req,res){ 
    conexion.query("SELECT usuarios.id, usuarios.direccion, pedidos.estado, pedidos.fecha, pedidos.descripcion, pedidos.monto, pedidos.mododepago, productos.nombre, productos.ingredientes, infopedidos.id_pedido, infopedidos.id_producto FROM usuarios INNER JOIN pedidos ON pedidos.usuario_id  = usuarios.id JOIN infopedidos ON infopedidos.id_pedido = pedidos.id JOIN productos ON productos.id = infopedidos.id_producto ORDER BY id_pedido ASC", {type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        if(respuesta.lenght > 0){
            res.json({respuesta})
        }else{
            res.status(404).json({ok:"false", res:"No hay ningún pedido registrado todavía"})
        }
    })
}
function getPedidoPorId(req, res){
    conexion.query("SELECT * FROM pedidos WHERE id = ?", 
        {replacements: [req.params.id], type: conexion.QueryTypes.SELECT})
    .then((pedido)=>{
        if(pedido.length > 0){
            res.json(respuesta)
        }else{
            res.status(404).json({ok:false, res:"No hay nigún pedido registrado con ese id"})
        }
        
    })
}
function postPedido(req,res){
    //productos
    let productosPedidos = [];
    let montoPedido = 0;
    const productosRequest = req.body.productos;
    function concatenarProductoCantidad (element){
        productosPedidos.push(" " + element.nombre + "X" + element.cantidad )
    }
    productosRequest.forEach(concatenarProductoCantidad);
    conexion.query("SELECT * FROM productos", {type: conexion.QueryTypes.SELECT})
    .then((productos)=>{
        for (i = 0; i < productosRequest.length; i++){
            let precioProducto = productos[i].precio;
            let precioMultiplicado = precioProducto * productosRequest[i].cantidad;
            montoPedido = montoPedido + precioMultiplicado
        }
    })
    const stringProductos = productosPedidos.toString();
    //fecha
    const fechaDePedido = moment().format('YYYY-MM-DDThh:mm');
    //usuario
    let infoDeUsuarioPedidos;
    const tokenRecibido = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenRecibido, CLAVE_CIFRADO_SERVER);
    conexion.query("SELECT * FROM usuarios WHERE nombredeusuario = ?", {replacements: [verificarToken.nombredeusuario], type: conexion.QueryTypes.SELECT})
    .then((usuario)=>{
        infoDeUsuarioPedidos = usuario[0];
        conexion.query("INSERT INTO pedidos (usuario_id, descripcion, fecha, mododepago, estado, monto) VALUES (?,?,?,?,?,?)",
        {replacements: [infoDeUsuarioPedidos.id, stringProductos, fechaDePedido, req.body.mododepago, "Nuevo", montoPedido]})
        .then((resultados)=>{
            res.status(200).json({ok:"true", res:"Pedido enviado con éxito"})
            productosRequest.forEach((producto)=>{
                conexion.query("SELECT * FROM productos WHERE nombre = ?", 
                {replacements: [producto.nombre], type: conexion.QueryTypes.SELECT})
                    .then((productoResultado)=>{
                        conexion.query("INSERT INTO infopedidos (id_pedido, id_producto) VALUES (?,?)",
                        {replacements: [resultados[0], productoResultado[0].id]})
                        
                            .then((pedidoFinal)=>{
                                console.log(pedidoFinal)
                            })
                            .catch((error)=>{
                                console.log(error) 
                            })
                        }
                    )
                
                }
            )
        })
        .catch((err)=>{
            console.log("Algo salió mal.......", err)
        })
    })
    
}
function getMisPedidos(req,res){
    const tokenUsuario = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenUsuario, CLAVE_CIFRADO_SERVER);
    console.log(verificarToken.nombredeusuario)
    conexion.query("SELECT usuarios.id, usuarios.direccion, pedidos.estado, pedidos.fecha, pedidos.descripcion, pedidos.monto, pedidos.mododepago, productos.nombre, productos.ingredientes, infopedidos.id_pedido, infopedidos.id_producto FROM usuarios INNER JOIN pedidos ON pedidos.usuario_id  = usuarios.id JOIN infopedidos ON infopedidos.id_pedido = pedidos.id JOIN productos ON productos.id = infopedidos.id_producto WHERE nombredeusuario = ? ORDER BY id_pedido ASC", {replacements : [verificarToken.nombredeusuario], type: conexion.QueryTypes.SELECT})
    .then((DetalleMisPedidos)=>{
        if(DetalleMisPedidos > 0){
        res.json({DetalleMisPedidos})
        }else{
            res.status(404).json({ok:false, res:"Parece que no has hecho ningún pedido por ahora, ve a /pedidos (post) para comenzar."})
        }
    })
}
function deletePedidoPorId (req,res){
    conexion.query("DELETE FROM pedidos WHERE id= ?", {replacements: [req.params.id]})
        .then(()=>{
            res.status(204)
        })
}
function patchModificarEstadoPedido(req, res){
    conexion.query("UPDATE pedidos SET estado = ? WHERE id = ?",
    {replacements: [ req.body.estado ,req.params.id]})
        .then((resultados)=>{
            res.status(201).json({ok:true, res:"Estado de pedido actualizado", resultados})
        })
}