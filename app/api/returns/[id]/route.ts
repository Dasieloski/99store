/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient, ReturnStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { status } = await request.json()

    if (!Object.values(ReturnStatus).includes(status)) {
      return NextResponse.json({ error: 'Estado de devolución inválido' }, { status: 400 })
    }

    const updatedReturn = await prisma.returnRequest.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { sale: true },
    })

    // Puedes agregar lógica adicional aquí, como actualizar el stock o notificar al empleado

    return NextResponse.json(updatedReturn)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la devolución' }, { status: 500 })
  }
} 