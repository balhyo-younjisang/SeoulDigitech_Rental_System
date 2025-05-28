import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test the connection
    await prisma.$connect()
    console.log('Successfully connected to the database')

    // Create a test equipment
    const equipment = await prisma.equipment.create({
      data: {
        name: 'Test Equipment',
        description: 'This is a test equipment',
        image: 'https://via.placeholder.com/300',
        status: 'available',
        totalCount: 1,
        availableCount: 1,
        serialNumber: 'TEST-001',
      },
    })
    console.log('Created test equipment:', equipment)

    // Clean up
    await prisma.equipment.delete({
      where: { id: equipment.id },
    })
    console.log('Test equipment deleted')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 