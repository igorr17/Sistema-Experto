/**
 * Módulo de carga de knowledge.json
 */
import { KnowledgeBase } from './types';

let cachedKnowledge: KnowledgeBase | null = null;

export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  if (cachedKnowledge) {
    return cachedKnowledge;
  }

  const candidateUrls = [
    '/knowledge.json',
    '/public/knowledge.json',
    '/assets/aistudio/knowledge.app_72fb3246.json',
    '/public/assets/aistudio/knowledge.app_72fb3246.json',
  ];

  let lastError: Error | null = null;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = (await response.json()) as KnowledgeBase;
        if (data && Array.isArray(data.paises) && Array.isArray(data.reglas)) {
          cachedKnowledge = data;
          return data;
        }
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw new Error(
    `No se pudo cargar la base de conocimiento knowledge.json. Último error: ${lastError?.message || 'Archivo no encontrado'}`
  );
}

export function setKnowledgeBase(data: KnowledgeBase): void {
  cachedKnowledge = data;
}

export function getCachedKnowledgeBase(): KnowledgeBase | null {
  return cachedKnowledge;
}
