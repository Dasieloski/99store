/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronUp, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/TableSkeleton"

interface Product {
  id: string
  name: string
  category: {
    name: string
  }
  image: string
  stock: number // stock del gran almacén
  AlmacenVentas: {
    stock: number
  } | null
}

type SortField = "name" | "category" | "stock" | "salesWarehouseQuantity"

export default function WarehouseTransferPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [isTransferring, setIsTransferring] = useState(false)

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/stock")
        if (!response.ok) {
          throw new Error("Error al cargar los productos")
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar los productos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const productsToTransfer = products.filter((product) => (product.AlmacenVentas?.stock || 0) < 5)

  const handleFillSalesWarehouse = async () => {
    setIsTransferring(true)
    try {
      for (const product of productsToTransfer) {
        // Calcular cuánto necesitamos para llegar a 5 en el almacén de ventas
        const currentSalesStock = product.AlmacenVentas?.stock || 0
        const neededQuantity = 5 - currentSalesStock

        // Verificar si hay suficiente stock en el gran almacén
        const availableQuantity = Math.min(neededQuantity, product.stock)

        if (availableQuantity > 0) {
          const res = await fetch("/api/stock/move-to-store", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              quantity: availableQuantity,
            }),
          })

          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || `Error al transferir ${product.name}`)
          }

          // Actualizar el estado local
          setProducts((prevProducts) =>
            prevProducts.map((p) => {
              if (p.id === product.id) {
                return {
                  ...p,
                  stock: p.stock - availableQuantity,
                  AlmacenVentas: {
                    ...p.AlmacenVentas,
                    stock: (p.AlmacenVentas?.stock || 0) + availableQuantity,
                  },
                }
              }
              return p
            }),
          )
        }
      }

      toast.success("🚚 Almacén de ventas llenado con éxito")
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Error al realizar la transferencia")
    } finally {
      setIsTransferring(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    let aValue, bValue

    switch (sortField) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "category":
        aValue = a.category?.name
        bValue = b.category?.name
        break
      case "stock":
        aValue = a.stock
        bValue = b.stock
        break
      case "salesWarehouseQuantity":
        aValue = a.AlmacenVentas?.stock || 0
        bValue = b.AlmacenVentas?.stock || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-6">🚚 Transferencia de Almacén</h1>
        <Card>
          <CardHeader>
            <CardTitle>📦 Gestión de Stock</CardTitle>
            <CardDescription>Visualiza y gestiona el stock entre almacenes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Input
                placeholder="🔍 Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex items-center gap-2">
                <Select value={sortField} onValueChange={(value) => handleSort(value as SortField)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="category">Categoría</SelectItem>
                    <SelectItem value="stock">Almacén Principal</SelectItem>
                    <SelectItem value="salesWarehouseQuantity">Almacén de Ventas</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>🚚 Llenar Almacén de Ventas</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Confirmar Transferencia</DialogTitle>
                      <DialogDescription>
                        Se transferirán los siguientes productos al almacén de ventas:
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Imagen</TableHead>
                            <TableHead>Cantidad a Transferir</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productsToTransfer.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              </TableCell>
                              <TableCell>{Math.min(5 - (product.AlmacenVentas?.stock || 0), product.stock)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleFillSalesWarehouse} disabled={isTransferring}>
                        {isTransferring ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Transfiriendo...
                          </>
                        ) : (
                          "Confirmar Transferencia"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Almacén Principal</TableHead>
                    <TableHead>Almacén de Ventas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span>{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{product.AlmacenVentas?.stock || 0}</span>
                            {(product.AlmacenVentas?.stock || 0) < 5 && (
                              <Badge variant="destructive" className="animate-pulse">
                                ⚠️ Stock Bajo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total de productos: {products.length} | Productos con stock bajo:{" "}
              {products.filter((p) => (p.AlmacenVentas?.stock || 0) < 5).length}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

