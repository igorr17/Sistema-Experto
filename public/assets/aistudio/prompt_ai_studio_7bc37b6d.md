# Prompt para Google AI Studio (modo Build)

Antes de pegar el prompt: en AI Studio, modo Build, crea la app, abre el panel de ficheros y sube `knowledge.app.json` con el nombre `public/knowledge.json` (113 KB). Después pega el prompt completo.

---

## PROMPT (copiar desde aquí)

Construye una aplicación web llamada "Akinator de viajes": un sistema experto que, con preguntas al usuario, recomienda un país para viajar entre 40 candidatos. Todo el texto de la interfaz debe estar en español de España.

### 1. Restricciones obligatorias
- El motor de inferencia es determinista y se ejecuta en el navegador (TypeScript/JavaScript). NO llames a Gemini ni a ninguna API de IA para decidir ni para explicar. Sin claves de API en el código ni en el repositorio.
- Sin base de datos. El conocimiento se lee de `public/knowledge.json` (ya está subido; no lo inventes ni lo modifiques). La sesión vive en memoria.
- Separa el código en módulos: `engine/` (motor de inferencia y evaluador de reglas, sin dependencias de React), `explain/` (módulo de explicación), `ui/` (componentes), `data/` (carga de knowledge.json). El motor debe poder probarse sin interfaz.
- No hardcodees ningún país, valor o regla en el código. Todo sale de knowledge.json.

### 2. Estructura de knowledge.json
`{ version, criterios[], paises[], reglas[], preguntas[] }`
- `criterios[]`: 8 criterios `{id, atributo, metodo: "mapa"|"quintil", ...}`. Ids: playa, cultura, naturaleza, gastronomia, precio, cercania, seguridad, ingles.
- `paises[]`: `{id, nombre, zona, subzona, nivel_tramite (0-3 o null), atributos{clave:{valor,fuente,fecha,calidad,obs}}, clima{temperatura[12],precipitacion[12],fuente,fecha}|null, afinidad{criterio_id: 1-5|null}}`. El valor "SIN DATO" indica dato no disponible. Claves de atributos: coste_diario, horas_vuelo, entrada_espanoles, seguridad, sanitarios, patrimonio_cultural, naturaleza, gastronomia, ingles, moneda_euro, playa.
- `reglas[]` y `preguntas[]`: ver abajo.

### 3. Hechos del usuario (base de hechos)
Objeto `hecho` con las respuestas: presupuesto_diario, dias, mes (1-12), horas_max, companeros (solo|pareja|ninos|grupo), max_tramite (0-3), acepta_vacunas (Sí|No), acepta_riesgo (Sí|No), clima (calido|templado|frio|indiferente), tolera_lluvia (Sí|No), peso_playa, peso_cultura, peso_naturaleza, peso_gastronomia, peso_precio, peso_cercania, peso_seguridad, peso_ingles (1-5; "Me da igual" = 0).

### 4. Preguntas (flujo tipo Akinator)
- Una pregunta por pantalla, con barra de progreso y botón "Atrás". Orden: las preguntas del array `preguntas` en el orden dado (Q1..Q10 de restricciones, luego las 8 de preferencia E_*).
- Tipos: `numero` (campo con min/max), `categoria_unica` (botones; usa las `etiquetas` de cada opción si existen, si no el valor), `escala_1_5` (botones 1-5 con etiquetas "Poco" en 1 y "Mucho" en 5, más el botón "Me da igual" que guarda 0 si `permite_me_da_igual`).
- Las preguntas con `opcional: true` se pueden saltar; saltarlas equivale a peso 0 y se avisa en el resultado (regla D2).
- Para una pregunta de restricción sin responder, el filtro correspondiente no se aplica y se avisa en el resultado (regla D2).
- Tras cada respuesta, ejecuta el motor y muestra arriba un contador "Quedan N países posibles".

### 5. Motor de inferencia
Implementa estos pasos, en este orden, cada vez que cambian los hechos:

**Paso 1: filtros eliminatorios.** Para cada país evalúa todas las reglas con `tipo` "filtro" y "filtro_por_criterio". Una regla se dispara si TODAS sus condiciones de `si` son verdaderas. Si se dispara, el país queda descartado y se guarda el id de la regla y el `motivo` con las plantillas sustituidas. Un país puede acumular varios motivos. Si una condición necesita un valor que es SIN DATO, null o un hecho no respondido, esa condición es falsa (la regla no se dispara: el país no se descarta por falta de datos).

Evaluación de condiciones `{izq, op, der}`:
- `izq` y `der` pueden ser un número, una cadena, una lista, o una ruta. Las rutas empiezan por `pais.` o `hecho.`.
- `pais.X` donde X es una clave de atributos: valor = `atributos[X].valor` (ej. `pais.coste_diario`, `pais.sanitarios`, `pais.entrada_espanoles`). Excepciones: `pais.nivel_tramite` es un campo directo; `pais.afinidad.<criterio>` es `afinidad[criterio]`; `pais.clima.temperatura[hecho.mes]` es `clima.temperatura[mes-1]` (mes de 1 a 12, el array tiene 12 posiciones); igual con `precipitacion`.
- `hecho.X` es el hecho X.
- Operadores: `>`, `<`, `>=`, `<=`, `==`, `!=`, `fuera_de` (der es [min,max]; verdadero si el valor es < min o > max).
- Regla `F10` (`filtro_por_criterio`): tiene `para_cada` (lista de ids de criterio). Se evalúa una vez por cada criterio sustituyendo `{criterio}` en las rutas y en el motivo (`hecho.peso_{criterio}`, `pais.afinidad.{criterio}`). Si afinidad es null (SIN DATO) la condición es falsa.
- Condiciones con `hecho.clima == "indiferente"` no descartan nada (las reglas F8a/F8b/F8c solo comparan con calido/templado/frio).

**Paso 2: puntuación ponderada (regla P1).** Para cada país NO descartado:
`compatibilidad = suma(peso_i * afinidad_i) / suma(5 * peso_i) * 100`, sumando solo los criterios con peso > 0. Si `afinidad` es null (SIN DATO), usa 3 y marca el criterio como "dato no disponible". Si todos los pesos son 0, la compatibilidad no se calcula: muestra los países en orden alfabético y avisa de que no se indicaron preferencias.

**Paso 3: ordenación y empates (regla M3).** Orden descendente por compatibilidad. Desempate: más criterios con afinidad 4 o 5; si persiste, menor `coste_diario`.

**Paso 4: conflictos (reglas tipo "conflicto").** Evalúa sus condiciones sobre los hechos; si se disparan, muestra el `mensaje` como aviso (nunca descartan).

**Paso 5: casos límite (reglas M1, M2).** Si no queda ningún país: muestra qué filtro descartó más países y propón relajarlo; si ese filtro es F10, propón bajar el 5 a un 4 en el criterio concreto. Si quedan menos de 3, muestra los que queden y avisa.

### 6. Módulo de explicación
- Para cada país del top 3: lista de criterios con peso, afinidad y aportación en puntos; qué datos reales lo justifican (valor del atributo con su unidad: €/día, horas, número de sitios UNESCO, etc.); y la lista de reglas que se evaluaron sin descartarlo.
- Para cada país descartado: el id de la regla (F1, F4...) y el motivo en lenguaje natural. Pantalla "Países descartados" con buscador, agrupados por regla.
- Cada dato mostrado incluye una insignia de calidad (`verificado` / `estimado` / `SIN DATO`) y un enlace a su `fuente` con la `fecha` de consulta. Si `fuente` no empieza por http, muéstrala como texto.
- Panel "Reglas disparadas" con el log ordenado: regla, país afectado, resultado.
- Texto fijo visible de limitaciones: "Datos consultados el 2026-10-19. Los requisitos de entrada y sanitarios pueden cambiar. Seguridad = Global Peace Index (umbral propio). Naturaleza y gastronomía = reconocimientos UNESCO, no miden toda la oferta."

### 7. Interfaz
- Pantalla de inicio con título, una frase de qué hace y botón "Empezar".
- Pantalla de resultado: top 3 en tarjetas con porcentaje, un gráfico de barras simple (sin librerías externas pesadas, SVG o CSS) con la aportación por criterio, botón "Ver por qué" que abre la explicación completa, y botón "Reiniciar". Debajo, una tabla con el resto de países válidos ordenados.
- Diseño limpio, legible en móvil y escritorio, contraste suficiente, botones con foco visible y navegación con teclado.
- Muestra la versión de knowledge.json (`version`) en el pie.

### 8. Pruebas
Crea `engine/tests.ts` con una función `runTests()` que ejecute estos casos sobre knowledge.json y devuelva un informe pass/fail; añade una ruta `#/tests` que lo muestre:
1. Presupuesto 40 €/día: ningún país con coste_diario > 40 sigue vivo.
2. Horas máx. 3: solo quedan países con horas_vuelo <= 3.
3. max_tramite 0: ningún país con nivel_tramite > 0 sigue vivo.
4. acepta_vacunas No: ningún país con sanitarios "Recomendaciones relevantes" sigue vivo.
5. acepta_riesgo No: ningún país con seguridad "Riesgo alto" sigue vivo.
6. companeros ninos: solo quedan países con seguridad "Bajo riesgo".
7. mes 1 + clima calido: ningún país con temperatura de enero < 22 °C.
8. mes 7 + tolera_lluvia No: ningún país con precipitación de julio > 150 mm.
9. peso_playa 5: solo quedan países con afinidad playa >= 4.
10. Pesos todos 0: no se calcula compatibilidad y se avisa.
11. Filtros imposibles (presupuesto 10 y horas 1): resultado vacío y mensaje M1.
12. Empate: dos países con la misma compatibilidad se ordenan por criterios 4-5 y luego por coste.
13. País con SIN DATO (p. ej. Túnez en coste_diario): no se descarta por F1 y su afinidad en precio cuenta 3.
14. peso_playa 5 + clima frio: se muestra el aviso del conflicto C1.
15. Misma entrada dos veces: mismo resultado (determinismo).

### 9. Entregables
Código organizado como en el punto 1, un `README.md` en español con: descripción, arquitectura (interfaz, base de hechos, base de conocimiento, motor, explicación), cómo ejecutar, cómo editar knowledge.json, y las limitaciones del punto 6. No incluyas claves ni contraseñas.

Antes de escribir código, resume en 10 líneas cómo vas a organizar los módulos y espera mi confirmación solo si algo del prompt es ambiguo; si no lo es, continúa.
