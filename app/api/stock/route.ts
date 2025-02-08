/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener todos los productos con AlmacénVentas y categoría
    const productos = await prisma.product.findMany({
      include: {
        AlmacenVentas: true,
        category: {
          select: { name: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Crear AlmacénVentas para productos que no lo tengan
    for (const producto of productos) {
      if (!producto.AlmacenVentas) {
        await prisma.almacenVentas.create({
          data: {
            productId: producto.id,
            stock: 0,
          }
        })
      }
    }

    // Obtener productos actualizados
    const productosActualizados = await prisma.product.findMany({
      include: {
        AlmacenVentas: true,
        category: {
          select: { name: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log('Productos enviados al frontend:', productosActualizados)
    return NextResponse.json(productosActualizados, { status: 200 })
  } catch (error: any) {
    console.error('Error al obtener el stock de los productos:', error.message || error)
    return NextResponse.json(
      { error: 'Error al obtener el stock de los productos' },
      { status: 500 }
    )
  }
}

// Actualizar el stock de un producto específico
export async function PATCH(request: Request) {
    try {
        const { id, stock } = await request.json()

        // Validar los datos recibidos
        if (!id || stock === undefined || stock === null || isNaN(stock) || stock < 0) {
            return NextResponse.json({ error: 'Datos inválidos proporcionados' }, { status: 400 })
        }

        // Asegurarse de que stock es un entero
        const stockInt = Math.floor(stock)

        // Actualizar el stock en la base de datos
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: { stock: stockInt },
            include: {
                AlmacenVentas: true, // Incluir AlmacenVentas después de la actualización
                category: {
                    select: { name: true }
                }
            },
        })

        console.log('Stock actualizado exitosamente:', updatedProduct)
        return NextResponse.json(updatedProduct, { status: 200 })
    } catch (error: any) {
        console.error('Error al actualizar el stock del producto:', error.message || error)
        return NextResponse.json({ error: 'Error al actualizar el stock del producto' }, { status: 500 })
    }
}