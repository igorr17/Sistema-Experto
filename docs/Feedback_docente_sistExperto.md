# Recopilación Íntegra del Feedback del Docente y Análisis con IA

- **Módulo**: Modelos de Inteligencia Artificial (MIA)
- **Unidad**: Unidad 5 · Sistemas Expertos
- **Trabajo**: Desarrollo de un sistema experto funcional y público ("Akinator de viajes")
- **Alumno**: Igor Gómez
- **Profesor**: Borja Fernández Antelo (CEBANC)

---

## 1. Registro Íntegro y Contextualizado de Comentarios del Docente

| N.º | Módulo | Unidad | Trabajo | Fecha y Contexto | Comentario Original Íntegro del Docente | Estado |
|:---:|:---:|:---:|:---:|:---|:---|:---:|
| **1** | MIA | Unidad 5 | Akinator de viajes | 28/10/2026<br>Revisión intermedia de prototipo | *"Para que sea un sistema experto faltan estas cosas: que se vean las reglas que sí sigue y no solo las que descarta en el proceso, y luego faltaría agregar que el cliente tenga un botón o una opción de poder añadir nuevas reglas."* | **Aplicado** |
| **2** | MIA | Unidad 5 | Akinator de viajes | 30/10/2026<br>Aclaración sobre reglas vs preguntas | *"Pero que deje añadir nuevas preguntas al cliente, no solo reglas complejas en crudo; por ejemplo: si viaja con mascotas o preguntas adicionales, y que el menú sea desplegable para móvil."* | **Aplicado** |
| **3** | MIA | Unidad 5 | Akinator de viajes | 01/11/2026<br>Control de calidad y pruebas | *"Revisa si alguna regla personalizada o añadida colisiona con las reglas base o con el banco de pruebas (evitar que un ID duplicado rompa las pruebas 1 y 11b)."* | **Aplicado** |

---

## 2. Petición a la IA (Prompt de Análisis de Pautas Generales)

> **Prompt enviado a la IA**:
> 
> *"Actúa como un auditor senior de sistemas expertos e ingeniería de software pedagógica. Analiza íntegramente los 3 comentarios y orientaciones que he recibido de mi profesor (Borja Fernández Antelo) durante el desarrollo de la aplicación 'Akinator de viajes' (Unidad 5 de Modelos de Inteligencia Artificial en CEBANC):*
> *1. Visibilidad de reglas afirmativas ('reglas que sí sigue') además de los descartes.*
> *2. Capacidad de extensión en caliente por el usuario (añadir reglas y preguntas personalizadas) y responsividad móvil.*
> *3. Prevención de colisiones en la base de conocimiento para proteger las pruebas automatizadas (pruebas 1 y 11b).*
> 
> *Extrae las pautas generales de diseño que se derivan de este feedback, clasifícalas y compáralas con las mejores prácticas de la disciplina. Para cada pauta, relaciónala con el comentario de origen y propón la mejora comprobable exacta en código o el descarte justificado."*

---

## 3. Análisis de Pautas Generales y Valoración Crítica del Alumno

### Pauta 1: Trazabilidad y Transparencia del Razonamiento (Explicabilidad Bidireccional)
- **Comentario de origen**: Comentario 1 (*"que se vean las reglas que sí sigue..."*).
- **Análisis de la IA**: Un sistema experto clásico no debe limitarse a una caja negra que filtra por eliminación. El módulo de explicación (Explanation Facility) debe demostrar la cadena deductiva completa: deducción de hechos derivados (D1, D2), superación de filtros (F1-F7, F10), puntuación ponderada (P1, P2) y metarreglas de desempate y mitigación (M1, M2, M3).
- **Valoración propia del alumno**: Coincido plenamente. Inicialmente la aplicación solo explicaba los motivos del descarte en una pestaña secundaria ("Países descartados"), lo que hacía que el usuario no entendiera por qué el Top 3 había sido seleccionado.
- **Mejora comprobable aplicada**:
  - Se implementó la vista `#/rules` con 3 pestañas especializadas: **"Reglas que SÍ sigue el proceso"**, **"Base de Conocimiento de Reglas"** e **"Historial de descartes / Filtros"**.
  - En la pantalla de resultados se integró un panel interactivo con el recorrido de inferencia paso a paso (`src/ui/RulesLogView.tsx` y `src/explain/explanation.ts`).

---

### Pauta 2: Mantenibilidad y Adquisición Dinámica de Conocimiento
- **Comentario de origen**: Comentario 1 y Comentario 2 (*"botón de poder añadir nuevas reglas"*, *"que deje añadir nuevas preguntas al cliente... por ejemplo mascotas"*).
- **Análisis de la IA**: La arquitectura clásica de Buchanan y Shortliffe define la "Facilidad de Adquisición de Conocimiento" (Knowledge Acquisition Facility). Permitir que un usuario no técnico introduzca nuevas reglas y preguntas valida la separación estricta entre motor de inferencia (`engine/`) y base de conocimiento (`data/`).
- **Valoración propia del alumno**: La corrección fue muy acertada. Pedir reglas con sintaxis JSON cruda al usuario final era poco amigable. Separar "Añadir regla" (con constructor visual de condición y operador) y "Añadir pregunta" (con tipo de campo, opciones o escala 1-5) democratiza el uso del sistema.
- **Mejora comprobable aplicada**:
  - Modal accesible `AddRuleModal.tsx` para incorporar reglas de filtro o avisos de conflicto.
  - Modal interactivo `AddQuestionModal.tsx` con plantillas predefinidas (ej. mascotas, intolerancias, transporte).
  - Persistencia segura y aislada en `localStorage` mediante `src/data/customRules.ts` y `src/data/customQuestions.ts`, manteniendo el fichero base `public/knowledge.json` inmutable.

---

### Pauta 3: Integridad de la Base de Conocimiento y Aislamiento de Pruebas
- **Comentario de origen**: Comentario 3 (*"regla con ID repetido que rompe pruebas 1 y 11b"*).
- **Análisis de la IA**: El motor debe garantizar la idempotencia de las reglas canónicas (`F1-F7`, `F10`, `P1-P2`, `C1-C3`, `D1-D2`, `M1-M3`). Si una regla de usuario utiliza un ID reservado, puede sobrescribir o corromper la deducción base.
- **Valoración propia del alumno**: Detectamos que al permitir nombres arbitrarios, si un usuario ingresaba un ID como `F1`, se generaban dos reglas con la misma clave, alterando el filtro de presupuesto en los tests unitarios.
- **Mejora comprobable aplicada**:
  - Se creó la lista inmutable `REGLAS_BASE_IDS` en `src/data/customRules.ts`.
  - Validación en formulario para impedir IDs del sistema.
  - Namespacing automático (`R_CUSTOM_<id>_<timestamp>`).
  - En `src/engine/tests.ts`, la función `runTests()` aísla formalmente la ejecución sobre las reglas canónicas no personalizadas, garantizando un 100 % de pases (16 de 16).

---

### Pauta 4: Adaptabilidad a Entornos Móviles
- **Comentario de origen**: Comentario 2 (*"el menú que sea desplegable para cuando se abra en móvil"*).
- **Análisis de la IA**: La evaluación de un sistema experto en la web exige que la interfaz de recolección de hechos sea plenamente responsiva para no inducir a errores en pantallas pequeñas.
- **Valoración propia del alumno**: En móviles, la cabecera anterior colapsaba los botones de "¿Qué pasaría si...?", "Pruebas" y "Reglas".
- **Mejora comprobable aplicada**:
  - Implementación de menú hamburguesa responsivo con drawer animado en `src/App.tsx`.
