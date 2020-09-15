CREATE TABLE productos(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT ,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    precio DOUBLE NOT NULL,
    ingredientes TEXT NOT NULL
);
CREATE TABLE usuarios(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT ,
    nombredeusuario VARCHAR(60) NOT NULL UNIQUE,
    contraseña VARCHAR(15) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL,
    telefono INT(15) NOT NULL,
    direccion TEXT NOT NULL,
    is_admin VARCHAR(5) NOT NULL
);
CREATE TABLE pedidos(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    FOREIGN KEY FK_idUsuario (usuario_id) REFERENCES usuarios(id),
    descripcion VARCHAR (100) NOT NULL,
    fecha DATE NOT NULL,
    mododepago VARCHAR(60) NOT NULL,
    monto INT NOT NULL,
    estado VARCHAR(60) NOT NULL
);
CREATE TABLE infoPedidos (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    FOREIGN KEY FK_pedidos (id_pedido) REFERENCES pedidos(id),
    FOREIGN KEY FK_productos (id_producto) REFERENCES productos(id)
)

INSERT INTO usuarios (nombredeusuario, contraseña, is_admin)
VALUES ("administrador", "acamicadelilah", "true")


