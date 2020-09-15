const Sequelize = require("sequelize");
const conexion = new Sequelize("mysql://root@localhost:3306/delilah")

module.exports = {
    getProductoPorId,
    getListaDeProductos,
    guardarProductoPorFormulario,
    modificarProducto,
    deleteProducto
}
function getListaDeProductos(req,res){ 
    conexion.query("SELECT * FROM productos", {type: conexion.QueryTypes.SELECT})
    .then((Listado)=>{
        if(Listado.lenght != 0){
            res.json({Listado})
        }else{
            res.status(404).json({ok:"false", res:"No hay ningún producto registrado todavía"})
        }
    })
}
function getProductoPorId (req,res){
    conexion.query("SELECT * FROM productos WHERE id = ?", 
        {replacements: [req.params.id], type: conexion.QueryTypes.SELECT})
    .then((respuesta)=>{
        res.json(respuesta)
    })
}
function guardarProductoPorFormulario(req,res){
    conexion.query("INSERT INTO productos (nombre, precio, ingredientes) VALUES (?,?,?)",
    {replacements: [req.body.nombre, req.body.precio, req.body.ingredientes]})
        .then((resultados)=>{
            console.log( "Producto creado con éxito" , resultados)
            res.status(200).json({ ok:true, res:"Producto creado"})
        })
        .catch((err)=>{
            res.status(409).json({ok:false, res:"Ya existe un producto con ese nombre"})
            console.log("Algo salió mal.......", err)
        })
}
function modificarProducto (req,res,err){
    conexion.query("UPDATE productos SET nombre = ?, precio = ?, ingredientes = ? WHERE id = ?",
    {replacements: [ req.body.nombre, req.body.precio, req.body.ingredientes, req.params.id]})
        .then((resultados)=>{
            res.status(201).json({ok:true, res:"Producto actualizado", resultados})
        })
        .catch((error)=>{
            res.status(409).json({ ok: false, res: "Algo parece estar mal en los datos ingresados"})
        })
}
function deleteProducto(req,res){
    conexion.query("DELETE FROM productos WHERE id= ?", {replacements: [req.params.id]})
        .then((resultados)=>{
            console.log("Producto eliminado con éxito")
            res.status(204)
        })
}