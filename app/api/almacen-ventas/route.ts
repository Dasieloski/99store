import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request: Request) {
    try {
        const { productId, newStock } = await request.json()

        // Validar los datos recibidos
        if (!productId || newStock === undefined || newStock === null || isNaN(newStock) || newStock < 0) {
            return NextResponse.json({ error: 'Datos inválidos proporcionados' }, { status: 400 })
        }

        // Verificar si el AlmacenVentas existe para el producto
        const almacen = await prisma.almacenVentas.findUnique({
            where: { productId },
        })

        if (!almacen) {
            // Si no existe, crear uno nuevo
            const newAlmacen = await prisma.almacenVentas.create({
                data: {
                    productId,
                    stock: newStock,
                },
            })
            return NextResponse.json(newAlmacen, { status: 200 })
        }

        // Actualizar el stock existente
        const updatedAlmacen = await prisma.almacenVentas.update({
            where: { productId },
            data: { stock: newStock },
        })

        return NextResponse.json(updatedAlmacen, { status: 200 })
    } catch (error: any) {
        console.error('Error al actualizar el stock del Almacén de Ventas:', error.message || error)
        return NextResponse.json({ error: 'Error al actualizar el stock del Almacén de Ventas' }, { status: 500 })
    }
} 