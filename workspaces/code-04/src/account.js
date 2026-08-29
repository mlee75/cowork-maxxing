import { AppError } from './errors.js'

export function closeAccount(account) {
  if (account.balance !== 0) {
    throw new AppError('ACCOUNT_NOT_EMPTY', 'account still holds a balance', { balance: account.balance })
  }
  return { ...account, status: 'closed' }
}
