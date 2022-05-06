//Importación de dependencias y configuración inicial
const express = require("express");
const joyas = require("./data/joyas");
const app = express();
const port = 3000;

// Conexión a Servidor
app.listen(port, () => console.log('Servidor inicializado en puerto ' + port));

// Definición de estructura HATEOAS
const HATEOASV1 = () => joyas.results;

const HATEOASV2 = () =>
  joyas.results.map((joya) => ({
    id_joya: joya.id,
    nombre_joya: joya.name,
    modelo_joya: joya.model,
    categoria_joya: joya.category,
    material_joya: joya.metal,
    cadena_joya: joya.cadena,
    medida_joya: joya.medida,
    valor_joya: joya.value,
    stock_joya: joya.stock,
  }));

// Disponibiliza filtrado por categoría
const categoryFilter = (categoria) => {
  return joyas.results.filter((joya) => joya.category == categoria);
};

// Disponibiliza filtrado por id
const idFilter = (id) => {
  return joyas.results.find((joya) => joya.id == id);
};

// Disponibiliza la eliminación de campos que no se reciben como parametro
const fieldFilter = (joya, campo) => {
  for (propiedad in joya) {
    if (!campo.includes(propiedad)) delete joya[propiedad];
  }
  return joya;
};

// Disponibiliza ordenamiento ascendente o descendente
const orden = (orden) => {
  const order = orden == "desc" ? { a: -1, b: 1 } : { a: 1, b: -1 };
  return joyas.results.sort((a, b) => (a.value > b.value ? order.a : order.b));
};

// Disponibiliza rutas para mostrar todas las joyas 
// Ruta versión 1
app.get("/api/v1/joyas", (_, res) => {
  res.send({ joyas: HATEOASV1() });
});

// Ruta versión 2
app.get("/api/v2/joyas", (req, res) => {
  // Define orden ascendente o descendiente
  const { value } = req.query;
  if (["asc", "desc"].includes(value)) return res.send(orden(value));

  // Define paginación y límites
  if (req.query.page) {
    const { page, limits } = req.query;
    return res.send({
      joya: HATEOASV2().slice(page * limits - limits, page * limits),
    });
  }
  res.send({ joyas: HATEOASV2() });
});

// Disponibiliza ruta para mostrar joyas por categoría
app.get("/joyas/category/:categoria", (req, res) => {
  const { categoria } = req.params;
  res.send(categoryFilter(categoria));
});

// Disponibiliza ruta para mostrar joyas por id
app.get("/joyas/:id/", (req, res) => {
  // Devuelve campos de una joya
  const { id } = req.params;
  const { campo } = req.query;
  if (campo)
    return res.send({
      joya: fieldFilter(idFilter(id), campo.split(",")),
    });

  // Mensaje de error
  idFilter(id)
    ? res.send({ joya: idFilter(id) })
    : res.status(404).send({
        error: "404 Not Found",
        message: "No existe una joya con ese id",
      });
});

