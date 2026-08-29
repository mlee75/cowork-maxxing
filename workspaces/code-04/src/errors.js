export class AppError extends Error {
  constructor(code, message, context = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
  }
}
