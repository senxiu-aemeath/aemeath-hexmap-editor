import type { Dispatch, SetStateAction } from 'react'

import { upsertCountry, type Country, type WorldDocument } from '../../domain/world'

export function updateCountry(
  country: Country,
  patch: Partial<Country>,
  setWorld: Dispatch<SetStateAction<WorldDocument>>,
) {
  setWorld((current) => {
    const nextCountry = { ...country, ...patch }
    return upsertCountry(current, nextCountry)
  })
}
