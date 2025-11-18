import { PrismaClient, TransactionType } from '@prisma/client'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedDemoData() {
  console.info('Resetting database...')

  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.user.deleteMany(),
  ])

  console.info('Creating demo users...')
  const now = new Date().toISOString()
  const profiles = [
    { name: 'Personal', createdAt: now, updatedAt: now },
    { name: 'Business', createdAt: now, updatedAt: now },
  ]
  const currencies = [
    { code: 'USD', isDefault: true, createdAt: now, updatedAt: now },
    { code: 'EUR', isDefault: false, createdAt: now, updatedAt: now },
  ]

  const seededPassword = 'Password123!'
  const seededPasswordHash = await bcrypt.hash(seededPassword, 10)

  const [verifiedUser, pendingUser] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'demo+verified@finance-app.dev',
        passwordHash: seededPasswordHash,
        passwordSalt: null,
        emailVerifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpiresAt: null,
        profileMetadata: profiles,
        currencyMetadata: currencies,
        tagMetadata: [],
        appSettings: {
          activeProfile: profiles[0]?.name ?? null,
          defaultCurrency: currencies.find((currency) => currency.isDefault)?.code ?? null,
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'demo+pending@finance-app.dev',
        passwordHash: '',
        passwordSalt: null,
        emailVerifiedAt: null,
        verificationToken: 'seed-pending-token',
        verificationTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        profileMetadata: profiles,
        currencyMetadata: currencies,
        tagMetadata: [],
        appSettings: {
          activeProfile: profiles[0]?.name ?? null,
          defaultCurrency: currencies.find((currency) => currency.isDefault)?.code ?? null,
        },
      },
    }),
  ])

  console.info('Seeding transactions for verified user...')

  // Store seeded password in a table for Cypress docs
  await prisma.$executeRawUnsafe(`
    COMMENT ON TABLE users IS 'Seed password for demo+verified@finance-app.dev is "Password123!"';
  `)
  const profileNames = profiles.map((p) => p.name)
  // Sample tag names for generating transactions (not stored as metadata)
  const expenseTagNames = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Travel']
  const incomeTagNames = ['Salary', 'Freelance', 'Investment', 'Gift', 'Bonus']
  
  const transactionPromises = Array.from({ length: 40 }).map(() => {
    const profile = faker.helpers.arrayElement(profileNames)
    const type = faker.helpers.arrayElement([TransactionType.expense, TransactionType.income])
    const availableTags = type === TransactionType.expense ? expenseTagNames : incomeTagNames
    const tagNames = faker.helpers.arrayElements(availableTags, {
      min: 1,
      max: Math.min(2, availableTags.length),
    })

    const amountMinor =
      type === TransactionType.expense
        ? faker.number.int({ min: 1000, max: 50000 })
        : faker.number.int({ min: 10000, max: 150000 })

    return prisma.transaction.create({
      data: {
        userId: verifiedUser.id,
        profile,
        occurredAt: faker.date.recent({ days: 90 }),
        amountMinor: BigInt(amountMinor),
        currency: 'USD',
        type,
        tags: tagNames,
        note: faker.lorem.sentence(),
      },
    })
  })

  await Promise.all(transactionPromises)
}

async function main() {
  try {
    await seedDemoData()
    console.info('Seeding complete ✅')
  } catch (error) {
    console.error('Seeding failed ❌', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()

