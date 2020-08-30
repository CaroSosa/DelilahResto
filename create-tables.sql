CREATE TABLE productos(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT ,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    precio DOUBLE NOT NULL,
    ingredientes TEXT NOT NULL,
    stock INT UNSIGNED NOT NULL
);
CREATE TABLE usuarios(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT ,
    nombredeusuario VARCHAR(60) NOT NULL UNIQUE,
    constraseña VARCHAR(10) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL,
    telefono INT(15) NOT NULL,
    direccion TEXT NOT NULL
);
CREATE TABLE pedidos(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    usuario VARCHAR(60) NOT NULL,
    producto VARCHAR(60) NOT NULL,
    fecha DATE NOT NULL,
    mododepago VARCHAR(60) NOT NULL,
    estado VARCHAR(60) NOT NULL
);