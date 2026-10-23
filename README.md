# Akinator de Viajes — Sistema Experto de Recomendación de Destinos

Sistema experto determinista ejecutado íntegramente en el navegador web que recomienda el país ideal para viajar entre 40 candidatos mundiales basándose en las restricciones y preferencias del usuario.

---

## 1. Descripción general

"Akinator de Viajes" implementa un motor de inferencia clásico determinista en TypeScript. A través de un cuestionario paso a paso, el sistema recopila hechos del usuario, evalúa filtros eliminatorios rígidos (presupuesto diario, horas de vuelo, visados y requisitos de entrada, vacunas, seguridad y clima mensual), pondera la afinidad en 8 dimensiones clave y desempata de forma estricta.

Todo el razonamiento se realiza en memoria en el cliente sin realizar ninguna llamada a APIs externas ni modelos de lenguaje, garantizando respuestas 100% reproducibles, privadas y con trazabilidad completa.

---

## 2. Arquitectura del Sistema

El proyecto sigue una separación estricta de responsabilidades en capas modulares:

```
src/
├── data/                    # Acceso a la base de conocimiento y definiciones de tipos
│   ├── types.ts             # Esquemas de tipos TypeScript (Pais, Regla, Criterio, Hechos)
│   └── knowledgeLoader.ts   # Carga y almacenamiento en caché de knowledge.json
├── engine/                  # Motor de inferencia determinista (independiente de React)
│   ├── types.ts             # Tipos de resultados de evaluación, logs y desgloses
│   ├── evaluator.ts         # Resolución de rutas (pais.*, hecho.*), operadores y plantillas
│   ├── inference.ts         # Pasos 1 a 5 del ciclo de inferencia del sistema experto
│   └── tests.ts             # Banco automatizado de 15 pruebas de verificación
├── explain/                 # Módulo de explicación y justificación
│   └── explainer.ts         # Aportaciones numéricas, datos reales con unidades y fuentes
├── ui/                      # Componentes visuales desacoplados en React y Tailwind CSS
│   ├── Navbar.tsx           # Navegación, versión de base de conocimiento y contador en vivo
│   ├── Footer.tsx           # Pie de página y aviso obligatorio de limitaciones
│   ├── WelcomeScreen.tsx    # Pantalla de bienvenida con perfiles rápidos predefinidos
│   ├── QuestionWizard.tsx   # Flujo guiado pregunta a pregunta (tipo Akinator)
│   ├── ResultsView.tsx      # Top 3, gráfico de barras, comparador, simulador y exportación
│   ├── SensitivitySimulator.tsx # Simulador de análisis "¿Y si...?" en tiempo real
│   ├── DestinationComparator.tsx # Comparador cara a cara (2-3 destinos) con matriz de ventajas
│   ├── ClimateChart.tsx     # Gráfico visual térmico y pluviométrico de 12 meses
│   ├── ExplainModal.tsx     # Modal "Ver por qué" con desglose de cálculo, reglas y clima
│   ├── DiscardedCountriesView.tsx # Buscador de descartes agrupados por regla
│   ├── RulesLogView.tsx     # Registro cronológico de ejecución de reglas
│   ├── TestsView.tsx        # Interfaz de ejecución de las 16 pruebas en `#/tests`
│   └── QualityBadge.tsx     # Insignias de calidad (verificado, estimado, SIN DATO)
├── App.tsx                  # Enrutador en memoria y orquestador del estado
└── main.tsx                 # Entrada de la aplicación React
```

### Componentes de la Arquitectura:

1. **Base de Conocimiento (`public/knowledge.json`):**
   - 40 países con atributos normalizados (`coste_diario`, `horas_vuelo`, `entrada_espanoles`, `seguridad`, `sanitarios`, `patrimonio_cultural`, `naturaleza`, `gastronomia`, `ingles`, `moneda_euro`, `playa`) y series climáticas mensuales (temperatura y precipitación).
   - 8 criterios con metodologías de quintiles o mapeo fijo.
   - Reglas de inferencia de tipo filtro (`F1`–`F9`), filtro por criterio (`F10`), puntuación (`P1`), conflictos (`C1`–`C3`) y sistema (`D1`, `D2`, `M1`, `M2`, `M3`).

2. **Base de Hechos (`hecho`):**
   - Objeto en memoria que contiene las respuestas a restricciones (`presupuesto_diario`, `dias`, `mes`, `horas_max`, `companeros`, `max_tramite`, `acepta_vacunas`, `acepta_riesgo`, `clima`, `tolera_lluvia`) y pesos de afinidad (`peso_playa`, ..., `peso_ingles` del 1 al 5, donde "Me da igual" o pregunta omitida = 0).

3. **Motor de Inferencia (`engine/inference.ts`):**
   - **Modo Flexible (por defecto):** En lugar de descartar drásticamente un país excelente cuando una sola restricción no encaja (por ejemplo, querer 22 °C en abril cuando el destino tiene 17.5 °C, o un vuelo de 9 h cuando se pedían 8 h), el motor calcula un porcentaje global de compatibilidad (0-100%). Identifica y etiqueta con precisión qué opciones elegidas no estarán disponibles (`discrepancias`), penalizando de forma ponderada la puntuación sin eliminar el destino.
   - **Umbral Mínimo Configurable (60% - 70%):** Solo cuando ningún destino del catálogo alcance este umbral de compatibilidad global, el sistema notificará que no se ha encontrado ningún destino adecuado, ofreciendo alternativas cercanas y botones de ajuste rápido.
   - **Modo Estricto (conmutable en UI):** Mantiene la evaluación eliminatoria binaria tradicional donde cualquier condición no satisfecha descarta el país de inmediato.
   - **Paso 1: Filtros y discrepancias:** Evalúa las reglas F1–F10. En modo estricto descarta; en modo flexible genera advertencias explicativas y deducciones proporcionales.
   - **Paso 2: Puntuación ponderada:** Aplica la fórmula `suma(peso * afinidad) / suma(5 * peso) * 100` y combina el factor de restricciones.
   - **Paso 3: Ordenación jerárquica y desempates:** Orden por compatibilidad descendente, luego por más criterios con afinidad 4-5, menor número de discrepancias y menor coste diario.
   - **Paso 4: Detección de conflictos:** Evalúa avisos como `C1`, `C2` y `C3`.
   - **Paso 5: Casos límite:** Gestión de avisos M1 y M2 con sugerencias inteligentes de relajación.

4. **Módulo de Explicación (`explain/explainer.ts`):**
   - Genera la trazabilidad completa: puntos obtenidos frente al máximo posible, valor del atributo medido con su unidad real (€/día, horas, sitios UNESCO), desglose explícito de opciones no disponibles / discrepancias con advertencias ámbar, regla de inferencia y metadatos de calidad del dato (verificado, estimado, SIN DATO) con enlaces a fuentes oficiales y fecha de consulta.

---

## 3. Cómo ejecutar la aplicación

### Requisitos previos:
- Node.js (versión 18 o superior)
- npm

### Pasos:
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo en el puerto 3000:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador:
   - Aplicación principal: `http://localhost:3000/`
   - Banco de pruebas unitarias: `http://localhost:3000/#/tests`

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 4. Cómo editar y extender `knowledge.json`

El archivo de conocimiento se ubica en `public/knowledge.json`. No hay valores hardcodeados en la aplicación; todo se lee dinámicamente de este fichero.

### Añadir o modificar un país:
En el array `"paises"`, añade un objeto con la siguiente estructura:
```json
{
  "id": 41,
  "nombre": "Nombre del País",
  "zona": "Europa",
  "subzona": "Europa Occidental",
  "nivel_tramite": 0,
  "atributos": {
    "coste_diario": { "valor": 120.0, "fuente": "https://...", "fecha": "2026-10-19", "calidad": "estimado", "obs": null },
    "horas_vuelo": { "valor": 3.0, "fuente": "Cálculo propio", "fecha": "2026-10-19", "calidad": "estimado", "obs": null },
    "entrada_espanoles": { "valor": "Sin trámite previo", "fuente": "https://...", "fecha": "2026-10-19", "calidad": "verificado", "obs": null },
    "seguridad": { "valor": "Bajo riesgo", "fuente": "GPI", "fecha": "2026-10-19", "calidad": "estimado", "obs": null },
    "sanitarios": { "valor": "Ninguno obligatorio", "fuente": "MAEC", "fecha": "2026-10-19", "calidad": "verificado", "obs": null },
    "patrimonio_cultural": { "valor": 10.0, "fuente": "UNESCO", "fecha": "2026-10-19", "calidad": "verificado", "obs": null },
    "naturaleza": { "valor": 2.0, "fuente": "UNESCO", "fecha": "2026-10-19", "calidad": "verificado", "obs": null },
    "gastronomia": { "valor": 1.0, "fuente": "UNESCO", "fecha": "2026-10-19", "calidad": "estimado", "obs": null },
    "ingles": { "valor": "Alto", "fuente": "EF EPI", "fecha": "2026-10-19", "calidad": "estimado", "obs": null },
    "moneda_euro": { "valor": "Sí", "fuente": "UE", "fecha": "2026-10-19", "calidad": "verificado", "obs": null },
    "playa": { "valor": "Sí", "fuente": "Criterio propio", "fecha": "2026-10-19", "calidad": "estimado", "obs": null }
  },
  "clima": {
    "temperatura": [10.0, 11.0, 13.0, 15.0, 18.0, 22.0, 25.0, 25.0, 21.0, 17.0, 13.0, 10.0],
    "precipitacion": [60.0, 50.0, 45.0, 40.0, 30.0, 15.0, 5.0, 8.0, 30.0, 60.0, 70.0, 65.0],
    "fuente": "Banco Mundial",
    "fecha": "2026-10-19"
  },
  "afinidad": {
    "playa": 5,
    "cultura": 4,
    "naturaleza": 3,
    "gastronomia": 4,
    "precio": 3,
    "seguridad": 5,
    "ingles": 4
  }
}
```

### Añadir o editar reglas:
Puedes añadir reglas en el array `"reglas"`:
- `tipo: "filtro"`: usa la sintaxis `{ "izq": "pais.atributo", "op": ">", "der": "hecho.propiedad" }`.
- `tipo: "filtro_por_criterio"`: itera sobre `"para_cada": ["playa", ...]` reemplazando `{criterio}`.
- `tipo: "conflicto"`: emite advertencias contextuales sin descartar países.

---

## 5. Limitaciones y fuentes de información

> **Aviso importante sobre los datos:**
>
> *Datos consultados el 2026-10-19. Los requisitos de entrada y sanitarios pueden cambiar. Seguridad = Global Peace Index (umbral propio). Naturaleza y gastronomía = reconocimientos UNESCO, no miden toda la oferta.*

1. **Requisitos consulares y sanitarios:** La información proviene de las fichas del Ministerio de Asuntos Exteriores y Cooperación (MAEC) y Sanidad Exterior con fecha de corte de octubre de 2026. Los viajeros deben verificar los requisitos oficiales antes de viajar.
2. **Índice de seguridad:** Basado en el Global Peace Index (GPI) 2026 con asignación de umbrales cuantitativos a categorías cualitativas (Bajo riesgo, Riesgo medio, Riesgo alto).
3. **Cultura, naturaleza y gastronomía:** Se miden a través de bienes y reservas inscritas en la Lista de Patrimonio Mundial y la Red de Ciudades Creativas de la UNESCO, sirviendo como métrica objetiva y verificable, aunque no representan la totalidad de la oferta turística local.
