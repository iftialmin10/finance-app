import type {
  SetupCatalogData,
  SetupCatalogCurrency,
  SetupCatalogProfile,
  SetupCatalogTag,
  TransactionType,
} from '@/types'

export interface CatalogSummaryInput {
  profile: string
  currency: string
  type: TransactionType
  tags: string[]
}

export function summarizeCatalog(
  inputs: CatalogSummaryInput[]
): SetupCatalogData {
  const profileStats: Map<string, number> = new Map()
  const currencyStats: Map<string, number> = new Map()
  const tagStats: Map<string, { count: number; type: TransactionType }> =
    new Map()

  inputs.forEach((entry) => {
    const profile = entry.profile?.trim()
    const currency = entry.currency?.trim().toUpperCase()
    if (profile) {
      profileStats.set(profile, (profileStats.get(profile) || 0) + 1)
    }
    if (currency) {
      currencyStats.set(currency, (currencyStats.get(currency) || 0) + 1)
    }
    if (profile && Array.isArray(entry.tags)) {
      entry.tags.forEach((tag) => {
        const tagName = tag.trim()
        if (!tagName) return
        const key = `${profile}::${tagName}::${entry.type}`
        tagStats.set(key, {
          count: (tagStats.get(key)?.count || 0) + 1,
          type: entry.type,
        })
      })
    }
  })

  const profiles: SetupCatalogProfile[] = Array.from(profileStats.entries()).map(
    ([name, count]) => ({ name, count })
  )

  const currencies: SetupCatalogCurrency[] = Array.from(
    currencyStats.entries()
  ).map(([code, count]) => ({ code, count }))

  const tags: SetupCatalogTag[] = Array.from(tagStats.entries()).map(
    ([key, value]) => {
      const [profile, name] = key.split('::')
      return {
        profile,
        name,
        type: value.type,
        count: value.count,
      }
    }
  )

  profiles.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  currencies.sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
  tags.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return {
    transactionCount: inputs.length,
    profiles,
    currencies,
    tags,
  }
}

