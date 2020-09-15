# Delilah Resto

Api de pedidos para un restaurant creada con Nodejs y mySQL.

## Requerimientos 
Para utilizarlo necesitarás Node.js, Postman y xampp.

### Node
- #### Instalar Node en Windows
  Ve a  [official Node.js website](https://nodejs.org/) y descargar el instalador.
  
- #### Instalar Node en Ubuntu

  Puedes instalar node.js y npm fácilmente con apt install con los siguientes comandos.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Instalar Node en otro sistema operativo 
  Puedes encontrar más información en [official Node.js website](https://nodejs.org/) y [official NPM website](https://npmjs.org/).

Si la instalación fue exitosa deberías poder ejecutar los siguientes comandos.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0
### Postman
Para instalar Postman dirígete a [la página principal de Postman](https://www.postman.com/downloads/) y sigue las instrucciones para tu sistema operativo.


### Xampp
Para instalar Xampp dirígete a [la siguiente página](https://www.apachefriends.org/es/index.html) y sigue las instrucciones para tu sistema operativo.

---

## Empezando 
- Clona el repositorio
```
https://github.com/CaroSosa/DelilahResto.git
```

## Instalación 
Ejecuta ``npm install`` para instalar las dependencias.

### Creación de tablas en mySQL

En el archivo ``create_tables.sql`` encontrarás las estructuras de las tablas para la utilización de la API, junto con la creación del administrador. Este usuario podrá crear, modificar y borrar productos, usuarios y pedidos, así como también podrá visualizar toda la información sobre los usuarios y los pedidos realizados.

### Endpoints

Encontrarás los posibles endpoints en el documento ``spect.yaml``. Puedes abrirlo en el [editor de Swagger](https://editor.swagger.io/) para visualizarlo mejor.

#### Formatos 
- Para ingresar un pedido

```
{
    "productos" : [{
        "id" : "1"
        "nombre" : "ejemplo1",
        "cantidad" : "5"
    },{
        "id" : "2"
        "nombre" : "ejemplo2",
        "cantidad" : "5"
    }],
    "mododepago" : "Efectivo/tarjeta"
}

```

## Autores
- **Sosa Ana Carolina** -  *Trabajo completo* [CaroSosa](https://github.com/CaroSosa)








