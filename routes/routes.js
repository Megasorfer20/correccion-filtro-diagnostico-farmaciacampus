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

router.get("/ventas/recetasMedicas/despues", async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaCompare =new Date(fecha)
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Ventas");

    const result = await colection
      .find({fechaVenta: {$gte:fechaCompare}})
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

router.get("/medicamentos/caducidad/antes", async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaCompare =new Date(fecha)
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const result = await colection
      .find({fechaExpiracion: {$lte:fechaCompare}})
      .toArray();
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

router.get("/medicamentos/filter", async (req, res) => {
  try {
    const { maxPrice,stock } = req.query;
    const client = new MongoClient(bases);
    await client.connect();
    const db = client.db(nombreBase);
    const colection = db.collection("Medicamentos");

    const filterStock = await colection
      .find({ stock: { $lte: Number(stock) } })
      .toArray();

    const result = filterStock.filter(element => element.stock >= Number(maxPrice))
    res.json(result);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(404).json("No se reconoce el dato");
  }
});

export default router;
