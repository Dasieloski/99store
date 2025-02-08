/* eslint-disable */
import { Offer } from "@prisma/client"

export interface OfferInput {
    productId: string
    discount: number
    startDate: string
    endDate: string
    isActive?: boolean
    title: string
    description: string
    emoji: string
}

export async function fetchOffers(): Promise<Offer[]> {
    const response = await fetch('/api/offers')
    if (!response.ok) {
        throw new Error('Error al obtener las ofertas.')
    }
    const data = await response.json()
    return data as Offer[]
}

export async function fetchProducts() {
    const response = await fetch('/api/products')
    if (!response.ok) {
        throw new Error('Error al obtener los productos.')
    }
    return response.json()
}

export async function createOffer(offer: OfferInput): Promise<Offer> {
    const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(offer),
    })
    if (!response.ok) {
        throw new Error('Error al crear la oferta.')
    }
    return response.json()
}

export async function updateOffer(id: string, offer: OfferInput): Promise<Offer> {
    const response = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(offer),
    })
    if (!response.ok) {
        throw new Error('Error al actualizar la oferta.')
    }
    return response.json()
}

export async function deleteOffer(id: string) {
    const response = await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        throw new Error('Error al eliminar la oferta.')
    }
    return response.json()
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/categories') // Asegúrate de tener esta ruta
  if (!res.ok) throw new Error('Error al obtener categorías')
  return res.json()
}

export const fetchSales = async (): Promise<Sale[]> => {
  const res = await fetch('/api/sales')
  if (!res.ok) throw new Error('Error al obtener ventas')
  return res.json()
}

interface CreateReturnRequestInput {
  saleId: number
  products: Array<{ productId: string, quantity: number }>
  total: number
}

export const createReturnRequest = async (input: CreateReturnRequestInput): Promise<ReturnRequest> => {
  const res = await fetch('/api/returns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Error al crear solicitud de devolución')
  return res.json()
}

export const fetchReturnRequests = async (): Promise<ReturnRequest[]> => {
  const res = await fetch('/api/returns')
  if (!res.ok) throw new Error('Error al obtener devoluciones')
  return res.json()
}

export const authorizeReturnRequest = async (id: number, status: "AUTHORIZED" | "REJECTED"): Promise<ReturnRequest> => {
  const res = await fetch(`/api/returns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Error al autorizar devolución')
  return res.json()
}