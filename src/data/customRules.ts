/**
 * Módulo de persistencia y gestión de reglas personalizadas creadas por el cliente.
 * Se guardan en localStorage para persistencia y se inyectan en la Base de Conocimiento.
 */
import { Regla } from './types';

const STORAGE_KEY = 'akinator_viajes_reglas_personalizadas';

export function obtenerReglasPersonalizadas(): Regla[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error cargando reglas personalizadas de localStorage:', e);
  }
  return [];
}

export function guardarReglasPersonalizadas(reglas: Regla[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reglas));
  } catch (e) {
    console.error('Error guardando reglas personalizadas en localStorage:', e);
  }
}

export function agregarReglaPersonalizada(nuevaRegla: Regla): Regla[] {
  const actuales = obtenerReglasPersonalizadas();
  const index = actuales.findIndex((r) => r.id === nuevaRegla.id);
  let actualizadas: Regla[];
  if (index >= 0) {
    actualizadas = [...actuales];
    actualizadas[index] = nuevaRegla;
  } else {
    actualizadas = [...actuales, nuevaRegla];
  }
  guardarReglasPersonalizadas(actualizadas);
  return actualizadas;
}

export function eliminarReglaPersonalizada(reglaId: string): Regla[] {
  const actuales = obtenerReglasPersonalizadas();
  const actualizadas = actuales.filter((r) => r.id !== reglaId);
  guardarReglasPersonalizadas(actualizadas);
  return actualizadas;
}

export function alternarReglaPersonalizada(reglaId: string, activa: boolean): Regla[] {
  const actuales = obtenerReglasPersonalizadas();
  const actualizadas = actuales.map((r) => (r.id === reglaId ? { ...r, activa } : r));
  guardarReglasPersonalizadas(actualizadas);
  return actualizadas;
}
