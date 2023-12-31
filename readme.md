# Ejercicio y sus endpoints

**1. Obtener todos los medicamentos con menos de 50 unidades en stock.**

http://localhost:6000/test/medicamentos/min/?count=50  

**2. Listar los proveedores con su información de contacto en medicamentos.**

http://localhost:6000/test/medicamentos/proveedores

**3. Medicamentos comprados al ‘Proveedor A’.**

http://localhost:6000/test/medicamentos/compras/?prov=ProveedorA

**4. Obtener recetas médicas emitidas después del 1 de enero de 2023.**

http://localhost:6000/test/ventas/recetasMedicas/despues/?fecha=2023-01-01

**5. Total de ventas del medicamento ‘Paracetamol’.**

http://localhost:6000/test/ventas/medicamento/?med=Paracetamol

**6. Medicamentos que caducan antes del 1 de enero de 2024.**

http://localhost:6000/test/medicamentos/caducidad/antes/?fecha=2024-01-01

**7. Total de medicamentos vendidos por cada proveedor.**

http://localhost:6000/test/compras/totalVentasProv

**8. Cantidad total de dinero recaudado por las ventas de medicamentos.**

http://localhost:6000/test/ventas/reacudacion

**9. Medicamentos que no han sido vendidos.**

http://localhost:6000/test/ventas/medicamentosSinVender

**10. Obtener el medicamento más caro.**

http://localhost:6000/test/medicamentos/maxCost

**11. Número de medicamentos por proveedor.**

http://localhost:6000/test/compras/vendidosPorProveedor

**12. Pacientes que han comprado Paracetamol.**

http://localhost:6000/test/ventas/pacientes/?buy=Paracetamol

**13. Proveedores que no han vendido medicamentos en el último año.**

http://localhost:6000/test/compras/noVentas/actual

**14. Obtener el total de medicamentos vendidos en marzo de 2023.**

http://localhost:6000/test/ventas/fecha/?ano=2023&mes=03

**15. Obtener el medicamento menos vendido en 2023.**

http://localhost:6000/test/ventas/menorVenta?ano=2023

**16. Ganancia total por proveedor en 2023 (asumiendo un campo precioCompra en Compras).**

http://localhost:6000/test/compras/ganciaProveedores

**17. Promedio de medicamentos comprados por venta.**

http://localhost:6000/test/ventas/promedioMeds

**18. Cantidad de ventas realizadas por cada empleado en 2023.**

http://localhost:6000/test/ventas/ventasPorEmpleadoAll/?ano=2023

**19. Obtener todos los medicamentos que expiren en 2024.**

http://localhost:6000/test/medicamentos/cadudidad/ByYear/?fechaGlobal=2024

**20. Empleados que hayan hecho más de 5 ventas en total.**

http://localhost:6000/test/ventas/ventasPorEmpleado/?count=5

**21. Medicamentos que no han sido vendidos nunca.**

http://localhost:6000/test/ventas/medicamentosSinVender/Never

**22. Paciente que ha gastado más dinero en 2023.**

http://localhost:6000/test/ventas/gastosPacientes/?ano=2023

**23. Empleados que no han realizado ninguna venta en 2023.**

http://localhost:6000/test/ventas/empleadosSinVentas/?ano=2023

**24. Proveedor que ha suministrado más medicamentos en 2023.**

http://localhost:6000/test/compras/suministroProveedor/?ano=2023

**25. Pacientes que compraron el medicamento “Paracetamol” en 2023.**

http://localhost:6000/test/ventas/mayorCompra/?ano=2023&med=Paracetamol

**26. Total de medicamentos vendidos por mes en 2023.**

http://localhost:6000/test/ventas/totalVndidos/ByMonth/?ano=2023

**27. Empleados con menos de 5 ventas en 2023.**

http://localhost:6000/test/ventas/ventasPorEmpleado/menosDe/?count=5&ano=2023

**28. Número total de proveedores que suministraron medicamentos en 2023.**

http://localhost:6000/test/compras/conteoProveedores?ano=2023

**29. Proveedores de los medicamentos con menos de 50 unidades en stock.**

http://localhost:6000/test/compras/stockProveedor/menos/?count=50

**30. Pacientes que no han comprado ningún medicamento en 2023.**

http://localhost:6000/test/ventas/pacientesSinCompras/?ano=2023

**31. Medicamentos que han sido vendidos cada mes del año 2023.**

http://localhost:6000/test/ventas/listaVendidos/ByMonth/?ano=2023

**32. Empleado que ha vendido la mayor cantidad de medicamentos distintos en 2023.**

http://localhost:6000/test/ventas/medsByEmployee/max/?ano=2023

**33. Total gastado por cada paciente en 2023.**

http://localhost:6000/test/ventas/gastosPacientes/ByMonth?ano=2023

**34. Medicamentos que no han sido vendidos en 2023.**

http://localhost:6000/test/medicamentos/noVentas/ByYear/?ano=2023

**35. Proveedores que han suministrado al menos 5 medicamentos diferentes en 2023.**

http://localhost:6000/test/compras/proveedores/suministros/?ano=2023&minimun=5

**36. Total de medicamentos vendidos en el primer trimestre de 2023.**

http://localhost:6000/test/ventas/medicamentos/VentaTrimestre/?ano=2023&trimestre=1

**37. Empleados que no realizaron ventas en abril de 2023.**

http://localhost:6000/test/empleados/noVentas/?ano=2023&mes=4

**38. Medicamentos con un precio mayor a 50 y un stock menor a 100.**

http://localhost:6000/test/medicamentos/filter/?maxPrice=50&stock=100