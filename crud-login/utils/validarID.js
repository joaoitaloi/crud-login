function validarId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return "ID inválido"
  }
}

module.exports = validarId;