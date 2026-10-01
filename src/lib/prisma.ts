import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createAdapter = () => new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/contractiq?schema=public'
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter: createAdapter() })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
