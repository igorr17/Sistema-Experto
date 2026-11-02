# Anexo: Conversación de Diseño y Registro del Uso Crítico de la IA

- **Proyecto**: Akinator de viajes (Sistema Experto de Recomendación de Países)
- **Módulo**: Modelos de Inteligencia Artificial (MIA) · Unidad 5
- **Alumno**: Igor Gómez
- **Centro**: CEBANC

---

## 1. Conversación Inicial de Diseño para Dar Forma al Proyecto

### Petición de partida (Prompt semilla)
> **Usuario**:
> *"Actúa como una especie de sistema experto para ayudarme a dar forma al desarrollo de mi sistema experto. Hazme preguntas para concretar el problema, los usuarios, el alcance, el conocimiento necesario y las decisiones de diseño. Detecta vacíos y contradicciones y ayúdame a justificar las decisiones antes de desarrollar."*

### Intercambio y Toma de Decisiones

**IA**: *"Para estructurar tu sistema experto sin caer en la trampa de un simple chatbot probabilístico, necesito que definamos los cimientos. Te formulo las siguientes 5 preguntas clave:*
1. *¿Cuál es el problema exacto a resolver y quién es el usuario objetivo?*
2. *¿Cómo evitarás que el sistema dependa de un LLM en tiempo de ejecución?*
3. *¿Qué tamaño tendrá la base de conocimiento y de dónde provendrán los datos?*
4. *¿Cómo resolverás los casos en los que ningún destino cumpla el 100 % de los filtros?*
5. *¿Qué haremos cuando existan datos ausentes o incompletos (SIN DATO)?"*

**Respuesta del Alumno y Decisiones Resultantes**:
- **Sobre el problema y usuarios**: El problema es la parálisis por saturación de opciones al planear un viaje. El usuario objetivo son residentes en España que buscan un viaje turístico de menos de 90 días y no saben a dónde ir.
- **Sobre el motor de inferencia**: El motor será 100 % determinista en TypeScript ejecutado en el navegador, sin llamadas a APIs externas ni a Gemini en tiempo de inferencia. Esto garantiza reproducibilidad exacta y coste cero de cómputo.
- **Sobre la base de conocimiento**: 40 países seleccionados estratégicamente de 4 regiones (Europa, América, Asia-Pacífico, África y Oriente Medio). Se recopilan 11 atributos cuantitativos y cualitativos con fuentes oficiales (UNESCO, Budget Your Trip, Ministerio de Asuntos Exteriores, Global Peace Index 2026, Banco Mundial).
- **Sobre casos sin coincidencia 100 %**: Se diseñan las metarreglas M1 y M2. En lugar de dejar la pantalla vacía ("No hay resultados"), se activa una relajación heurística que muestra "Los que más se ajustan" ordenados por menor cantidad de reglas incumplidas, detallando el margen exacto de incumplimiento y avisando con M1 si la compatibilidad cae por debajo del 70 %.
- **Sobre datos incompletos (SIN DATO)**: Regla de sistema D1. Un dato ausente (como el coste en Túnez) nunca descarta injustamente al país; se le asigna afinidad neutra (3) y se muestra la etiqueta explícita "SIN DATO" en la interfaz.

---

## 2. Registro del Uso de Herramientas de IA y Uso Crítico

### Herramientas Utilizadas y su Aporte

| Herramienta | Uso Concreto en el Proyecto | Aporte Justificado |
|---|---|---|
| **ChatGPT / Claude** | Ideación de estructura de reglas, contraste de fuentes y generación de casos de prueba límite. | Permitió contrastar qué ontología de reglas (Filtros F, Ponderaciones P, Conflictos C, Deducciones D, Metarreglas M) modelaba mejor el razonamiento humano. |
| **Google AI Studio (Modo Build)** | Prototipado rápido de la aplicación web reactiva en TypeScript y Vite. | Aceleró la construcción de la interfaz gráfica y los componentes de visualización sin alterar la lógica determinista del motor. |
| **NotebookLM** | Asistencia en la síntesis y estructuración del guion para el vídeo demostrativo de < 4 minutos. | Ayudó a condensar los puntos clave de la memoria sin sustituir en ningún caso la locución oral propia del alumno. |

---

## 3. Registro de Repreguntas, Errores Detectados y Correcciones

1. **Corrección de la afinidad al 100 %**:
   - *Consulta*: ¿Por qué un país con 100 % de condiciones cumplidas mostraba una afinidad del 83.1 %?
   - *Detección*: Se identificó que la fórmula de afinidad global ponderaba atributos con pesos diferentes y que los empates no estaban normalizados con el máximo teórico de 5 puntos por criterio ponderado.
   - *Corrección*: Se ajustó la fórmula a `suma(peso_i * afinidad_i) / suma(5 * peso_i) * 100`.

2. **Fijación del Umbral M1 al 70 % y eliminación de conmutador**:
   - *Consulta y decisión*: Simplificar la experiencia eliminando conmutadores ambiguos de umbral flexible/estricto.
   - *Implementación*: Regla M1 fija en 70 % en `src/engine/inference.ts`.

3. **Inmutabilidad de Reglas Base frente a Reglas Personalizadas**:
   - *Error detectado*: Al permitir añadir reglas personalizadas, un ID repetido (ej. `F1`) sobrescribía la regla canónica de presupuesto y rompía las pruebas unitarias 1 y 11b.
   - *Verificación*: Se ejecutó el suite de pruebas en `src/engine/tests.ts`.
   - *Solución*: Creación de `REGLAS_BASE_IDS` inmutable y namespacing de reglas en `src/data/customRules.ts`. Resultado: 16 de 16 pruebas superadas.

---

## 4. Métodos de Verificación de Resultados
- **Banco de Pruebas Unitarias Automatizadas**: Suite ejecutable en `#/tests` con 16 casos formales que cubren filtros numéricos, categóricos, clima, lluvias, empates y casos límite.
- **Validación Manual de Destinos**: Contraste manual de las recomendaciones frente a guías turísticas y fichas del MAEC.
- **Verificación de Tipos y Compilación**: `tsc --noEmit` y `vite build` en cada iteración del desarrollo.
