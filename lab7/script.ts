import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            username: 'Bob',
            orders: {
                create: [
                    {
                        product_name: 'Product 1',
                        product_count: 2
                    },
                    {
                        product_name: 'Product 2',
                        product_count: 3
                    }
                ],
            },
        },
        include: {
            orders: true,
        },
    })
    console.log(`User: ${user.username} \n Orders: ${user.orders.map(order => order.product_name).join(', ')}, Count: ${user.orders.map(order => order.product_count).join(', ')}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })