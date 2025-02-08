/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener todas las solicitudes de devolución
export async function GET() {
  try {
    const returns = await prisma.returnRequest.findMany({
      include: {
        sale: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(returns)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las devoluciones' }, { status: 500 })
  }
}

// Crear una nueva solicitud de devolución
export async function POST(request: Request) {
  try {
    const { saleId, products, total } = await request.json()

    // Crear la solicitud de devolución
    const newReturn = await prisma.returnRequest.create({
      data: {
        saleId,
        products,
        total,
      },
      include: {
        sale: true,
      },
    })

    // Aquí puedes integrar el envío a WhatsApp usando una API como Twilio
    // Por ejemplo:
    // await sendWhatsAppMessage(newReturn)

    return NextResponse.json(newReturn, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la devolución' }, { status: 500 })
  }
} 