/**
 * Motor de inferencia determinista del sistema experto de viajes.
 * Implementa filtros eliminatorios, compatibilidad ponderada P1, ajuste climático P2
 * y gestión de casos límite M1 y M2 (completar hasta 3 con los que menos reglas incumplen).
 */
import { HechosUsuario, KnowledgeBase, Pais, Regla } from '../data/types';
import {
  calcularAfinidadClima,
  evaluarCondicion,
  interpolarPlantilla,
} from './evaluator';
import {
  AporteCriterio,
  ConflictoDetectado,
  DescartePais,
  LogReglaDisparada,
  PaisEvaluado,
  ReglaIncumplidaMargen,
  ResultadoInferencia,
  SugerenciaRelajacion,
} from './types';

/**
 * Constante del umbral M1 fijo al 70 % según especificación.
 */
export const UMBRAL_M1_FIJO = 70;

/**
 * Genera el margen legible de incumplimiento para una regla de filtro.
 */
function calcularMargenRegla(regla: Regla, pais: Pais, hechos: HechosUsuario, criterio?: string): string {
  if (regla.id === 'F1') {
    const coste = pais.atributos.coste_diario?.valor;
    return `coste ${coste} € frente a tu presupuesto de ${hechos.presupuesto_diario} €`;
  }
  if (regla.id === 'F2') {
    const vuelo = pais.atributos.horas_vuelo?.valor;
    return `vuelo de ${vuelo} h frente a tu máximo de ${hechos.horas_max} h`;
  }
  if (regla.id === 'F3') {
    const vuelo = pais.atributos.horas_vuelo?.valor;
    return `vuelo de ${vuelo} h para un viaje de solo ${hechos.dias} días`;
  }
  if (regla.id === 'F4') {
    const tramite = pais.atributos.entrada_espanoles?.valor;
    return `trámite exigido: ${tramite} (nivel ${pais.nivel_tramite}) frente a tu máximo aceptado (nivel ${hechos.max_tramite})`;
  }
  if (regla.id === 'F5') {
    return `nivel de seguridad 'Riesgo alto' y no aceptas riesgo`;
  }
  if (regla.id === 'F6') {
    return `recomienda vacunas o profilaxis por riesgo endémico y no las aceptas`;
  }
  if (regla.id === 'F7') {
    const seg = pais.atributos.seguridad?.valor;
    return `destino con nivel '${seg}' viajando con niños (requiere 'Bajo riesgo')`;
  }
  if (regla.id === 'F10' && criterio) {
    let af: number | null = null;
    if (criterio === 'clima') {
      af = calcularAfinidadClima(pais, hechos);
    } else {
      af = pais.afinidad[criterio] ?? null;
    }
    return `afinidad en ${criterio} de ${af ?? 'SIN DATO'}/5 frente a tu requisito de 4+/5`;
  }
  return regla.entonces?.motivo || 'No cumple las restricciones';
}

export function ejecutarInferencia(
  kb: KnowledgeBase,
  hechos: HechosUsuario,
  _opciones?: any
): ResultadoInferencia {
  const logReglas: LogReglaDisparada[] = [];
  const avisosSistema: string[] = [];
  const conflictos: ConflictoDetectado[] = [];

  // PASO 0: DEDUCCIONES INICIALES (Reglas D1 y D2)
  if (hechos.mes) {
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mesNum = Number(hechos.mes);
    const nombreMes = nombresMeses[mesNum - 1] || `Mes ${mesNum}`;
    logReglas.push({
      reglaId: 'D1',
      reglaNombre: 'Deducción de estacionalidad y mes del viaje',
      paisNombre: 'Proceso Global',
      resultado: 'deducida',
      detalle: `Mes de viaje fijado en ${nombreMes}. Se deducen los perfiles climáticos mensuales de cada destino y se habilita la regla P2.`,
      tipo: 'deduccion',
      paso: '1. Deducción',
      esReglaSeguida: true,
    });
  }

  // Mapeo rápido de preguntas de restricción para regla D2
  const preguntasRestriccion = kb.preguntas.filter((q) => q.bloque === 'restriccion');
  const preguntasRestriccionSinResponder: string[] = [];

  for (const q of preguntasRestriccion) {
    const val = hechos[q.hecho];
    if (val === undefined || val === null || val === '') {
      preguntasRestriccionSinResponder.push(q.texto);
    }
  }

  if (preguntasRestriccionSinResponder.length > 0) {
    const msgD2 = `Regla D2: Hay ${preguntasRestriccionSinResponder.length} pregunta(s) de restricción sin responder. Los filtros correspondientes no se han aplicado.`;
    avisosSistema.push(msgD2);
    logReglas.push({
      reglaId: 'D2',
      reglaNombre: 'Tratamiento de restricciones omitidas',
      paisNombre: 'Proceso Global',
      resultado: 'aplicada',
      detalle: msgD2,
      tipo: 'deduccion',
      paso: '1. Deducción',
      esReglaSeguida: true,
    });
  } else {
    logReglas.push({
      reglaId: 'D2',
      reglaNombre: 'Tratamiento de restricciones completas',
      paisNombre: 'Proceso Global',
      resultado: 'aplicada',
      detalle: 'Todas las restricciones de viaje fueron respondidas; se aplican los filtros con validación estricta.',
      tipo: 'deduccion',
      paso: '1. Deducción',
      esReglaSeguida: true,
    });
  }

  // PASO 1: EVALUACIÓN DE FILTROS ELIMINATORIOS (F1 - F7, F10 y filtros personalizados)
  const descartadosMap = new Map<number, DescartePais>();
  const reglasSuperadasMap = new Map<number, string[]>();
  const reglasIncumplidasPorPais = new Map<number, ReglaIncumplidaMargen[]>();

  // Contabilizador de descartes por regla para sugerencia M1
  const conteoDescartesPorRegla = new Map<
    string,
    { regla: Regla; criterio?: string; total: number }
  >();

  // Filtrar solo reglas activas (si no tiene activa, por defecto es true)
  const reglasFiltro = kb.reglas.filter(
    (r) => (r.tipo === 'filtro' || r.tipo === 'filtro_por_criterio') && r.activa !== false
  );

  for (const pais of kb.paises) {
    reglasSuperadasMap.set(pais.id, []);
    reglasIncumplidasPorPais.set(pais.id, []);

    for (const regla of reglasFiltro) {
      if (regla.tipo === 'filtro') {
        const condiciones = regla.si || [];
        if (condiciones.length === 0) continue;

        const todasCumplidas = condiciones.every((cond) =>
          evaluarCondicion(cond, pais, hechos)
        );

        if (todasCumplidas) {
          const motivoTexto = interpolarPlantilla(
            regla.entonces?.motivo || 'No cumple las restricciones.',
            pais,
            hechos
          );
          const margen = calcularMargenRegla(regla, pais, hechos);

          if (!descartadosMap.has(pais.id)) {
            descartadosMap.set(pais.id, {
              pais,
              motivos: [],
            });
          }
          descartadosMap.get(pais.id)!.motivos.push({
            reglaId: regla.id,
            reglaNombre: regla.nombre,
            motivo: motivoTexto,
          });

          reglasIncumplidasPorPais.get(pais.id)!.push({
            reglaId: regla.id,
            reglaNombre: regla.nombre,
            margen,
          });

          const prev = conteoDescartesPorRegla.get(regla.id) || {
            regla,
            total: 0,
          };
          prev.total += 1;
          conteoDescartesPorRegla.set(regla.id, prev);

          logReglas.push({
            reglaId: regla.id,
            reglaNombre: regla.nombre,
            paisNombre: pais.nombre,
            resultado: 'descartado',
            detalle: motivoTexto,
            tipo: regla.esPersonalizada ? 'personalizada' : 'filtro',
            paso: '2. Filtros de restricción',
            esReglaSeguida: false,
          });
        } else {
          reglasSuperadasMap.get(pais.id)!.push(regla.id);
        }
      } else if (regla.tipo === 'filtro_por_criterio') {
        const listaCriterios = regla.para_cada || [];
        const condiciones = regla.si || [];
        let reglaF10Descarto = false;

        for (const crit of listaCriterios) {
          const todasCumplidas = condiciones.every((cond) =>
            evaluarCondicion(cond, pais, hechos, crit)
          );

          if (todasCumplidas) {
            reglaF10Descarto = true;
            const motivoTexto = interpolarPlantilla(
              regla.entonces?.motivo || 'No cumple el requisito imprescindible.',
              pais,
              hechos,
              crit
            );
            const margen = calcularMargenRegla(regla, pais, hechos, crit);

            if (!descartadosMap.has(pais.id)) {
              descartadosMap.set(pais.id, {
                pais,
                motivos: [],
              });
            }
            descartadosMap.get(pais.id)!.motivos.push({
              reglaId: `${regla.id}_${crit}`,
              reglaNombre: `${regla.nombre} (${crit})`,
              motivo: motivoTexto,
            });

            reglasIncumplidasPorPais.get(pais.id)!.push({
              reglaId: `${regla.id}_${crit}`,
              reglaNombre: `${regla.nombre} (${crit})`,
              margen,
            });

            const reglaKey = `${regla.id}_${crit}`;
            const prev = conteoDescartesPorRegla.get(reglaKey) || {
              regla,
              criterio: crit,
              total: 0,
            };
            prev.total += 1;
            conteoDescartesPorRegla.set(reglaKey, prev);

            logReglas.push({
              reglaId: `${regla.id} [${crit}]`,
              reglaNombre: `${regla.nombre} (${crit})`,
              paisNombre: pais.nombre,
              resultado: 'descartado',
              detalle: motivoTexto,
              tipo: 'filtro',
              paso: '2. Filtros de restricción',
              esReglaSeguida: false,
            });
          }
        }

        if (!reglaF10Descarto) {
          reglasSuperadasMap.get(pais.id)!.push(regla.id);
        }
      }
    }
  }

  const paisesDescartados = Array.from(descartadosMap.values());

  // PASO 2: PUNTUACIÓN PONDERADA (Regla P1 y P2)
  const reglaP1 = kb.reglas.find((r) => r.id === 'P1');
  const afinidadDefaultSinDato = reglaP1?.afinidad_sin_dato ?? 3;

  // Comprobar suma de pesos de preferencia
  let sumaPesos = 0;
  for (const crit of kb.criterios) {
    if (crit.id === 'clima' && hechos.clima === 'indiferente') {
      // Clima indiferente = no cuenta
      continue;
    }
    const p = Number(hechos[`peso_${crit.id}`] || 0);
    if (p > 0) {
      sumaPesos += p;
    }
  }

  const sinPreferenciasIndicadas = sumaPesos === 0;
  if (sinPreferenciasIndicadas) {
    avisosSistema.push(
      'No has indicado ninguna preferencia de peso (> 0). Los países válidos se muestran ordenados alfabéticamente.'
    );
  }

  // Evaluar puntuación P1 para TODOS los países de la base de conocimiento
  const evaluadosTodos: PaisEvaluado[] = [];

  for (const pais of kb.paises) {
    let sumaPonderada = 0;
    let sumaMaximo = 0;
    let criteriosAltosCount = 0;
    const desglose: AporteCriterio[] = [];

    for (const crit of kb.criterios) {
      // Si el clima es indiferente, el criterio clima no cuenta (peso 0)
      let peso = 0;
      if (crit.id === 'clima') {
        if (hechos.clima && hechos.clima !== 'indiferente') {
          peso = Number(hechos.peso_clima || 0);
        }
      } else {
        peso = Number(hechos[`peso_${crit.id}`] || 0);
      }

      let afinidadEfectiva = 3;
      let esSinDato = false;

      if (crit.id === 'clima') {
        const afClima = calcularAfinidadClima(pais, hechos);
        if (afClima !== null) {
          afinidadEfectiva = afClima;
        } else {
          afinidadEfectiva = afinidadDefaultSinDato;
          esSinDato = true;
        }
      } else {
        const afVal = pais.afinidad[crit.id];
        if (afVal === null || afVal === undefined) {
          afinidadEfectiva = afinidadDefaultSinDato;
          esSinDato = true;
        } else {
          afinidadEfectiva = afVal;
        }
      }

      if (afinidadEfectiva >= 4) {
        criteriosAltosCount += 1;
      }

      const puntos = peso * afinidadEfectiva;
      const maximo = 5 * peso;

      if (peso > 0) {
        sumaPonderada += puntos;
        sumaMaximo += maximo;
      }

      desglose.push({
        criterioId: crit.id,
        peso,
        afinidad: afinidadEfectiva,
        esSinDato,
        puntosAportados: puntos,
        maximoPosible: maximo,
        porcentajeAporte: maximo > 0 ? (puntos / maximo) * 100 : 0,
        atributoClave: crit.atributo,
        atributoInfo: pais.atributos[crit.atributo],
      });
    }

    let compatibilidad: number | null = null;
    if (!sinPreferenciasIndicadas && sumaMaximo > 0) {
      compatibilidad = Math.round((sumaPonderada / sumaMaximo) * 1000) / 10;
    }

    const reglasIncumplidas = reglasIncumplidasPorPais.get(pais.id) || [];
    const cumpleTodosLosFiltros = reglasIncumplidas.length === 0;

    evaluadosTodos.push({
      pais,
      compatibilidad,
      cumpleTodosLosFiltros,
      esAjusteAproximado: false, // se actualizará en Paso 5 si procede
      reglasIncumplidas,
      desgloseCriterios: desglose,
      criteriosAltosCount,
      reglasSuperadas: reglasSuperadasMap.get(pais.id) || [],
    });
  }

  // Log de Regla P1 (Ponderación multicriterio aplicada)
  logReglas.push({
    reglaId: 'P1',
    reglaNombre: 'Puntuación y afinidad multicriterio',
    paisNombre: 'Todos los destinos',
    resultado: 'aplicada',
    detalle: sinPreferenciasIndicadas
      ? 'Sin preferencias ponderadas (>0): se ordenan alfabéticamente.'
      : 'Compatibilidad ponderada calculada con la fórmula P1: suma(peso × afinidad) / suma(5 × peso).',
    tipo: 'puntuacion',
    paso: '3. Puntuación y afinidad',
    esReglaSeguida: true,
  });

  // Log de Regla P2 (Ajuste climático estacional aplicado si procede)
  if (hechos.clima && hechos.clima !== 'indiferente' && hechos.mes) {
    logReglas.push({
      reglaId: 'P2',
      reglaNombre: 'Ajuste dinámico de afinidad climática',
      paisNombre: 'Destinos evaluados',
      resultado: 'aplicada',
      detalle: `Afinidad climática calculada según distancia térmica para preferencia "${hechos.clima}" en el mes ${hechos.mes}${hechos.tolera_lluvia === 'No' ? ' (con penalización si precipitación > 150 mm)' : ''}.`,
      tipo: 'puntuacion',
      paso: '3. Puntuación y afinidad',
      esReglaSeguida: true,
    });
  }

  // PASO 3: ORDENACIÓN Y DESEMPATES (Regla M3)
  const ordenarPaises = (a: PaisEvaluado, b: PaisEvaluado): number => {
    if (sinPreferenciasIndicadas || a.compatibilidad === null || b.compatibilidad === null) {
      return a.pais.nombre.localeCompare(b.pais.nombre, 'es');
    }
    // 1. Mayor compatibilidad
    if (b.compatibilidad !== a.compatibilidad) {
      return b.compatibilidad - a.compatibilidad;
    }
    // 2. Más criterios con afinidad 4 o 5
    if (b.criteriosAltosCount !== a.criteriosAltosCount) {
      return b.criteriosAltosCount - a.criteriosAltosCount;
    }
    // 3. Menor coste diario
    const costeA = Number(a.pais.atributos.coste_diario?.valor) || 999999;
    const costeB = Number(b.pais.atributos.coste_diario?.valor) || 999999;
    if (costeA !== costeB) {
      return costeA - costeB;
    }
    return a.pais.nombre.localeCompare(b.pais.nombre, 'es');
  };

  // Separar los que cumplen todos los filtros y los que no
  const paisesCumplen = evaluadosTodos
    .filter((p) => p.cumpleTodosLosFiltros)
    .sort(ordenarPaises);

  // Ordenar los que no cumplen: menos reglas incumplidas primero, luego compatibilidad, etc.
  const paisesNoCumplen = evaluadosTodos
    .filter((p) => !p.cumpleTodosLosFiltros)
    .sort((a, b) => {
      // 1. Menos reglas incumplidas
      if (a.reglasIncumplidas.length !== b.reglasIncumplidas.length) {
        return a.reglasIncumplidas.length - b.reglasIncumplidas.length;
      }
      return ordenarPaises(a, b);
    });

  // PASO 5: CASOS LÍMITE (REGLAS M1 Y M2)
  let paisesMostrados: PaisEvaluado[] = [];
  const paisesAjusteAproximado: PaisEvaluado[] = [];

  if (paisesCumplen.length >= 3) {
    paisesMostrados = [...paisesCumplen];
  } else if (paisesCumplen.length > 0 && paisesCumplen.length < 3) {
    paisesMostrados = [...paisesCumplen];
    const faltan = 3 - paisesCumplen.length;
    const candidatosAproximados = paisesNoCumplen.slice(0, faltan);

    for (const cand of candidatosAproximados) {
      cand.esAjusteAproximado = true;
      paisesAjusteAproximado.push(cand);
      paisesMostrados.push(cand);
    }
  } else {
    const minReglas = paisesNoCumplen[0]?.reglasIncumplidas.length ?? 0;
    const candidatos = paisesNoCumplen.slice(
      0,
      Math.max(3, paisesNoCumplen.filter((p) => p.reglasIncumplidas.length === minReglas).length)
    );

    for (const cand of candidatos) {
      cand.esAjusteAproximado = true;
      paisesAjusteAproximado.push(cand);
      paisesMostrados.push(cand);
    }
  }

  // Garantía absoluta: nunca una pantalla vacía
  if (paisesMostrados.length === 0 && kb.paises.length > 0) {
    const fallback = evaluadosTodos.slice(0, 3);
    for (const f of fallback) {
      f.esAjusteAproximado = true;
      paisesMostrados.push(f);
    }
  }

  // Registrar en la trazabilidad las reglas de filtro que SÍ superaron los destinos recomendados
  for (const item of paisesMostrados.slice(0, 3)) {
    for (const rId of item.reglasSuperadas) {
      const reg = kb.reglas.find((r) => r.id === rId);
      if (reg) {
        logReglas.push({
          reglaId: reg.id,
          reglaNombre: reg.nombre,
          paisNombre: item.pais.nombre,
          resultado: 'superado',
          detalle: `Filtro superado con éxito: ${reg.nombre}. Cumple los requisitos exigidos por el usuario.`,
          tipo: reg.esPersonalizada ? 'personalizada' : 'filtro',
          paso: '2. Filtros superados',
          esReglaSeguida: true,
        });
      }
    }
  }

  // Comprobar la compatibilidad del MEJOR país mostrado
  const mejorCompatibilidad = Math.max(0, ...paisesMostrados.map((p) => p.compatibilidad ?? 0));

  // Buscar el filtro que más países descartó para propuesta de relajación
  let maxDescartes = -1;
  let mejorCandidatoFiltro: { regla: Regla; criterio?: string; total: number } | null = null;

  for (const item of conteoDescartesPorRegla.values()) {
    if (item.total > maxDescartes) {
      maxDescartes = item.total;
      mejorCandidatoFiltro = item;
    }
  }

  let sugerenciaRelajacion: SugerenciaRelajacion | undefined;
  if (mejorCandidatoFiltro) {
    const { regla, criterio, total } = mejorCandidatoFiltro;
    let sugerenciaTexto = '';
    if (regla.id === 'F10' && criterio) {
      sugerenciaTexto = `El filtro más exigente fue el requisito de "${criterio.toUpperCase()}" (peso 5), que descartó a ${total} países. Te sugerimos bajar su peso de 5 a 4 para ampliar las opciones.`;
    } else {
      sugerenciaTexto = `El filtro que descartó a más países fue "${regla.nombre}" (${total} países descartados). Te sugerimos relajar esta condición para encontrar más destinos.`;
    }
    sugerenciaRelajacion = {
      reglaId: regla.id,
      reglaNombre: regla.nombre,
      criterioId: criterio,
      conteoDescartes: total,
      sugerenciaTexto,
    };
  }

  let avisoM1Activo = false;
  let mensajeM1: string | undefined;

  if (mejorCompatibilidad < UMBRAL_M1_FIJO) {
    avisoM1Activo = true;
    mensajeM1 = `Ningún país supera el ${UMBRAL_M1_FIJO} % de compatibilidad; estos son los que más se ajustan.`;
    avisosSistema.push(mensajeM1);
  }

  // Log de Meta-regla M1
  logReglas.push({
    reglaId: 'M1',
    reglaNombre: 'Control de umbral mínimo de compatibilidad (70%)',
    paisNombre: 'Recomendaciones',
    resultado: 'aplicada',
    detalle: avisoM1Activo
      ? `Ningún destino supera el ${UMBRAL_M1_FIJO}% (máxima afinidad: ${mejorCompatibilidad}%). Regla M1 activada: se muestran los más cercanos y sugerencia de relajación.`
      : `El mejor destino alcanza el ${mejorCompatibilidad}% >= ${UMBRAL_M1_FIJO}%. Recomendación sólida confirmada sin aviso M1.`,
    tipo: 'meta',
    paso: '4. Meta-reglas del sistema',
    esReglaSeguida: true,
  });

  // Log de Meta-regla M2 (Garantía de Top 3)
  logReglas.push({
    reglaId: 'M2',
    reglaNombre: 'Garantía de Top 3 (Completado flexible)',
    paisNombre: 'Recomendaciones',
    resultado: 'aplicada',
    detalle: paisesCumplen.length >= 3
      ? `${paisesCumplen.length} destinos cumplen el 100% de los filtros obligatorios (Top 3 estricto garantizado).`
      : `Menos de 3 destinos cumplen todos los filtros (${paisesCumplen.length}). M2 completó hasta 3 con ${paisesAjusteAproximado.length} destinos aproximados minimizando penalizaciones.`,
    tipo: 'meta',
    paso: '4. Meta-reglas del sistema',
    esReglaSeguida: true,
  });

  // Log de Meta-regla M3 (Resolución de desempates y ordenación)
  logReglas.push({
    reglaId: 'M3',
    reglaNombre: 'Resolución de ordenación y desempates',
    paisNombre: 'Recomendaciones',
    resultado: 'aplicada',
    detalle: 'Ordenación por compatibilidad %, número de afinidades destacadas (4-5) y menor coste diario.',
    tipo: 'meta',
    paso: '4. Meta-reglas del sistema',
    esReglaSeguida: true,
  });

  // PASO 4: CONFLICTOS (Reglas tipo "conflicto" activas)
  const reglasConflicto = kb.reglas.filter((r) => r.tipo === 'conflicto' && r.activa !== false);
  for (const r of reglasConflicto) {
    const condiciones = r.si || [];
    if (condiciones.length > 0) {
      const seDispara = condiciones.every((cond) =>
        evaluarCondicion(cond, null, hechos)
      );
      if (seDispara && (r.entonces?.mensaje || r.entonces?.motivo)) {
        const msg = r.entonces.mensaje || r.entonces.motivo || 'Conflicto detectado en tus hechos';
        conflictos.push({
          reglaId: r.id,
          nombre: r.nombre,
          mensaje: msg,
        });

        logReglas.push({
          reglaId: r.id,
          reglaNombre: r.nombre,
          paisNombre: 'Global',
          resultado: 'aviso',
          detalle: msg,
          tipo: r.esPersonalizada ? 'personalizada' : 'conflicto',
          paso: '5. Conflictos',
          esReglaSeguida: true,
        });
      }
    }
  }

  // Filtrar las reglas que el sistema SÍ siguió en el proceso de inferencia
  const reglasSeguidas = logReglas.filter((r) => r.esReglaSeguida === true);

  return {
    paisesMostrados,
    paisesValidos: paisesMostrados,
    paisesCumplenTodos: paisesCumplen,
    paisesAjusteAproximado,
    paisesDescartados,
    todosLosPaisesOriginales: kb.paises,
    conflictos,
    avisosSistema,
    avisoM1Activo,
    mensajeM1,
    sugerenciaRelajacion,
    sinPreferenciasIndicadas,
    logReglas,
    reglasSeguidas,
    preguntasRestriccionSinResponder,
  };
}
