/**
 * Evaluador de condiciones y resolución de rutas para el motor de inferencia.
 */
import { Condicion, HechosUsuario, Pais } from '../data/types';

/**
 * Calcula dinámicamente la afinidad de clima según la Regla P2.
 */
export function calcularAfinidadClima(pais: Pais, hecho: HechosUsuario): number | null {
  if (!hecho.clima || hecho.clima === 'indiferente') {
    return null;
  }
  const mes = hecho.mes;
  if (!mes || typeof mes !== 'number' || mes < 1 || mes > 12) {
    return null;
  }
  if (!pais.clima || !pais.clima.temperatura || pais.clima.temperatura[mes - 1] === undefined) {
    return null;
  }

  const temp = pais.clima.temperatura[mes - 1];
  let d = 0;

  if (hecho.clima === 'calido') {
    if (temp >= 22) d = 0;
    else d = 22 - temp;
  } else if (hecho.clima === 'templado') {
    if (temp >= 12 && temp <= 22) d = 0;
    else if (temp < 12) d = 12 - temp;
    else d = temp - 22;
  } else if (hecho.clima === 'frio') {
    if (temp < 12) d = 0;
    else d = temp - 12;
  }

  let afinidad = 1;
  if (d === 0) afinidad = 5;
  else if (d <= 3) afinidad = 4;
  else if (d <= 6) afinidad = 3;
  else if (d <= 10) afinidad = 2;
  else afinidad = 1;

  if (hecho.tolera_lluvia === 'No' && pais.clima.precipitacion && pais.clima.precipitacion[mes - 1] > 150) {
    afinidad = Math.max(1, afinidad - 1);
  }

  return afinidad;
}

/**
 * Resuelve una ruta o valor literal.
 * Las rutas comienzan por 'pais.' o 'hecho.'.
 */
export function resolverValor(
  exp: any,
  pais: Pais | null,
  hecho: HechosUsuario,
  criterioContexto?: string
): any {
  if (typeof exp !== 'string') {
    return exp;
  }

  // Si incluye reemplazo de criterio e.g. {criterio}
  let path = exp;
  if (criterioContexto && path.includes('{criterio}')) {
    path = path.replace(/{criterio}/g, criterioContexto);
  }

  // Hechos del usuario
  if (path.startsWith('hecho.')) {
    const hechoKey = path.substring('hecho.'.length);
    const val = hecho[hechoKey];
    if (val === undefined || val === null || val === '') {
      return null;
    }
    return val;
  }

  // Atributos o propiedades del país
  if (path.startsWith('pais.') && pais) {
    const subpath = path.substring('pais.'.length);

    // Excepciones directas
    if (subpath === 'nivel_tramite') {
      return pais.nivel_tramite;
    }
    if (subpath === 'nombre') {
      return pais.nombre;
    }
    if (subpath.startsWith('afinidad.')) {
      const crit = subpath.substring('afinidad.'.length);
      if (crit === 'clima') {
        return calcularAfinidadClima(pais, hecho);
      }
      const af = pais.afinidad[crit];
      return af !== undefined ? af : null;
    }

    // Clima dinámico por mes
    if (subpath.startsWith('clima.temperatura[hecho.mes]')) {
      const mes = hecho.mes;
      if (!mes || typeof mes !== 'number' || mes < 1 || mes > 12) {
        return null;
      }
      if (!pais.clima || !pais.clima.temperatura || !pais.clima.temperatura[mes - 1]) {
        return null;
      }
      return pais.clima.temperatura[mes - 1];
    }

    if (subpath.startsWith('clima.precipitacion[hecho.mes]')) {
      const mes = hecho.mes;
      if (!mes || typeof mes !== 'number' || mes < 1 || mes > 12) {
        return null;
      }
      if (!pais.clima || !pais.clima.precipitacion || pais.clima.precipitacion[mes - 1] === undefined) {
        return null;
      }
      return pais.clima.precipitacion[mes - 1];
    }

    // Atributos generales dentro de pais.atributos[subpath]
    const attr = pais.atributos[subpath];
    if (attr) {
      return attr.valor;
    }

    return null;
  }

  // Si no es ruta, devuelve el valor literal
  return exp;
}

/**
 * Evalúa una condición unitaria {izq, op, der}.
 * Si un valor requerido es null / undefined o un hecho no respondido, la condición es falsa.
 * Si una condición numérica compara con 'SIN DATO', es falsa (no se puede comparar numéricamente).
 */
export function evaluarCondicion(
  cond: Condicion,
  pais: Pais | null,
  hecho: HechosUsuario,
  criterioContexto?: string
): boolean {
  let izqVal = resolverValor(cond.izq, pais, hecho, criterioContexto);
  let derVal = resolverValor(cond.der, pais, hecho, criterioContexto);

  // Si alguno de los valores necesarios es null o undefined, la condición no se cumple
  if (izqVal === null || izqVal === undefined || derVal === null || derVal === undefined) {
    return false;
  }

  // Operaciones numéricas no aplican si algún valor es 'SIN DATO'
  const esOpNumerica = ['>', '<', '>=', '<=', 'fuera_de'].includes(cond.op);
  if (esOpNumerica && (izqVal === 'SIN DATO' || derVal === 'SIN DATO')) {
    return false;
  }

  // Si izq o der es numérico como string, parsearlo si la contraparte es número
  if (typeof izqVal === 'string' && typeof derVal === 'number' && !isNaN(Number(izqVal))) {
    izqVal = Number(izqVal);
  } else if (typeof derVal === 'string' && typeof izqVal === 'number' && !isNaN(Number(derVal))) {
    derVal = Number(derVal);
  }

  switch (cond.op) {
    case '>':
      return izqVal > derVal;
    case '<':
      return izqVal < derVal;
    case '>=':
      return izqVal >= derVal;
    case '<=':
      return izqVal <= derVal;
    case '==':
      return izqVal === derVal;
    case '!=':
      return izqVal !== derVal;
    case 'fuera_de': {
      // derVal debe ser un array [min, max]
      if (Array.isArray(derVal) && derVal.length === 2) {
        const [min, max] = derVal;
        return izqVal < min || izqVal > max;
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Sustituye las plantillas en un string e.g. "{pais.coste_diario}" o "{hecho.dias}".
 */
export function interpolarPlantilla(
  plantilla: string,
  pais: Pais,
  hecho: HechosUsuario,
  criterioContexto?: string
): string {
  if (!plantilla) return '';

  return plantilla.replace(/{([^}]+)}/g, (match, expr) => {
    let cleanExpr = expr.trim();
    if (criterioContexto && cleanExpr === 'criterio') {
      return criterioContexto;
    }
    if (criterioContexto && cleanExpr.includes('{criterio}')) {
      cleanExpr = cleanExpr.replace(/{criterio}/g, criterioContexto);
    }

    const valor = resolverValor(cleanExpr, pais, hecho, criterioContexto);
    if (valor === null || valor === undefined) {
      return 'dato no disponible';
    }
    return String(valor);
  });
}
