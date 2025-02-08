 /* eslint-disable */
 import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { productId, quantity } = await request.json()

        // Validar los datos recibidos
        if (!productId || !quantity || quantity <= 0) {
            return NextResponse.json(
                { error: "Datos inválidos proporcionados" },
                { status: 400 }
            )
        }

        // Obtener el producto actual para verificar el stock
        const currentProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: { AlmacenVentas: true }
        })

        if (!currentProduct) {
            return NextResponse.json(
                { error: "Producto no encontrado" },
                { status: 404 }
            )
        }

        if (currentProduct.stock < quantity) {
            return NextResponse.json(
                { error: "Stock insuficiente" },
                { status: 400 }
            )
        }

        // Actualizar el stock en una transacción
        const [updatedProduct, updatedAlmacenVentas] = await prisma.$transaction([
            // Reducir el stock principal
            prisma.product.update({
                where: { id: productId },
                data: {
                    stock: {
                        decrement: quantity
                    }
                }
            }),
            // Aumentar el stock en AlmacenVentas
            prisma.almacenVentas.upsert({
                where: { productId },
                create: {
                    productId,
                    stock: quantity
                },
                update: {
                    stock: {
                        increment: quantity
                    }
                }
            })
        ])

        return NextResponse.json({
            product: updatedProduct,
            almacenVentas: updatedAlmacenVentas
        }, { status: 200 })

    } catch (error: any) {
        console.error("Error al mover el stock:", error)
        return NextResponse.json(
            { error: "Error al mover el stock" },
            { status: 500 }
        )
    }
}