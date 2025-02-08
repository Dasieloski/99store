import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const sales = await prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(sales)
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al obtener ventas' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { products, total, paymentMethod } = await request.json()

        const sale = await prisma.sale.create({
            data: {
                total,
                paymentMethod,
                status: "completed",
                products: {
                    create: products.map((p: any) => ({
                        productId: p.id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                }
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })

        // Actualizar stock de productos
        await Promise.all(
            products.map(async (p: any) => {
                await prisma.almacenVentas.update({
                    where: { productId: p.id },
                    data: {
                        stock: {
                            decrement: p.quantity
                        }
                    }
                })
            })
        )

        return NextResponse.json(sale)
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al crear venta' },
            { status: 500 }
        )
    }
}