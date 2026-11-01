# Resultado de las pruebas (columna Obtenido de la memoria)

Ejecución del banco `src/engine/tests.ts` sobre `public/knowledge.json` del repositorio igorr17/Sistema-Experto, commit 9c411bf, con Node 22 y tsx, el 2026-11-01. Resultado: 16 de 16 superadas, 0 fallidas, 38 ms.

| N.º | Caso | Obtenido | Estado |
| --- | --- | --- | --- |
| 1 | Presupuesto 40 €/día: ningún país con coste > 40 € cumple todos los filtros | Superado. 3 países cumplen el filtro de presupuesto (todos <= 40 €). | Superada |
| 2 | Horas máx. 3: solo quedan países con horas_vuelo <= 3 | Superado. Quedan 8 países y todos tienen <= 3 h de vuelo estimado. | Superada |
| 3 | max_tramite 0: ningún país con nivel_tramite > 0 cumple los filtros | Superado. Quedan 27 países, todos con nivel de trámite 0 (sin trámite previo). | Superada |
| 4 | acepta_vacunas No: ningún país con "Recomendaciones relevantes" cumple los filtros | Superado. Quedan 31 países sin recomendaciones sanitarias relevantes. | Superada |
| 5 | acepta_riesgo No: ningún país con "Riesgo alto" cumple los filtros | Superado. Quedan 32 países, ninguno con riesgo alto según GPI. | Superada |
| 6 | companeros ninos: solo quedan países con seguridad "Bajo riesgo" | Superado. Quedan 13 países clasificados con Bajo riesgo. | Superada |
| 7 | Clima con peso 5 (F10): solo cumplen países con afinidad de clima >= 4 | Superado. Quedan 16 países con afinidad climática óptima en enero (>= 4). | Superada |
| 8 | Lluvia y ajuste P2: resta 1 a la afinidad de clima si no tolera lluvia (> 150 mm) | Superado. La afinidad de clima en India en julio baja de 5 a 4 por lluvia excesiva. | Superada |
| 9 | peso_playa 5: solo quedan países con afinidad playa >= 4 | Superado. Quedan 27 países de alta afinidad con playa (afinidad 4 o 5). | Superada |
| 10 | Pesos todos 0: no se calcula compatibilidad y se emite aviso | Superado. Ningún país tiene compatibilidad numérica calculada y se avisa orden alfabético. | Superada |
| 11 | Filtros imposibles (10 € y 1 h): se muestran "Los que más se ajustan" con aviso M1 (< 70 %) | Superado. 0 países cumplen todo; se muestran 3 bajo "Los que más se ajustan" con sus márgenes y el aviso M1 activado. | Superada |
| 11b | Caso 11b: 0 países cumplen todo pero mejor compatibilidad >= 70 % -> sin aviso M1 | Superado. Mejor compatibilidad es 100 % (>= 70 %). Se muestran "Los que más se ajustan" con márgenes y SIN aviso M1. | Superada |
| 12 | Desempate: más criterios 4-5 y luego menor coste diario | Superado. La ordenación jerárquica de desempates según regla M3 funciona rigurosamente. | Superada |
| 13 | País con SIN DATO (Túnez coste_diario): no se descarta por F1 y afinidad precio vale 3 | Superado. Túnez no fue descartado por falta de dato y su afinidad por defecto fue 3 (marcado como sin dato). | Superada |
| 14 | peso_playa 5 + clima frio: se dispara el aviso del conflicto C1 | Superado. Aviso C1 detectado: "Pides mucha playa y clima fresco a la vez. Elige cuál pesa más." | Superada |
| 15 | Determinismo: misma entrada dos veces produce exactamente la misma salida | Superado. Ambos ciclos de inferencia generaron exactamente la misma lista de países y descartes. | Superada |

Notas:
- La ejecución es del motor sin interfaz. Falta la captura de la ruta `#/tests` de la app publicada, que es la evidencia visual.
- En el caso 12 se comprobó a mano que el perfil usado produce empates reales (por ejemplo India e Italia, ambos con 100 % y 5 criterios altos, se ordenan por coste: 35 € antes que 202 €), así que la prueba no es vacía.
