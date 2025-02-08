/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { id, quantity } = await request.json()

    // Validar los datos recibidos
    if (!id || !quantity || isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Datos inválidos proporcionados' }, { status: 400 })
    }

    // Obtener el producto actual
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'No hay suficiente stock disponible' }, { status: 400 })
    }

    // Actualizar el stock del gran almacén
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: product.stock - quantity },
      select: {
        id: true,
        name: true,
        image: true,
        stock: true,
        category: { select: { name: true } },
      },
    })

    // Aquí puedes agregar lógica para aumentar el stock en el almacén de ventas

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error: any) {
    console.error('Error al mover el stock:', error.message || error)
    return NextResponse.json({ error: 'Error al mover el stock' }, { status: 500 })
  }
} 