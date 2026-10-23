# Akinator de viajes: sistema experto de recomendación de países

Sistema experto que recomienda un país de viaje entre 40 candidatos. Pregunta restricciones y preferencias, descarta los países incompatibles mediante reglas y ordena el resto por compatibilidad, explicando cada decisión con datos y fuentes.

Trabajo de la Unidad 5 (Modelos de IA), especialidad de IA y Big Data, CEBANC.

## Acceso

- Aplicación publicada (Google AI Studio): **PENDIENTE: enlace público de la aplicación**
- Memoria del proyecto: **PENDIENTE: enlace de la memoria**

## Destinatarios

Personas residentes en España que planean un viaje turístico corto (menos de 90 días) y aún no saben el destino.

## Ejemplo de uso

1. Pulsa "Iniciar cuestionario personalizado" y responde las 18 preguntas: 10 de restricción y 8 de preferencia en escala de 1 a 5.
2. Ejemplo: presupuesto 120 €/día, 7 días, julio, vuelo máximo 5 h, viaje en pareja, trámite máximo 1 (autorización electrónica), no acepta riesgo alto, clima cálido, playa 5.
3. El sistema muestra los tres primeros países con su porcentaje de compatibilidad, el dato que justifica cada criterio y los países descartados con la regla que los eliminó. Si ningún país cumple todos los filtros, nunca deja la pantalla vacía: muestra "Los que más se ajustan", con el margen de cada regla incumplida, y la regla M1 avisa cuando la compatibilidad del mejor queda baja.

## Componentes

| N.º | Componente | Dónde está |
| --- | --- | --- |
| 1 | Interfaz | `src/ui/` |
| 2 | Base de hechos | Estado de la sesión en memoria del navegador (`src/App.tsx`) |
| 3 | Motor de inferencia | `src/engine/` |
| 4 | Base de conocimiento | `public/knowledge.json`, cargada por `src/data/knowledgeLoader.ts` |
| 5 | Módulo de explicación | `src/explain/` |

Diagrama: `docs/diagrama_componentes.png` (también en SVG).

Almacenamiento: el conocimiento es un fichero JSON de este repositorio y la sesión vive en memoria. No hay base de datos, servidor ni claves de API. El motor es determinista y no llama a ningún modelo de IA.

## Funciones adicionales

- **Comparador de destinos.** En la pantalla de resultados se marcan 2 o 3 países y se abre una comparativa cara a cara: compatibilidad global, coste diario, horas de vuelo, seguridad, requisitos de entrada, restricciones incumplidas, afinidad en los 8 criterios y gráfico de clima del mes elegido.
- **Simulador de sensibilidad ("¿Qué pasaría si...?").** En la pantalla de resultados permite mover el presupuesto diario, el límite de horas de vuelo, el mes de viaje y el peso de cada uno de los 8 criterios (de 0, que lo ignora, a 5). Las recomendaciones y los porcentajes se recalculan al momento y se pueden restablecer las respuestas originales.

La aplicación también incluye la vista de países descartados, la traza de reglas disparadas por el motor y una ventana de explicación detallada por país.

## Tecnologías

React 19 y TypeScript, empaquetado con Vite y estilos con Tailwind CSS. El proyecto se generó con Google AI Studio (modo Build) y se versiona en GitHub.

Por qué TypeScript y no Python:

- Google AI Studio publica aplicaciones React y TypeScript que se ejecutan sin servidor propio.
- El motor es determinista y corre entero en el navegador, sin llamadas a ninguna API.
- El conocimiento está en un JSON independiente del lenguaje, así que el motor no depende de cómo se generó.
- Python solo se usa fuera de la aplicación, en `data/cargar_conocimiento.py`, para generar ese JSON a partir de la plantilla de datos.

## Conocimiento

`public/knowledge.json` contiene 40 países con 11 atributos (coste diario, horas de vuelo, requisito de entrada, seguridad, sanitarios, patrimonio cultural UNESCO, naturaleza UNESCO, gastronomía UNESCO, inglés, moneda euro y playa) y el clima mensual. Cada dato tiene valor, fuente, fecha de consulta (2026-10-19) y calidad: verificado, estimado o SIN DATO.

Los 8 criterios de preferencia son playa, cultura, naturaleza, gastronomía, precio, seguridad, inglés y clima.

Fuentes: Budget Your Trip, Ministerio de Asuntos Exteriores, Global Peace Index 2026, UNESCO, EF English Proficiency Index 2025, Banco Mundial (Climate Change Knowledge Portal) y la lista de países del euro de la UE. Detalle y limitaciones en la memoria, secciones 5 y 13.

## Reglas

18 reglas:

| Tipo | Reglas |
| --- | --- |
| Filtros eliminatorios (8) | F1 a F7 y F10 |
| Puntuación (2) | P1 y P2 (ajuste de clima del mes) |
| Conflicto (3) | C1 a C3 |
| Sistema (5) | D1, D2, M1, M2 y M3 |

Las reglas están en `data/reglas.json` y se copian a `public/knowledge.json`.

Puntuación: `compatibilidad = suma(peso x afinidad) / suma(5 x peso) x 100`, con peso de 1 a 5 y afinidad de 1 a 5 (quintiles entre los 40 países o mapa fijo). Un 5 en una preferencia se trata como requisito (F10): se descarta el país si su afinidad en ese criterio es menor que 4. Un dato SIN DATO cuenta con afinidad 3 y no descarta el país. Los empates se resuelven con M3: más criterios con afinidad 4 o 5 y, después, menor coste diario.

## Pruebas

La ruta `#/tests` de la aplicación ejecuta 15 casos reproducibles más el caso 11b, definidos en `src/engine/tests.ts`:

| N.º | Caso |
| --- | --- |
| 1 | Presupuesto 40 €/día |
| 2 | Horas máximas de vuelo 3 |
| 3 | Trámite máximo 0 |
| 4 | No acepta vacunas recomendadas |
| 5 | No acepta riesgo alto |
| 6 | Viaje con niños |
| 7 | Clima con peso 5 (F10) |
| 8 | Lluvia y ajuste P2 |
| 9 | Playa con peso 5 |
| 10 | Todos los pesos a 0 |
| 11 | Filtros imposibles (10 € y 1 h) |
| 11b | Ningún país cumple todo pero el mejor tiene compatibilidad alta: sin aviso M1 |
| 12 | Desempate |
| 13 | País con SIN DATO (coste diario de Túnez) |
| 14 | Playa 5 y clima frío: conflicto C1 |
| 15 | Determinismo: la misma entrada produce la misma salida |

La lista con entrada y resultado esperado está en la memoria, sección 10.

## Limitaciones

- Datos consultados el 2026-10-19; los requisitos de entrada y sanitarios pueden cambiar.
- Seguridad: umbrales propios sobre el Global Peace Index, que mide conflicto y violencia, no riesgo turístico.
- Naturaleza y gastronomía miden reconocimientos de la UNESCO, no toda la oferta del país.
- Horas de vuelo: cálculo sin escalas. Clima: media nacional.
- 8 datos de 440 están en SIN DATO.

## Ejecución en local

Requiere Node.js. La aplicación no necesita variables de entorno ni claves.

```bash
npm install
npm run dev
```

La aplicación queda en `http://localhost:3000`. Las pruebas se abren en `http://localhost:3000/#/tests`.

Otros comandos:

- `npm run lint`: comprobación de tipos con TypeScript.
- `npm run build`: compilación para producción en `dist/`.
- `npm run preview`: sirve la versión compilada.

## Cómo regenerar el conocimiento

Requiere Python 3 y `openpyxl`. Desde la carpeta `data/`:

```bash
pip install openpyxl
python cargar_conocimiento.py plantilla_datos_40_paises.xlsx knowledge_completo.json
```

El script lee también `reglas.json` y `preguntas.json` de la misma carpeta. `plantilla_datos_40_paises.xlsx` es la tabla de datos con fuentes y `knowledge_completo.json` es la versión completa. `public/knowledge.json` es una versión reducida, sin los metadatos de método de cada dato, que es la que lee la aplicación.

## Estructura

```
public/knowledge.json   base de conocimiento que lee la aplicación
src/
  data/                 tipos y carga de knowledge.json
  engine/               motor de inferencia, evaluador de condiciones y pruebas
  explain/              explicación de cada recomendación y descarte
  ui/                   pantallas y componentes de React
  App.tsx               estado de la sesión y navegación por rutas (#/tests, #/rules...)
data/                   datos de partida, reglas, preguntas y scripts de Python
docs/                   diagrama de componentes y prompt usado en AI Studio
```
