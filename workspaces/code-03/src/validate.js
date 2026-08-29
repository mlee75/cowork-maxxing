export function validateUser(input) {
  const errors = []
  if (!input.email || !input.email.includes('@')) errors.push('email is invalid')
  if (!input.name || input.name.trim().length === 0) errors.push('name is required')
  if (input.age !== undefined && (!Number.isInteger(input.age) || input.age < 0)) errors.push('age must be a non-negative integer')
  return { ok: errors.length === 0, errors }
}

export function validateContact(input) {
  const errors = []
  if (!input.email || !input.email.includes('@')) errors.push('email is invalid')
  if (!input.name || input.name.trim().length === 0) errors.push('name is required')
  if (input.company !== undefined && input.company.trim().length === 0) errors.push('company must not be blank')
  return { ok: errors.length === 0, errors }
}
