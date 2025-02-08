/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { supabaseAdmin } from '@/lib/supabaseClient'

const prisma = new PrismaClient()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export const config = {
    api: {
        bodyParser: false,
    },
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    try {
        let productos

        if (category) {
            productos = await prisma.product.findMany({
                where: {
                    category: {
                        name: {
                            equals: category,
                            mode: 'insensitive'
                        }
                    }
                },
                include: { category: true, AlmacenVentas: true },
            })
        } else {
            productos = await prisma.product.findMany({
                include: { category: true, AlmacenVentas: true },
            })
        }


        if (!productos || productos.length === 0) {
            return NextResponse.json({ error: 'No se encontraron productos' }, { status: 404 })
        }

        return NextResponse.json(productos, { status: 200 })
    } catch (error) {
        console.error('Error en GET /api/products:', error)
        return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const name = formData.get('name') as string
        const price = formData.get('price') as string
        const category = formData.get('category') as string
        const description = formData.get('description') as string
        const emoji = formData.get('emoji') as string
        const detailedDescription = formData.get('detailedDescription') as string | null
        const file = formData.get('image') as File

        // Validar campos requeridos
        if (!name || !price || !category || !description || !emoji || !file) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        // Validar tipo de archivo
        const allowedExtensions = ['image/jpeg', 'image/png', 'image/gif']
        if (!allowedExtensions.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
        }

        // Sanitizar el nombre del archivo
        const sanitizeFileName = (filename: string) => {
            return filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '')
        }

        const originalFileName = sanitizeFileName(file.name)
        const fileName = `${Date.now()}-${originalFileName}`

        // Subir archivo a Supabase usando el cliente admin
        const { data, error: uploadError } = await supabaseAdmin
            .storage
            .from('product-images')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) {
            console.error('Error al subir a Supabase:', uploadError)
            return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
        }

        // Obtener la URL pública de la imagen
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`

        // Crear el producto en la base de datos
        const newProduct = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                category: { connect: { id: String(category) } },
                description,
                emoji,
                detailedDescription: detailedDescription || description,
                image: imageUrl,
                AlmacenVentas: {
                    create: {
                        stock: 0, // Inicializar stock en Almacén de Ventas
                    }
                }
            },
            include: { category: true, AlmacenVentas: true },
        })

        return NextResponse.json(newProduct, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error al crear el producto:', error)
            return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 })
        }

        return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const formData = await request.formData()
        const id = formData.get('id') as string
        const name = formData.get('name') as string
        const price = formData.get('price') as string
        const category = formData.get('category') as string
        const description = formData.get('description') as string
        const emoji = formData.get('emoji') as string
        const detailedDescription = formData.get('detailedDescription') as string | null
        const file = formData.get('image') as File | null

        if (!id || !name || !price || !category || !description || !emoji) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        // Obtener el producto existente
        const existingProduct = await prisma.product.findUnique({ where: { id } })
        if (!existingProduct) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
        }

        let imageUrl = existingProduct.image

        if (file) {
            // Validar tipo de archivo
            const allowedExtensions = ['image/jpeg', 'image/png', 'image/gif']
            if (!allowedExtensions.includes(file.type)) {
                return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
            }

            // Subir nueva imagen a Supabase
            const fileName = `${Date.now()}-${file.name}`
            const { data, error: uploadError } = await supabaseAdmin
                .storage
                .from('product-images')
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: false,
                })

            if (uploadError) {
                console.error('Error al subir a Supabase:', uploadError)
                return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
            }

            // Obtener la nueva URL pública
            imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`

            // (Opcional) Eliminar la imagen antigua de Supabase
            const oldFileName = existingProduct.image.split('/').pop()
            if (oldFileName) {
                const { error: deleteError } = await supabaseAdmin
                    .storage
                    .from('product-images')
                    .remove([oldFileName])

                if (deleteError) {
                    console.error('Error al eliminar la imagen antigua:', deleteError)
                }
            }
        }

        // Actualizar el producto en la base de datos
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                price: parseFloat(price),
                categoryId: String(category),
                description,
                detailedDescription: detailedDescription || description,
                emoji,
                image: imageUrl,
            },
            include: { category: true },
        })

        return NextResponse.json(updatedProduct, { status: 200 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error al actualizar el producto:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        const product = await prisma.product.findUnique({ where: { id } })
        if (product && product.image) {
            const fileName = product.image.split('/').pop()
            if (fileName) {
                const { error: deleteError } = await supabaseAdmin
                    .storage
                    .from('product-images')
                    .remove([fileName])

                if (deleteError) {
                    console.error('Error al eliminar la imagen de Supabase:', deleteError)
                }
            }
        }

        await prisma.product.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Producto eliminado exitosamente' }, { status: 200 })
    } catch (error: unknown) {
        console.error(error)
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code: string }).code === 'P2025'
        ) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 })
    }
}