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
    avisosSistema.push(
      `Regla D2: Hay ${preguntasRestriccionSinResponder.length} pregunta(s) de restricción sin responder. Los filtros correspondientes no se han aplicado.`
    );
  }

  // PASO 1: EVALUACIÓN DE FILTROS ELIMINATORIOS (F1 - F7, F10)
  const descartadosMap = new Map<number, DescartePais>();
  const reglasSuperadasMap = new Map<number, string[]>();
  const reglasIncumplidasPorPais = new Map<number, ReglaIncumplidaMargen[]>();

  // Contabilizador de descartes por regla para sugerencia M1
  const conteoDescartesPorRegla = new Map<
    string,
    { regla: Regla; criterio?: string; total: number }
  >();

  const reglasFiltro = kb.reglas.filter(
    (r) => r.tipo === 'filtro' || r.tipo === 'filtro_por_criterio'
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
  // - Si al menos un país cumple todos los filtros, se muestran esos países sin ningún aviso de error.
  // - Si ninguno los cumple, o quedan menos de 3, se completa hasta 3 con los países que menos reglas de filtro incumplen.
  //   Se rotulan "Los que más se ajustan" y cada uno muestra el margen de cada regla incumplida.
  // - El aviso M1 ("Ningún país supera el 70 % de compatibilidad; estos son los que más se ajustan") solo aparece si el mejor país mostrado tiene compatibilidad < 70 %.
  // - Nunca una pantalla vacía.
  let paisesMostrados: PaisEvaluado[] = [];
  const paisesAjusteAproximado: PaisEvaluado[] = [];

  if (paisesCumplen.length >= 3) {
    // Caso 1: 3 o más países cumplen todos los filtros
    paisesMostrados = [...paisesCumplen];
  } else if (paisesCumplen.length > 0 && paisesCumplen.length < 3) {
    // Caso 2: entre 1 y 2 países cumplen todo -> completar hasta 3 con los que menos reglas incumplen
    paisesMostrados = [...paisesCumplen];
    const faltan = 3 - paisesCumplen.length;
    const candidatosAproximados = paisesNoCumplen.slice(0, faltan);

    for (const cand of candidatosAproximados) {
      cand.esAjusteAproximado = true;
      paisesAjusteAproximado.push(cand);
      paisesMostrados.push(cand);
    }
  } else {
    // Caso 3: Ningún país cumple todos los filtros (0 países cumplen)
    // Se completa hasta al menos 3 con los que menos reglas incumplen
    const minReglas = paisesNoCumplen[0]?.reglasIncumplidas.length ?? 0;
    // Tomamos al menos 3, o todos los que empatan con el mínimo de reglas incumplidas
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

  // Comprobar la compatibilidad del MEJOR país mostrado (máxima afinidad entre los mostrados)
  const mejorCompatibilidad = Math.max(0, ...paisesMostrados.map((p) => p.compatibilidad ?? 0));

  // Aviso M1: Solo si el mejor país mostrado tiene compatibilidad < 70%
  let avisoM1Activo = false;
  let mensajeM1: string | undefined;
  let sugerenciaRelajacion: SugerenciaRelajacion | undefined;

  // Buscar el filtro que más países descartó para propuesta de relajación
  let maxDescartes = -1;
  let mejorCandidatoFiltro: { regla: Regla; criterio?: string; total: number } | null = null;

  for (const item of conteoDescartesPorRegla.values()) {
    if (item.total > maxDescartes) {
      maxDescartes = item.total;
      mejorCandidatoFiltro = item;
    }
  }

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

  if (mejorCompatibilidad < 70) {
    avisoM1Activo = true;
    mensajeM1 = 'Ningún país supera el 70 % de compatibilidad; estos son los que más se ajustan.';
    avisosSistema.push(mensajeM1);
  }

  // PASO 4: CONFLICTOS (Reglas tipo "conflicto")
  const reglasConflicto = kb.reglas.filter((r) => r.tipo === 'conflicto');
  for (const r of reglasConflicto) {
    const condiciones = r.si || [];
    if (condiciones.length > 0) {
      const seDispara = condiciones.every((cond) =>
        evaluarCondicion(cond, null, hechos)
      );
      if (seDispara && r.entonces?.mensaje) {
        conflictos.push({
          reglaId: r.id,
          nombre: r.nombre,
          mensaje: r.entonces.mensaje,
        });

        logReglas.push({
          reglaId: r.id,
          reglaNombre: r.nombre,
          paisNombre: 'Global',
          resultado: 'aviso',
          detalle: r.entonces.mensaje,
        });
      }
    }
  }

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
    preguntasRestriccionSinResponder,
  };
}
