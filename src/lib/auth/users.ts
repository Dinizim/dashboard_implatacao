/**
 * Credenciais dos usuários da aplicação.
 *
 * Não há tabela de usuários — apenas 2 contas fixas, configuradas via
 * variáveis de ambiente (GERENTE_USUARIO/GERENTE_SENHA e
 * TECNICO_USUARIO/TECNICO_SENHA). Nenhuma credencial fica no código.
 */

import type { SessionRole } from "./session"

export type Usuario = {
  usuario: string
  role: SessionRole
}

function comparacaoSegura(a: string, b: string): boolean {
  const bytesA = encoder.encode(a)
  const bytesB = encoder.encode(b)
  if (bytesA.length !== bytesB.length) return false
  let diferenca = 0
  for (let i = 0; i < bytesA.length; i++) diferenca |= bytesA[i] ^ bytesB[i]
  return diferenca === 0
}

const encoder = new TextEncoder()

export function validarCredenciais(usuario: string, senha: string): Usuario | null {
  const gerenteUsuario = process.env.GERENTE_USUARIO
  const gerenteSenha = process.env.GERENTE_SENHA
  const tecnicoUsuario = process.env.TECNICO_USUARIO
  const tecnicoSenha = process.env.TECNICO_SENHA

  if (
    gerenteUsuario && gerenteSenha &&
    comparacaoSegura(usuario, gerenteUsuario) &&
    comparacaoSegura(senha, gerenteSenha)
  ) {
    return { usuario: gerenteUsuario, role: "gerente" }
  }

  if (
    tecnicoUsuario && tecnicoSenha &&
    comparacaoSegura(usuario, tecnicoUsuario) &&
    comparacaoSegura(senha, tecnicoSenha)
  ) {
    return { usuario: tecnicoUsuario, role: "tecnico" }
  }

  return null
}
