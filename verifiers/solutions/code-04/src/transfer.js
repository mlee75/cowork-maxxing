import { AppError } from './errors.js'
export function transfer(from, to, amount) {
  if (!(amount > 0)) throw new AppError('AMOUNT_NOT_POSITIVE', 'transfer amount must be positive', { amount })
  if (from.balance < amount) throw new AppError('INSUFFICIENT_FUNDS', 'source account lacks funds', { balance: from.balance, amount })
  return { from: { ...from, balance: from.balance - amount }, to: { ...to, balance: to.balance + amount } }
}
