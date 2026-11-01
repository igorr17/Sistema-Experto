/**
 * Módulo de persistencia y gestión de reglas personalizadas creadas por el cliente.
 * Se guardan en localStorage para persistencia y se inyectan en la Base de Conocimiento.
 * Protege estrictamente los IDs de las reglas base del sistema experto para que NUNCA sean pisadas.
 */
import { Regla } from './types';

const STORAGE_KEY = 'akinator_viajes_reglas_personalizadas';

export const REGLAS_BASE_IDS = new Set([
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10',
  'P1', 'P2', 'C1', 'C2', 'C3', 'D1', 'D2', 'M1', 'M2', 'M3'
]);

export function obtenerReglasPersonalizadas(): Regla[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filtrar y eliminar cualquier regla que colisione con las reglas base oficiales (F1-F7, F10, etc.)
      const validas: Regla[] = [];
      const idsVistos = new Set<string>();

      for (const r of parsed) {
        if (!r || !r.id || typeof r.id !== 'string') continue;
        const idNorm = r.id.trim().toUpperCase();
        // Si el ID colisiona con una regla base, es un duplicado que pisaría la base: se descarta
        if (REGLAS_BASE_IDS.has(idNorm)) continue;
        // Si ya hay una regla con ese ID, descartar el duplicado
        if (idsVistos.has(idNorm)) continue;

        idsVistos.add(idNorm);
        validas.push(r);
      }

      if (validas.length !== parsed.length) {
        guardarReglasPersonalizadas(validas);
      }
      return validas;
    }
  } catch (e) {
    console.error('Error cargando reglas personalizadas de localStorage:', e);
  }
  return [];
}

export function guardarReglasPersonalizadas(reglas: Regla[]): void {
  try {
    // Garantizar que ninguna regla base quede en el almacenamiento personalizado
    const idsVistos = new Set<string>();
    const limpias: Regla[] = [];

    for (const r of reglas) {
      if (!r || !r.id || typeof r.id !== 'string') continue;
      const idNorm = r.id.trim().toUpperCase();
      if (REGLAS_BASE_IDS.has(idNorm)) continue;
      if (idsVistos.has(idNorm)) continue;
      idsVistos.add(idNorm);
      limpias.push(r);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limpias));
  } catch (e) {
    console.error('Error guardando reglas personalizadas en localStorage:', e);
  }
}

export function agregarReglaPersonalizada(nuevaRegla: Regla): Regla[] {
  let reglaParaGuardar = { ...nuevaRegla };
  const idNorm = String(reglaParaGuardar.id || '').trim().toUpperCase();

  // Evitar terminantemente pisar una regla base: si coincide, forzar prefijo seguro y marca de tiempo
  if (REGLAS_BASE_IDS.has(idNorm)) {
    reglaParaGuardar.id = `R_CUSTOM_${reglaParaGuardar.id}_${Date.now()}`;
  }

  const actuales = obtenerReglasPersonalizadas();
  const index = actuales.findIndex(
    (r) => r.id.trim().toUpperCase() === reglaParaGuardar.id.trim().toUpperCase()
  );

  let actualizadas: Regla[];
  if (index >= 0) {
    // Si ya existe otra personalizada con el mismo ID, diferenciarla para evitar duplicados
    reglaParaGuardar.id = `${reglaParaGuardar.id}_${Date.now()}`;
    actualizadas = [...actuales, reglaParaGuardar];
  } else {
    actualizadas = [...actuales, reglaParaGuardar];
  }
  guardarReglasPersonalizadas(actualizadas);
  return actualizadas;
}

export function eliminarReglaPersonalizada(reglaId: string): Regla[] {
  const actuales = obtenerReglasPersonalizadas();
  const idNorm = reglaId.trim().toUpperCase();
  const actualizadas = actuales.filter((r) => r.id.trim().toUpperCase() !== idNorm);
  guardarReglasPersonalizadas(actualizadas);
  return actualizadas;
}

export function alternarReglaPersonalizada(reglaId: string, activa: boolean): Regla[] {
  const actuales = obtenerReglasPersonalizadas();
  const idNorm = reglaId.trim().toUpperCase();
  const actualizadas = actuales.map((r) =>
    r.id.trim().toUpperCase() === idNorm ? { ...r, activa } : r
  );
  guardarReglasPersonalizadas(actualizadas);
  return actualizadas;
}
