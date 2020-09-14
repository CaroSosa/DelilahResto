
const Sequelize = require("sequelize");
const conexion = new Sequelize("mysql://root@localhost:3306/delilah");
const jwt = require("jsonwebtoken");
const CLAVE_CIFRADO_SERVER = "PROYECTO3DELILAHACAMICA";
const moment = require("moment");

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

let montoPedido = 0;
let productosPedidos = [];

async function postPedido(req,res){
    let productosRequest = req.body.productos;
    productosRequest.forEach(concatenarProductoCantidad);
    const descripcionPedido = productosPedidos.toString();
    const fechaDePedido = moment().format('YYYY-MM-DDThh:mm');
    const idUsuario = await buscarIdUsuario(req);
    const montoPedidoFinal = await calcularMontoPedido(req)
    const idPedidoSimple = await postPedidoArmado (idUsuario, descripcionPedido, fechaDePedido, req, montoPedidoFinal);
    const respuestaPostPedido = await postInfopedidos(req, res, idPedidoSimple);
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
async function calcularMontoPedido(req){
    const listaDeProductos = await conexion.query("SELECT * FROM productos", {type: conexion.QueryTypes.SELECT})
    for (i = 0; i < req.body.productos.length; i++){
        let buscarProducto = (producto)=>{
            return producto.nombre == req.body.productos[i].nombre
        }
        let precioProducto = listaDeProductos.find(buscarProducto).precio
        let precioMultiplicado = precioProducto * req.body.productos[i].cantidad;
        montoPedido = montoPedido + precioMultiplicado;
        }
    return montoPedido;
}
function concatenarProductoCantidad (element){
    productosPedidos.push(" " + element.nombre + "X" + element.cantidad )

}
async function buscarIdUsuario (req){
    const tokenRecibido = req.headers.authorization.split(" ")[1];
    verificarToken = jwt.verify(tokenRecibido, CLAVE_CIFRADO_SERVER);
    let infoUsuario = await conexion.query("SELECT * FROM usuarios WHERE nombredeusuario = ?", {replacements: [verificarToken.nombredeusuario], type: conexion.QueryTypes.SELECT});
    return infoUsuario[0].id
}
async function postPedidoArmado (idUsuario, descripcionPedido, fechaDePedido, req, montoPedidoFinal){
    const idPedido = await conexion.query("INSERT INTO pedidos (usuario_id, descripcion, fecha, mododepago, estado, monto) VALUES (?,?,?,?,?,?)",
    {replacements: [idUsuario, descripcionPedido, fechaDePedido, req.body.mododepago, "Nuevo", montoPedidoFinal]})
    return idPedido[0];
}
async function postInfopedidos(req, res, idPedido){
    await req.body.productos.forEach((producto)=>{
        conexion.query("INSERT INTO infopedidos (id_pedido, id_producto) VALUES (?,?)",
        {replacements: [idPedido, producto.id]})
        }
    )
    return res.status(200).json({ok:true, res:"Pedido enviado con éxito"})
}