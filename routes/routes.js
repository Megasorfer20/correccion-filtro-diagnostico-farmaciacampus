import { Router } from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const bases = process.env.MONGO_URI;
const nombreBase = "farmaciaCampus";
const router = Router();

//1. Obtener todos los medicamentos con menos de 50 unidades en stock

router.get("/medicamentos/min", async (req, res) => {
  try {
    const { count } = req.query;
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const result = await colection
      .find({ stock: { $lt: Number(count) } })
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

// 2. Listar los proveedores con su información de contacto en medicamentos

router.get("/medicamentos/proveedores", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const result = await colection.distinct("proveedor");
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//3. Medicamentos comprados al ‘Proveedor A’.

router.get("/medicamentos/compras", async (req, res) => {
  try {
    const { prov } = req.query;
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const proveedorArray = await colection.distinct("proveedor");
    const proveedorFind = proveedorArray.filter(
      (element) => element.nombre == prov
    );
    const result = await colection
      .find({ proveedor: proveedorFind[0] })
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//4. Obtener recetas médicas emitidas después del 1 de enero de 2023.

router.get("/ventas/recetasMedicas/despues", async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaCompare = new Date(fecha);
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .find({ fechaVenta: { $gte: fechaCompare } })
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//5. Total de ventas del medicamento ‘Paracetamol’.

router.get("/ventas/medicamento", async (req, res) => {
  try {
    const { med } = req.query;
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .find({
        medicamentosVendidos: {
          $elemMatch: { nombreMedicamento: med },
        },
      })
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//6. Medicamentos que caducan antes del 1 de enero de 2024.

router.get("/medicamentos/caducidad/antes", async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaCompare = new Date(fecha);
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const result = await colection
      .find({ fechaExpiracion: { $lte: fechaCompare } })
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//7. Total de medicamentos vendidos por cada proveedor.

router.get("/compras/totalVentasProv", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Compras");

    const projection = { "medicamentosComprados.cantidadComprada": 1 };

    const resultA = await colection
      .find({ "proveedor.nombre": "ProveedorA" })
      .project(projection)
      .toArray();
    const resultB = await colection
      .find({ "proveedor.nombre": "ProveedorB" })
      .project(projection)
      .toArray();
    const resultC = await colection
      .find({ "proveedor.nombre": "ProveedorC" })
      .project(projection)
      .toArray();

    const sumatoria = (element) => {
      return element.reduce((total, medicamento) => {
        return total + medicamento.medicamentosComprados[0].cantidadComprada;
      }, 0);
    };

    res.json({
      ProveedorA: sumatoria(resultA),
      ProveedorB: sumatoria(resultB),
      ProveedorC: sumatoria(resultC),
    });
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//8. Cantidad total de dinero recaudado por las ventas de medicamentos.

router.get("/ventas/reacudacion", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const projection = { medicamentosVendidos: 1 };

    const conectionCol = await colection.find({}).project(projection).toArray();

    let conteo = 0;
    const result = conectionCol.forEach((element) => {
      element.medicamentosVendidos.forEach((el) => {
        conteo = conteo + el.precio;
      });
    });
    res.json({ DineroRecaudado: conteo });
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//9. Medicamentos que no han sido vendidos.

router.get("/ventas/medicamentosSinVender", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");
    const colection2 = db.collection("Ventas");

    const medicamentosVendidos = await colection2
      .aggregate([
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: "$medicamentosVendidos.nombreMedicamento",
            totalCantidadVendida: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
          },
        },
        {
          $project: {
            _id: 0,
            nombreMedicamento: "$_id",
            totalCantidadVendida: 1,
          },
        },
      ])
      .toArray();

    const medsInStock = await colection
      .find({})
      .project({ nombre: 1, stock: 1 })
      .toArray();

    const result = medsInStock.map((element) => {
      const medicamentoVendido = medicamentosVendidos.find(
        (med) => med.nombreMedicamento === element.nombre
      );
      if (medicamentoVendido) {
        element.stock -= medicamentoVendido.totalCantidadVendida;
      }
      return element;
    });

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//10. Obtener el medicamento más caro.

router.get("/medicamentos/maxCost", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const result = await colection
      .find({})
      .sort({ precio: -1 })
      .limit(1)
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//11. Número de medicamentos por proveedor.

router.get("/compras/vendidosPorProveedor", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Compras");

    const projection = { medicamentosComprados: 1 };

    const resultA = await colection
      .find({ "proveedor.nombre": "ProveedorA" })
      .project(projection)
      .toArray();
    const resultB = await colection
      .find({ "proveedor.nombre": "ProveedorB" })
      .project(projection)
      .toArray();
    const resultC = await colection
      .find({ "proveedor.nombre": "ProveedorC" })
      .project(projection)
      .toArray();

    res.json({
      ProveedorA: resultA,
      ProveedorB: resultB,
      ProveedorC: resultC,
    });
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//12. Pacientes que han comprado Paracetamol.

router.get("/ventas/pacientes", async (req, res) => {
  try {
    const { buy } = req.query;
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .find({
        medicamentosVendidos: {
          $elemMatch: { nombreMedicamento: buy },
        },
      })
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//13. Proveedores que no han vendido medicamentos en el último año.

router.get("/compras/noVentas/actual", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Compras");
    const colection2 = db.collection("Proveedores");

    const fechaActual = new Date();
    const anoPasado = new Date();
    anoPasado.setFullYear(anoPasado.getFullYear() - 1);

    const resultFecha = await colection.distinct("proveedor.nombre", {
      fechaCompra: { $gte: anoPasado, $lt: fechaActual },
    });

    const result = await colection2
      .find({
        nombre: { $nin: resultFecha },
      })
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//14. Obtener el total de medicamentos vendidos en marzo de 2023.

router.get("/ventas/fecha", async (req, res) => {
  try {
    const { ano, mes } = req.query;

    const inicioMes = new Date(`${ano}-${mes}`);
    const finMes = new Date(`${ano}-${mes}`);
    finMes.setMonth(finMes.getMonth() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const resultFecha = await colection
      .find({
        fechaVenta: { $gte: inicioMes, $lt: finMes },
      })
      .toArray();

    let indexCount = 0;
    const result = resultFecha.map((ele) => {
      ele.medicamentosVendidos.forEach((count) => {
        indexCount += count.cantidadVendida;
      });
      return indexCount;
    });

    res.json({
      CantidadVendida: result[0],
    });
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//15. Obtener el medicamento menos vendido en 2023.

router.get("/ventas/menorVenta", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .aggregate([
        {
          $match: {
            fechaVenta: { $gte: anoActal, $lt: anoLimite },
          },
        },
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: "$medicamentosVendidos.nombreMedicamento",
            totalCantidadVendida: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
          },
        },
        {
          $sort: {
            totalCantidadVendida: -1,
          },
        },
        {
          $limit: 1,
        },
      ])
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//16. Ganancia total por proveedor en 2023 (asumiendo un campo precioCompra en Compras).

router.get("/compras/ganciaProveedores", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Compras");

    const result = await colection
      .aggregate([
        {
          $unwind: "$medicamentosComprados",
        },
        {
          $group: {
            _id: "$proveedor.nombre",
            gananciasTotales: {
              $sum: {
                $multiply: [
                  "$medicamentosComprados.cantidadComprada",
                  "$medicamentosComprados.precioCompra",
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: "$_id",
            gananciasTotales: 1,
          },
        },
      ])
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//17. Promedio de medicamentos comprados por venta.

router.get("/ventas/promedioMeds", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .aggregate([
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: 0,
            totalCantidadVendida: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
            conteo: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            promedioDeVenta: {
              $divide: ["$totalCantidadVendida", "$conteo"],
            },
          },
        },
      ])
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//18. Cantidad de ventas realizadas por cada empleado en 2023.

router.get("/ventas/ventasPorEmpleadoAll", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");
    const colection2 = db.collection("Empleados");

    const ventasEmpleados = await colection
      .aggregate([
        {
          $match: {
            fechaVenta: { $gte: anoActal, $lt: anoLimite },
          },
        },
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: "$empleado.nombre",
            ventasHechas: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: "$_id",
            ventasHechas: 1,
          },
        },
      ])
      .toArray();

    const empleados = await colection2
      .find({})
      .project({
        _id: 0,
        nombre: 1,
      })
      .toArray();

    empleados.forEach((element) => {
      element.ventasHechas = 0;
      ventasEmpleados.forEach((el) => {
        if (el.proveedor === element.nombre) {
          element.ventasHechas = el.ventasHechas;
        }
      });
    });

    res.json(empleados);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//19. Obtener todos los medicamentos que expiren en 2024.

router.get("/medicamentos/cadudidad/ByYear", async (req, res) => {
  try {
    const { fechaGlobal } = req.query;

    const anoActal = new Date(fechaGlobal);
    const anoLimite = new Date(fechaGlobal);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const result = await colection
      .find({ fechaExpiracion: { $gte: anoActal, $lt: anoLimite } })
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//20. Empleados que hayan hecho más de 5 ventas en total.

router.get("/ventas/ventasPorEmpleado", async (req, res) => {
  try {
    const { count } = req.query;
    console.log(count);
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const vetnasEmpleados = await colection
      .aggregate([
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: "$empleado.nombre",
            ventasHechas: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: "$_id",
            ventasHechas: 1,
          },
        },
      ])
      .toArray();

    const result = vetnasEmpleados.filter((element) => {
      if (element.ventasHechas >= count) {
        return element;
      }
    });

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//21. Medicamentos que no han sido vendidos nunca.

router.get("/ventas/medicamentosSinVender/Never", async (req, res) => {
  try {
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");
    const colection2 = db.collection("Ventas");

    const medicamentosVendidos = await colection2.distinct(
      "medicamentosVendidos.nombreMedicamento"
    );

    const medsInStock = await colection
      .find({
        nombre: { $nin: medicamentosVendidos },
      })
      .toArray();

    res.json(medsInStock);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//22. Paciente que ha gastado más dinero en 2023.

router.get("/ventas/gastosPacientes", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .aggregate([
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: "$paciente.nombre",
            gastosTotales: {
              $sum: {
                $multiply: [
                  "$medicamentosVendidos.cantidadVendida",
                  "$medicamentosVendidos.precio",
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: "$_id",
            gastosTotales: 1,
          },
        },
        {
          $sort: {
            gastosTotales: -1,
          },
        },
        { $limit: 1 },
      ])
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//23. Empleados que no han realizado ninguna venta en 2023.

router.get("/ventas/empleadosSinVentas", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActual = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");
    const colection2 = db.collection("Empleados");

    const empleadosConVentas = await colection
      .aggregate([
        {
          $match: {
            fechaVenta: { $gte: anoActual, $lt: anoLimite },
          },
        },
        {
          $group: {
            _id: "$empleado.nombre",
          },
        },
      ])
      .toArray();

    const empleados = await colection2
      .find({})
      .project({
        _id: 0,
        nombre: 1,
      })
      .toArray();

    const empleadosConVentasSet = new Set(
      empleadosConVentas.map((empleado) => empleado._id)
    );

    const empleadosSinVentas = empleados.filter(
      (empleado) => !empleadosConVentasSet.has(empleado.nombre)
    );

    res.json(empleadosSinVentas);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//24. Proveedor que ha suministrado más medicamentos en 2023.

router.get("/compras/suministroProveedor", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Compras");

    const result = await colection
      .aggregate([
        {
          $match: {
            fechaCompra: { $gte: anoActal, $lt: anoLimite },
          },
        },
        {
          $unwind: "$medicamentosComprados",
        },
        {
          $group: {
            _id: "$proveedor.nombre",
            medicamentoVendido: {
              $push: {
                nombreMedicamento: "$medicamentosComprados.nombreMedicamento",
                cantidadVendida: {
                  $sum: "$medicamentosComprados.cantidadComprada",
                },
              },
            },
          },
        },
        {
          $unwind: "$medicamentoVendido",
        },
        {
          $group: {
            _id: "$_id",
            proveedor: { $first: "$_id" },
            medicamentoVendido: { $push: "$medicamentoVendido" },
            totalVentas: { $sum: "$medicamentoVendido.cantidadVendida" },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: 1,
            medicamentoVendido: 1,
          },
        },
        {
          $sort: {
            totalVentas: -1,
          },
        },
        { $limit: 1 },
      ])
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//25. Pacientes que compraron el medicamento “Paracetamol” en 2023.

router.get("/ventas/mayorCompra", async (req, res) => {
  try {
    const { ano,med } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .aggregate([
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $match: {
            fechaVenta: { $gte: anoActal, $lte: anoLimite },
            "medicamentosVendidos.nombreMedicamento": med
          }
        },

      ])
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//26. Total de medicamentos vendidos por mes en 2023.

router.get("/ventas/totalVndidos/ByMonth", async (req, res) => {
  try {
    const { ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);

    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection.aggregate([
      {
        $project: {
          mes: { $month: "$fechaVenta" },
          cantidadVendida: { $sum: "$medicamentosVendidos.cantidadVendida" }
        }
      },
      {
        $group: {
          _id: "$mes",
          totalCantidadVendida: { $sum: "$cantidadVendida" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          mes: "$_id",
          totalCantidadVendida: 1
        }
      }
    ]).toArray();

    result.forEach(el=>{
      el.mes = new Date(`${ano}-${el.mes}`)
      el.mes = el.mes.toLocaleString('default', { month: 'long' })
    })

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//27. Empleados con menos de 5 ventas en 2023.

router.get("/ventas/ventasPorEmpleado", async (req, res) => {
  try {
    const { count ,ano } = req.query;

    const anoActal = new Date(ano);
    const anoLimite = new Date(ano);

    anoLimite.setFullYear(anoLimite.getFullYear() + 1);
    
    console.log(count);
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");
    const colection2 = db.collection("Empleados");

    const vetnasEmpleados = await colection
      .aggregate([
        {$match:{}},
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: "$empleado.nombre",
            ventasHechas: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: "$_id",
            ventasHechas: 1,
          },
        },
      ])
      .toArray();

    const result = vetnasEmpleados.filter((element) => {
      if (element.ventasHechas >= count) {
        return element;
      }
    });



    const empleadosConVentas = await colection
      .aggregate([
        {
          $match: {
            fechaVenta: { $gte: anoActal, $lt: anoLimite },
          },
        },
        {
          $group: {
            _id: "$empleado.nombre",
          },
        },
      ])
      .toArray();

    const empleados = await colection2
      .find({})
      .project({
        _id: 0,
        nombre: 1,
      })
      .toArray();

    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

//28. Número total de proveedores que suministraron medicamentos en 2023.

//29. Proveedores de los medicamentos con menos de 50 unidades en stock.

//30. Pacientes que no han comprado ningún medicamento en 2023.

//31. Medicamentos que han sido vendidos cada mes del año 2023.

//32. Empleado que ha vendido la mayor cantidad de medicamentos distintos en 2023.

//33. Total gastado por cada paciente en 2023.

//34. Medicamentos que no han sido vendidos en 2023.

//35. Proveedores que han suministrado al menos 5 medicamentos diferentes en 2023.

//36. Total de medicamentos vendidos en el primer trimestre de 2023.

//37. Empleados que no realizaron ventas en abril de 2023.

//38. Medicamentos con un precio mayor a 50 y un stock menor a 100.

router.get("/medicamentos/filter", async (req, res) => {
  try {
    const { maxPrice, stock } = req.query;
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const filterStock = await colection
      .find({ stock: { $lte: Number(stock) } })
      .toArray();

    const result = filterStock.filter(
      (element) => element.stock >= Number(maxPrice)
    );
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

export default router;
