import { defineConfig } from 'cypress'
import { resetDb, countTransactions } from './tests/db-utils'

const MAILHOG_HTTP_URL = process.env.MAILHOG_HTTP_URL || 'http://localhost:8025'

interface MailhogMessage {
  Content: {
    Headers: Record<string, string[]>
    Body: string
  }
  MIME?: {
    Parts?: Array<{
      Headers?: Record<string, string[]>
      Body: string
    }>
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    setupNodeEvents(on) {
      on('task', {
        'db:reset': async () => {
          await resetDb()
          return null
        },
        'db:countTransactions': async () => {
          const total = await countTransactions()
          return total
        },
        'mailhog:clear': async () => {
          await fetch(`${MAILHOG_HTTP_URL}/api/v1/messages`, {
            method: 'DELETE',
          })
          return null
        },
        'mailhog:getMessages': async (
          criteria?: { to?: string }
        ): Promise<MailhogMessage[]> => {
          const response = await fetch(`${MAILHOG_HTTP_URL}/api/v2/messages`)
          if (!response.ok) {
            throw new Error(
              `Failed to fetch MailHog messages: ${response.status}`
            )
          }
          const data = (await response.json()) as { items: MailhogMessage[] }
          const items = data.items || []
          if (criteria?.to) {
            const needle = criteria.to.toLowerCase()
            return items.filter((item) =>
              (item.Content?.Headers?.To || []).some((recipient) =>
                recipient.toLowerCase().includes(needle)
              )
            )
          }
          return items
        },
      })
    },
  },
})

