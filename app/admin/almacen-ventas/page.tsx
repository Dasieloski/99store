/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, SortAsc, SortDesc, Filter, X } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {TableSkeleton} from "@/components/TableSkeleton"
import { toast } from "react-hot-toast"

/* // Mock data for Almacen de Ventas
const mockProducts = [
    {
        id: 1,
        name: "Smartphone XYZ",
        image: "/placeholder.svg",
        category: "📱 Electrónicos",
        price: 599.99,
        stock: 3,
    },
    {
        id: 2,
        name: "Laptop Pro",
        image: "/placeholder.svg",
        category: "💻 Computadoras",
        price: 1299.99,
        stock: 8,
    },
    {
        id: 3,
        name: "Auriculares Gaming",
        image: "/placeholder.svg",
        category: "🎮 Gaming",
        price: 99.99,
        stock: 4,
    },
    {
        id: 4,
        name: "Smart TV 55'",
        image: "/placeholder.svg",
        category: "📺 Televisores",
        price: 799.99,
        stock: 6,
    },
] */

const LowStockIndicator = () => {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible((v) => !v)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            animate={{ opacity: visible ? 1 : 0.5 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ml-2"
        >
            ⚠️ Stock Bajo
        </motion.div>
    )
}

interface FilterState {
    category: string
    minPrice: number
    maxPrice: number
    stockStatus: string
    priceRange: [number, number]
}

interface Product {
    id: string
    name: string
    image: string
    category: string
    price: number
    stock: number
    almacenVentas: {
        stock: number
    }
}

export default function AlmacenVentas() {
    const [products, setProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" })
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [isLoading, setIsLoading] = useState(true)

    // Estado para los filtros
    const [filters, setFilters] = useState<FilterState>({
        category: "todos",
        minPrice: 0,
        maxPrice: Number.MAX_SAFE_INTEGER,
        stockStatus: "todos",
        priceRange: [0, Number.MAX_SAFE_INTEGER],
    })

    // Obtener valores únicos para los filtros
    const categories = Array.from(new Set(products.map((product) => product.category)))
    const maxProductPrice = Math.max(...products.map((p) => p.price))

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const clearFilters = () => {
        setFilters({
            category: "todos",
            minPrice: 0,
            maxPrice: maxProductPrice,
            stockStatus: "todos",
            priceRange: [0, maxProductPrice],
        })
    }

    const getActiveFilterCount = () => {
        let count = 0
        if (filters.category !== "todos") count++
        if (filters.stockStatus !== "todos") count++
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxProductPrice) count++
        return count
    }

    const filteredAndSortedProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = filters.category === "todos" || product.category === filters.category
            const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
            const matchesStock =
                filters.stockStatus === "todos" ||
                (filters.stockStatus === "bajo" && product.stock < 5) ||
                (filters.stockStatus === "normal" && product.stock >= 5)

            return matchesSearch && matchesCategory && matchesPrice && matchesStock
        })
        .sort((a, b) => {
            if (sortConfig.direction === "asc") {
                return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
            }
            return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
        })

    const handleSort = (key: string) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
        }))
    }

    // Pagination calculations
    const totalFilteredItems = filteredAndSortedProducts.length
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = filteredAndSortedProducts.slice(startIndex, endIndex)

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        return pages
    }

    // Añade una función para actualizar el stock del Almacén de Ventas
    const updateAlmacenVentasStock = async (productId: string, newStock: number) => {
  try {
    const res = await fetch('/api/almacen-ventas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, newStock }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Error al actualizar el stock del Almacén de Ventas:', errorData.error)
      return
    }

    const updatedAlmacen = await res.json()
    console.log(`Stock del Almacén de Ventas para el producto ${updatedAlmacen.productId} actualizado a ${updatedAlmacen.stock}`)

    // Actualizar el estado local
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedAlmacen.productId
          ? { ...product, almacenVentas: { stock: updatedAlmacen.stock } }
          : product
      )
    )
  } catch (error) {
    console.error('Error al conectar con la API:', error)
  }
}

    // Agregar useEffect para cargar los productos
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true)
            try {
                const res = await fetch("/api/products")
                if (!res.ok) throw new Error("Error al cargar productos")

                const productsData: any[] = await res.json()

                // Mapear AlmacenVentas a almacenVentas
                const productsWithAlmacen = productsData.map((product) => ({
                    ...product,
                    almacenVentas: product.AlmacenVentas || { stock: 0 },
                }))

                console.log("Productos con almacenVentas:", productsWithAlmacen)
                setProducts(productsWithAlmacen)
            } catch (error) {
                console.error("Error:", error)
                toast.error("Error al cargar productos")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (isLoading) {
        return (
           <TableSkeleton/>
        )
    }

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">🏪 Almacén de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="🔍 Buscar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* Items per page selector */}
                            <Select
                                value={String(itemsPerPage)}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value))
                                    setCurrentPage(1) // Reset to first page when changing items per page
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Productos por página" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 por página</SelectItem>
                                    <SelectItem value="10">10 por página</SelectItem>
                                    <SelectItem value="25">25 por página</SelectItem>
                                    <SelectItem value="50">50 por página</SelectItem>
                                    <SelectItem value="100">100 por página</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Botón de Filtros con Badge */}
                            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="relative">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filtros
                                        {getActiveFilterCount() > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {getActiveFilterCount()}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-[300px]">
                                    <SheetHeader>
                                        <SheetTitle>🎯 Filtros</SheetTitle>
                                        <SheetDescription>Aplica filtros para encontrar productos específicos</SheetDescription>
                                    </SheetHeader>

                                    <div className="py-4 space-y-6">
                                        {/* Filtro por Categoría */}
                                        <div className="space-y-2">
                                            <Label>📁 Categoría</Label>
                                            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todas las categorías</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Filtro por Rango de Precios */}
                                        <div className="space-y-2">
                                            <Label>💰 Rango de Precios</Label>
                                            <div className="pt-2">
                                                <Slider
                                                    min={0}
                                                    max={maxProductPrice}
                                                    step={10}
                                                    value={filters.priceRange}
                                                    onValueChange={(value) => handleFilterChange("priceRange", value)}
                                                    className="my-4"
                                                />
                                                <div className="flex justify-between text-sm">
                                                    <span>${filters.priceRange[0]}</span>
                                                    <span>${filters.priceRange[1]}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filtro por Estado de Stock */}
                                        <div className="space-y-2">
                                            <Label>📦 Estado del Stock</Label>
                                            <Select
                                                value={filters.stockStatus}
                                                onValueChange={(value) => handleFilterChange("stockStatus", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona estado del stock" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todos</SelectItem>
                                                    <SelectItem value="bajo">Stock Bajo (&lt; 5)</SelectItem>
                                                    <SelectItem value="normal">Stock Normal (≥ 5)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <SheetFooter className="flex flex-col gap-3 sm:flex-col">
                                        <Button onClick={clearFilters} variant="outline" className="w-full">
                                            <X className="mr-2 h-4 w-4" />
                                            Limpiar Filtros
                                        </Button>
                                        <Button onClick={() => setIsFilterSheetOpen(false)} className="w-full">
                                            Ver {filteredAndSortedProducts.length} productos
                                        </Button>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Chips de filtros activos */}
                        {getActiveFilterCount() > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {filters.category !== "todos" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {filters.category}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("category", "todos")} />
                                    </Badge>
                                )}
                                {filters.stockStatus !== "todos" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {filters.stockStatus === "bajo" ? "Stock Bajo" : "Stock Normal"}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("stockStatus", "todos")} />
                                    </Badge>
                                )}
                                {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxProductPrice) && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleFilterChange("priceRange", [0, maxProductPrice])}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>🖼️ Imagen</TableHead>
                                        <TableHead onClick={() => handleSort("name")} className="cursor-pointer hover:bg-muted">
                                            📝 Nombre{" "}
                                            {sortConfig.key === "name" &&
                                                (sortConfig.direction === "asc" ? (
                                                    <SortAsc className="inline h-4 w-4" />
                                                ) : (
                                                    <SortDesc className="inline h-4 w-4" />
                                                ))}
                                        </TableHead>
                                        <TableHead>📁 Categoría</TableHead>
                                        <TableHead onClick={() => handleSort("price")} className="cursor-pointer hover:bg-muted">
                                            💰 Precio{" "}
                                            {sortConfig.key === "price" &&
                                                (sortConfig.direction === "asc" ? (
                                                    <SortAsc className="inline h-4 w-4" />
                                                ) : (
                                                    <SortDesc className="inline h-4 w-4" />
                                                ))}
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("stock")} className="cursor-pointer hover:bg-muted">
                                            📦 Stock{" "}
                                            {sortConfig.key === "stock" &&
                                                (sortConfig.direction === "asc" ? (
                                                    <SortAsc className="inline h-4 w-4" />
                                                ) : (
                                                    <SortDesc className="inline h-4 w-4" />
                                                ))}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((product) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell>
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                    <Image
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        width={50}
                                                        height={50}
                                                        className="rounded-md"
                                                    />
                                                </motion.div>
                                            </TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>${product.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    Stock: {product.almacenVentas.stock}
                                                </Badge>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {startIndex + 1}-{Math.min(endIndex, totalFilteredItems)} de {totalFilteredItems} productos
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {currentPage > 3 && (
                                        <>
                                            <PaginationItem>
                                                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        </>
                                    )}

                                    {getPageNumbers().map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page}>
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    {currentPage < totalPages - 2 && (
                                        <>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                                            </PaginationItem>
                                        </>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    )
}

