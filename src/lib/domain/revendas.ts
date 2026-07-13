/**
 * Lista de revendas autorizadas a aparecer no dashboard.
 */
export const REVENDAS_PERMITIDAS = [
  "SISTEMA ATHOS SJC",
  "SISTEMA ATHOS PINDA",
  "SISTEMA ATHOS SP",
  "THM SOLUÇÕES TECNOLOGICAS",
  "SISTEMA ATHOS JACAREÍ",
  "SISTEMA ATHOS GUARULHOS",
  "ATHOS COTIA",
] as const

export function placeholdersRevendas(offset = 0): string {
  return REVENDAS_PERMITIDAS.map((_, i) => `$${i + 1 + offset}`).join(", ")
}