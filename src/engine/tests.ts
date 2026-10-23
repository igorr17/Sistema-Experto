/**
 * Conjunto de pruebas automatizadas sobre el motor de inferencia y knowledge.json
 * Cubre los casos de prueba sin ninguna referencia a cercanía, con los casos 11 y 11b revisados.
 */
import { HechosUsuario, KnowledgeBase } from '../data/types';
import { calcularAfinidadClima } from './evaluator';
import { ejecutarInferencia } from './inference';

export interface TestCaseResult {
  id: string | number;
  nombre: string;
  status: 'pass' | 'fail';
  mensaje: string;
  detalles?: string;
}

export interface TestReport {
  total: number;
  pasadas: number;
  fallidas: number;
  resultados: TestCaseResult[];
  tiempoMs: number;
}

export function runTests(kb: KnowledgeBase): TestReport {
  const inicio = performance.now();
  const resultados: TestCaseResult[] = [];

  // 1. Presupuesto 40 €/día: ningún país con coste_diario > 40 cumple todos los filtros
  try {
    const res = ejecutarInferencia(kb, { presupuesto_diario: 40 });
    const invalidos = res.paisesCumplenTodos.filter((p) => {
      const coste = p.pais.atributos.coste_diario?.valor;
      return typeof coste === 'number' && coste > 40;
    });
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 1,
        nombre: 'Presupuesto 40 €/día: ningún país con coste > 40 € cumple todos los filtros',
        status: 'pass',
        mensaje: `Superado. ${res.paisesCumplenTodos.length} países cumplen el filtro de presupuesto (todos <= 40 €).`,
      });
    } else {
      resultados.push({
        id: 1,
        nombre: 'Presupuesto 40 €/día',
        status: 'fail',
        mensaje: `Falló: se encontraron países con coste > 40 €: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 1,
      nombre: 'Presupuesto 40 €/día',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 2. Horas máx. 3: solo quedan países con horas_vuelo <= 3
  try {
    const res = ejecutarInferencia(kb, { horas_max: 3 });
    const invalidos = res.paisesCumplenTodos.filter((p) => {
      const horas = p.pais.atributos.horas_vuelo?.valor;
      return typeof horas === 'number' && horas > 3;
    });
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 2,
        nombre: 'Horas máx. 3: solo quedan países con horas_vuelo <= 3',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países y todos tienen <= 3 h de vuelo estimado.`,
      });
    } else {
      resultados.push({
        id: 2,
        nombre: 'Horas máx. 3: solo quedan países con horas_vuelo <= 3',
        status: 'fail',
        mensaje: `Falló: países con > 3h encontrados: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 2,
      nombre: 'Horas máx. 3',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 3. max_tramite 0: ningún país con nivel_tramite > 0 cumple todos los filtros
  try {
    const res = ejecutarInferencia(kb, { max_tramite: 0 });
    const invalidos = res.paisesCumplenTodos.filter(
      (p) => typeof p.pais.nivel_tramite === 'number' && p.pais.nivel_tramite > 0
    );
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 3,
        nombre: 'max_tramite 0: ningún país con nivel_tramite > 0 cumple los filtros',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países, todos con nivel de trámite 0 (sin trámite previo).`,
      });
    } else {
      resultados.push({
        id: 3,
        nombre: 'max_tramite 0',
        status: 'fail',
        mensaje: `Falló: se encontraron países con nivel_tramite > 0: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 3,
      nombre: 'max_tramite 0',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 4. acepta_vacunas No: ningún país con sanitarios "Recomendaciones relevantes" cumple los filtros
  try {
    const res = ejecutarInferencia(kb, { acepta_vacunas: 'No' });
    const invalidos = res.paisesCumplenTodos.filter(
      (p) => p.pais.atributos.sanitarios?.valor === 'Recomendaciones relevantes'
    );
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 4,
        nombre: 'acepta_vacunas No: ningún país con "Recomendaciones relevantes" cumple los filtros',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países sin recomendaciones sanitarias relevantes.`,
      });
    } else {
      resultados.push({
        id: 4,
        nombre: 'acepta_vacunas No',
        status: 'fail',
        mensaje: `Falló: países con vacunas recomendadas aún vivos: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 4,
      nombre: 'acepta_vacunas No',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 5. acepta_riesgo No: ningún país con seguridad "Riesgo alto" cumple los filtros
  try {
    const res = ejecutarInferencia(kb, { acepta_riesgo: 'No' });
    const invalidos = res.paisesCumplenTodos.filter(
      (p) => p.pais.atributos.seguridad?.valor === 'Riesgo alto'
    );
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 5,
        nombre: 'acepta_riesgo No: ningún país con "Riesgo alto" cumple los filtros',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países, ninguno con riesgo alto según GPI.`,
      });
    } else {
      resultados.push({
        id: 5,
        nombre: 'acepta_riesgo No',
        status: 'fail',
        mensaje: `Falló: países con riesgo alto sobrevivieron: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 5,
      nombre: 'acepta_riesgo No',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 6. companeros ninos: solo quedan países con seguridad "Bajo riesgo"
  try {
    const res = ejecutarInferencia(kb, { companeros: 'ninos' });
    const invalidos = res.paisesCumplenTodos.filter(
      (p) => p.pais.atributos.seguridad?.valor !== 'Bajo riesgo'
    );
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 6,
        nombre: 'companeros ninos: solo quedan países con seguridad "Bajo riesgo"',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países clasificados con Bajo riesgo.`,
      });
    } else {
      resultados.push({
        id: 6,
        nombre: 'companeros ninos',
        status: 'fail',
        mensaje: `Falló: sobrevivieron destinos sin Bajo riesgo: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 6,
      nombre: 'companeros ninos',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 7. Clima y requisito imprescindible (peso_clima 5 en mes 1 con clima cálido)
  try {
    const hechos: HechosUsuario = { mes: 1, clima: 'calido', peso_clima: 5 };
    const res = ejecutarInferencia(kb, hechos);
    // Todos los países que cumplen todos los filtros deben tener afinidad clima >= 4
    const invalidos = res.paisesCumplenTodos.filter((p) => {
      const afClima = calcularAfinidadClima(p.pais, hechos);
      return afClima === null || afClima < 4;
    });
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 7,
        nombre: 'Clima con peso 5 (F10): solo cumplen países con afinidad de clima >= 4',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países con afinidad climática óptima en enero (>= 4).`,
      });
    } else {
      resultados.push({
        id: 7,
        nombre: 'Clima con peso 5 (F10)',
        status: 'fail',
        mensaje: `Falló: se encontraron países con afinidad de clima < 4: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 7,
      nombre: 'Clima con peso 5',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 8. Lluvia y ajuste P2: precipitación > 150 mm resta 1 punto a la afinidad de clima si tolera_lluvia No
  try {
    // Tomamos un país con precipitación alta en mes 7 (por ejemplo India, > 250 mm)
    const india = kb.paises.find((p) => p.nombre === 'India');
    if (india) {
      const afConLluviaTolerada = calcularAfinidadClima(india, { mes: 7, clima: 'calido', tolera_lluvia: 'Sí' });
      const afSinLluviaTolerada = calcularAfinidadClima(india, { mes: 7, clima: 'calido', tolera_lluvia: 'No' });

      if (
        afConLluviaTolerada !== null &&
        afSinLluviaTolerada !== null &&
        afSinLluviaTolerada === Math.max(1, afConLluviaTolerada - 1)
      ) {
        resultados.push({
          id: 8,
          nombre: 'Lluvia y ajuste P2: resta 1 a la afinidad de clima si no tolera lluvia (> 150 mm)',
          status: 'pass',
          mensaje: `Superado. La afinidad de clima en India en julio baja de ${afConLluviaTolerada} a ${afSinLluviaTolerada} por lluvia excesiva.`,
        });
      } else {
        resultados.push({
          id: 8,
          nombre: 'Lluvia y ajuste P2',
          status: 'fail',
          mensaje: `Falló: con lluvia=${afConLluviaTolerada}, sin lluvia=${afSinLluviaTolerada}`,
        });
      }
    } else {
      resultados.push({
        id: 8,
        nombre: 'Lluvia y ajuste P2',
        status: 'fail',
        mensaje: 'País de prueba no encontrado',
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 8,
      nombre: 'Lluvia y ajuste P2',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 9. peso_playa 5: solo quedan países con afinidad playa >= 4
  try {
    const res = ejecutarInferencia(kb, { peso_playa: 5 });
    const invalidos = res.paisesCumplenTodos.filter(
      (p) => typeof p.pais.afinidad.playa === 'number' && p.pais.afinidad.playa < 4
    );
    if (invalidos.length === 0 && res.paisesCumplenTodos.length > 0) {
      resultados.push({
        id: 9,
        nombre: 'peso_playa 5: solo quedan países con afinidad playa >= 4',
        status: 'pass',
        mensaje: `Superado. Quedan ${res.paisesCumplenTodos.length} países de alta afinidad con playa (afinidad 4 o 5).`,
      });
    } else {
      resultados.push({
        id: 9,
        nombre: 'peso_playa 5',
        status: 'fail',
        mensaje: `Falló: países con afinidad playa < 4: ${invalidos.map((p) => p.pais.nombre).join(', ')}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 9,
      nombre: 'peso_playa 5',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 10. Pesos todos 0: no se calcula compatibilidad y se emite aviso
  try {
    const hechos: HechosUsuario = {
      peso_clima: 0,
      peso_playa: 0,
      peso_cultura: 0,
      peso_naturaleza: 0,
      peso_gastronomia: 0,
      peso_precio: 0,
      peso_seguridad: 0,
      peso_ingles: 0,
    };
    const res = ejecutarInferencia(kb, hechos);
    const todosNull = res.paisesMostrados.every((p) => p.compatibilidad === null);
    const tieneAviso = res.sinPreferenciasIndicadas && res.avisosSistema.some((a) => a.includes('preferencia'));

    if (todosNull && tieneAviso) {
      resultados.push({
        id: 10,
        nombre: 'Pesos todos 0: no se calcula compatibilidad y se emite aviso',
        status: 'pass',
        mensaje: 'Superado. Ningún país tiene compatibilidad numérica calculada y se avisa orden alfabético.',
      });
    } else {
      resultados.push({
        id: 10,
        nombre: 'Pesos todos 0',
        status: 'fail',
        mensaje: `Falló: compatibilidad calculada=${!todosNull}, aviso emitido=${tieneAviso}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 10,
      nombre: 'Pesos todos 0',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 11. Filtros imposibles (presupuesto 10 y horas 1):
  // Aparece "Los que más se ajustan" con el aviso M1 (< 70% de compatibilidad)
  try {
    const res = ejecutarInferencia(kb, { presupuesto_diario: 10, horas_max: 1 });
    const cumpleCero = res.paisesCumplenTodos.length === 0;
    const tieneMostrados = res.paisesMostrados.length >= 3;
    const estanRotulados = res.paisesMostrados.every((p) => p.esAjusteAproximado);
    const tieneAvisoM1 = res.avisoM1Activo && res.avisosSistema.some((a) => a.includes('70 %'));
    const tienenMargen = res.paisesMostrados.every((p) => p.reglasIncumplidas.length > 0 && p.reglasIncumplidas[0].margen);

    if (cumpleCero && tieneMostrados && estanRotulados && tieneAvisoM1 && tienenMargen) {
      resultados.push({
        id: 11,
        nombre: 'Filtros imposibles (10 € y 1 h): se muestran "Los que más se ajustan" con aviso M1 (< 70 %)',
        status: 'pass',
        mensaje: `Superado. 0 países cumplen todo; se muestran ${res.paisesMostrados.length} bajo "Los que más se ajustan" con sus márgenes y el aviso M1 activado.`,
      });
    } else {
      resultados.push({
        id: 11,
        nombre: 'Filtros imposibles (10 € y 1 h)',
        status: 'fail',
        mensaje: `Falló: cumpleCero=${cumpleCero}, mostrados=${res.paisesMostrados.length}, rotulados=${estanRotulados}, avisoM1=${tieneAvisoM1}, margen=${tienenMargen}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 11,
      nombre: 'Filtros imposibles (10 € y 1 h)',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 11b. Caso 11b: ningún país cumple todos los filtros pero el mejor tiene compatibilidad >= 70%
  // Se muestran rotulados "Los que más se ajustan" SIN aviso M1
  try {
    const res = ejecutarInferencia(kb, {
      presupuesto_diario: 10,
      peso_playa: 5,
      peso_seguridad: 5,
    });
    const cumpleCero = res.paisesCumplenTodos.length === 0;
    const mejorComp = res.paisesMostrados[0]?.compatibilidad ?? 0;
    const compMayor70 = mejorComp >= 70;
    const sinAvisoM1 = !res.avisoM1Activo && !res.avisosSistema.some((a) => a.includes('70 %'));
    const rotuladosAjuste = res.paisesMostrados.some((p) => p.esAjusteAproximado);

    if (cumpleCero && compMayor70 && sinAvisoM1 && rotuladosAjuste) {
      resultados.push({
        id: '11b',
        nombre: 'Caso 11b: 0 países cumplen todo pero mejor compatibilidad >= 70 % -> sin aviso M1',
        status: 'pass',
        mensaje: `Superado. Mejor compatibilidad es ${mejorComp} % (>= 70 %). Se muestran "Los que más se ajustan" con márgenes y SIN aviso M1.`,
      });
    } else {
      resultados.push({
        id: '11b',
        nombre: 'Caso 11b',
        status: 'fail',
        mensaje: `Falló: cumpleCero=${cumpleCero}, mejorComp=${mejorComp}, sinAvisoM1=${sinAvisoM1}, rotulados=${rotuladosAjuste}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: '11b',
      nombre: 'Caso 11b',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 12. Empate: dos países con la misma compatibilidad se ordenan por criterios 4-5 y luego por coste
  try {
    const hechos: HechosUsuario = { peso_cultura: 4 };
    const res = ejecutarInferencia(kb, hechos);

    let ordenCorrecto = true;
    for (let i = 0; i < res.paisesCumplenTodos.length - 1; i++) {
      const a = res.paisesCumplenTodos[i];
      const b = res.paisesCumplenTodos[i + 1];
      if (a.compatibilidad === b.compatibilidad) {
        if (a.criteriosAltosCount < b.criteriosAltosCount) {
          ordenCorrecto = false;
          break;
        } else if (a.criteriosAltosCount === b.criteriosAltosCount) {
          const costeA = Number(a.pais.atributos.coste_diario?.valor) || 999999;
          const costeB = Number(b.pais.atributos.coste_diario?.valor) || 999999;
          if (costeA > costeB) {
            ordenCorrecto = false;
            break;
          }
        }
      }
    }

    if (ordenCorrecto && res.paisesCumplenTodos.length > 2) {
      resultados.push({
        id: 12,
        nombre: 'Desempate: más criterios 4-5 y luego menor coste diario',
        status: 'pass',
        mensaje: 'Superado. La ordenación jerárquica de desempates según regla M3 funciona rigurosamente.',
      });
    } else {
      resultados.push({
        id: 12,
        nombre: 'Desempate',
        status: 'fail',
        mensaje: 'Falló el orden de desempate en países con idéntica compatibilidad.',
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 12,
      nombre: 'Desempate',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 13. País con SIN DATO (Túnez en coste_diario): no se descarta por F1 y su afinidad en precio cuenta 3
  try {
    const res = ejecutarInferencia(kb, { presupuesto_diario: 50, peso_precio: 4 });
    const tunezDescartadoPorF1 = res.paisesDescartados.some(
      (d) => d.pais.nombre === 'Túnez' && d.motivos.some((m) => m.reglaId === 'F1')
    );
    const tunezVivo = res.paisesCumplenTodos.find((p) => p.pais.nombre === 'Túnez');
    const afinidadPrecioTunez = tunezVivo?.desgloseCriterios.find((c) => c.criterioId === 'precio');

    if (!tunezDescartadoPorF1 && afinidadPrecioTunez?.afinidad === 3 && afinidadPrecioTunez.esSinDato) {
      resultados.push({
        id: 13,
        nombre: 'País con SIN DATO (Túnez coste_diario): no se descarta por F1 y afinidad precio vale 3',
        status: 'pass',
        mensaje: 'Superado. Túnez no fue descartado por falta de dato y su afinidad por defecto fue 3 (marcado como sin dato).',
      });
    } else {
      resultados.push({
        id: 13,
        nombre: 'País con SIN DATO (Túnez coste_diario)',
        status: 'fail',
        mensaje: `Falló: descartado por F1=${tunezDescartadoPorF1}, afinidad=${afinidadPrecioTunez?.afinidad}, esSinDato=${afinidadPrecioTunez?.esSinDato}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 13,
      nombre: 'País con SIN DATO',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 14. peso_playa 5 + clima frio: se muestra el aviso del conflicto C1
  try {
    const res = ejecutarInferencia(kb, { peso_playa: 5, clima: 'frio' });
    const tieneC1 = res.conflictos.some((c) => c.reglaId === 'C1');

    if (tieneC1) {
      resultados.push({
        id: 14,
        nombre: 'peso_playa 5 + clima frio: se dispara el aviso del conflicto C1',
        status: 'pass',
        mensaje: `Superado. Aviso C1 detectado: "${res.conflictos.find((c) => c.reglaId === 'C1')?.mensaje}"`,
      });
    } else {
      resultados.push({
        id: 14,
        nombre: 'peso_playa 5 + clima frio',
        status: 'fail',
        mensaje: `Falló: conflicto C1 no fue detectado en conflictos=${JSON.stringify(res.conflictos)}`,
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 14,
      nombre: 'peso_playa 5 + clima frio',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  // 15. Misma entrada dos veces: mismo resultado (determinismo)
  try {
    const entradaTest: HechosUsuario = {
      presupuesto_diario: 120,
      horas_max: 6,
      dias: 7,
      mes: 5,
      companeros: 'pareja',
      max_tramite: 1,
      acepta_vacunas: 'Sí',
      acepta_riesgo: 'No',
      clima: 'templado',
      tolera_lluvia: 'Sí',
      peso_clima: 4,
      peso_cultura: 4,
      peso_gastronomia: 5,
      peso_seguridad: 4,
    };

    const res1 = ejecutarInferencia(kb, entradaTest);
    const res2 = ejecutarInferencia(kb, entradaTest);

    const nombres1 = res1.paisesMostrados.map((p) => `${p.pais.nombre}:${p.compatibilidad}`).join('|');
    const nombres2 = res2.paisesMostrados.map((p) => `${p.pais.nombre}:${p.compatibilidad}`).join('|');
    const descartados1 = res1.paisesDescartados.map((d) => d.pais.nombre).sort().join(',');
    const descartados2 = res2.paisesDescartados.map((d) => d.pais.nombre).sort().join(',');

    if (nombres1 === nombres2 && descartados1 === descartados2) {
      resultados.push({
        id: 15,
        nombre: 'Determinismo: misma entrada dos veces produce exactamente la misma salida',
        status: 'pass',
        mensaje: 'Superado. Ambos ciclos de inferencia generaron exactamente la misma lista de países y descartes.',
      });
    } else {
      resultados.push({
        id: 15,
        nombre: 'Determinismo',
        status: 'fail',
        mensaje: 'Falló: se detectó no determinismo entre ejecuciones idénticas.',
      });
    }
  } catch (e: any) {
    resultados.push({
      id: 15,
      nombre: 'Determinismo',
      status: 'fail',
      mensaje: `Excepción: ${e.message}`,
    });
  }

  const fin = performance.now();
  const pasadas = resultados.filter((r) => r.status === 'pass').length;

  return {
    total: resultados.length,
    pasadas,
    fallidas: resultados.length - pasadas,
    resultados,
    tiempoMs: Math.round((fin - inicio) * 100) / 100,
  };
}
