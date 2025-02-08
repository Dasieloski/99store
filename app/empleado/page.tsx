/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Undo2, Calculator, Sun, Moon, Menu } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  name: string
}

interface AlmacenVentas {
  stock: number
}

interface Product {
  id: string
  name: string
  price: number
  category: Category
  image: string
  almacenVentas: AlmacenVentas
  quantity?: number
}

interface SaleProduct {
  productId: string // ID del producto
  quantity: number
  price: number
  product?: { // Hacer opcional este campo
    id: string
    name: string
    image: string
  }
}

interface Sale {
  id: number
  createdAt: string
  products: SaleProduct[]
  total: number
  paymentMethod: string
  status: string
}

// Función para cargar productos
const fetchProducts = async () => {
  try {
    const res = await fetch("/api/products")
    if (!res.ok) throw new Error("Error al cargar productos")

    const productsData: Product[] = await res.json()

    // Asegurar que cada producto tenga almacenVentas
    const productsWithAlmacen = productsData.map((product) => ({
      ...product,
      almacenVentas: product.AlmacenVentas || { stock: 0 }, // Usar AlmacenVentas con mayúscula
    }))

    console.log("Productos con AlmacénVentas:", productsWithAlmacen)
    return productsWithAlmacen
  } catch (error) {
    console.error("Error:", error)
    toast.error("Error al cargar productos")
    return []
  }
}

// Función auxiliar para formatear fechas de manera segura
const formatDate = (date: string | Date | undefined) => {
  if (!date) return "Fecha no disponible"
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    return "Fecha no disponible"
  }
  try {
    return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: es })
  } catch {
    return "Fecha no disponible"
  }
}

function ProductSearch({
  onSelect,
  products,
  isLoading,
}: { onSelect: (product: Product) => void; products: Product[]; isLoading: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Product[]>([])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.almacenVentas.stock > 0, // Quitar el optional chaining "?"
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }, [searchTerm, products])

  return (
    <>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="🔍 Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="absolute mt-1 w-full z-50">
                  <CardContent className="p-2">
                    {results.map((product) => (
                      <Button
                        key={`search-result-${product.id}`}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          onSelect(product)
                          setSearchTerm("")
                          setResults([])
                        }}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 object-cover mr-2 rounded"
                        />
                        <div>
                          <span className="mr-2">{product.category.name}</span>
                          {product.name} - ${product.price}
                          <Badge variant="outline" className="ml-2">
                            Stock: {product.almacenVentas?.stock}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}

function ChangeCalculator({ total }: { total: number }) {
  const [payment, setPayment] = useState<number>(0)
  const change = payment - total

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>💰 Total a pagar</Label>
          <div className="text-2xl font-bold">${total.toFixed(2)}</div>
        </div>
        <div>
          <Label htmlFor="payment">💵 Pago recibido</Label>
          <Input
            id="payment"
            type="number"
            value={payment}
            onChange={(e) => setPayment(Number(e.target.value))}
            className="text-lg"
          />
        </div>
      </div>
      <div className="text-right">
        <Label>🔄 Cambio a devolver</Label>
        <div className={`text-2xl font-bold ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          ${change.toFixed(2)}
        </div>
      </div>
    </div>
  )
}

function MobileMenu({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
          <SheetDescription>Selecciona una opción</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {["venta", "ventas", "caja", "devoluciones", "almacen"].map((tab) => (
            <Button
              key={`mobile-menu-${tab}`}
              variant={activeTab === tab ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab(tab)
              }}
            >
              {tab === "venta" && "🛍️ Nueva Venta"}
              {tab === "ventas" && "📊 Ventas del Día"}
              {tab === "caja" && "💰 Estado de Caja"}
              {tab === "devoluciones" && "↩️ Devoluciones"}
              {tab === "almacen" && "📦 Almacén"}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function EmpleadoPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentSale, setCurrentSale] = useState<Product[]>([])
  const [dailySales, setDailySales] = useState<Sale[]>([])
  const [cashRegister, setCashRegister] = useState({
    initialAmount: 1000,
    currentAmount: 1000,
    sales: 0,
    returns: 0,
  })
  const [activeTab, setActiveTab] = useState("venta")
  const [pendingReturns, setPendingReturns] = useState<number[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Función para cargar ventas dentro del componente
  const fetchSales = async (productsData: Product[]) => {
    try {
      const response = await fetch("/api/sales")
      const salesData: Sale[] = await response.json()
      console.log("Datos de ventas recibidos:", salesData) // Log de ventas recibidas

      const enhancedSalesData = salesData.map((sale: any) => ({
        ...sale,
        products: sale.products.map((saleProduct: any) => {
          console.log("Procesando saleProduct:", saleProduct) // Log de cada saleProduct
          const productId = saleProduct.productId || saleProduct.product?.id?.toString()
          const matchedProduct = productsData.find((p) => p.id === productId)

          if (!matchedProduct) {
            console.warn(`Producto con ID ${productId} no encontrado.`)
            return {
              ...saleProduct,
              name: "Producto desconocido",
              image: "/placeholder.svg",
            }
          }

          return {
            ...saleProduct,
            name: matchedProduct.name,
            image: matchedProduct.image,
          }
        }),
      }))

      setDailySales(enhancedSalesData)
      console.log("Ventas mejoradas:", enhancedSalesData)
    } catch (error) {
      console.error("Error al obtener las ventas:", error)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // Declaración única de productsData
        const productsData = await fetchProducts()
        setProducts(productsData)
        console.log('Productos cargados:', productsData)
        await fetchSales(productsData) // Usar la variable ya declarada
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])


  if (!mounted) {
    return null
  }

  const handleAddProduct = (product: Product) => {
    const existingProduct = currentSale.find((item) => item.id === product.id)

    if (existingProduct) {
      if (existingProduct.quantity >= product.almacenVentas?.stock) {
        toast.error("⚠️ No hay suficiente stock disponible")
        return
      }
      setCurrentSale(
        currentSale.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setCurrentSale([...currentSale, { ...product, quantity: 1 }])
    }
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId)
    if (product && quantity > product.almacenVentas?.stock) {
      toast.error("⚠️ No hay suficiente stock disponible")
      return
    }

    if (quantity === 0) {
      setCurrentSale(currentSale.filter((item) => item.id !== productId))
    } else {
      setCurrentSale(currentSale.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  const calculateTotal = () => {
    return currentSale.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
  }

  const handleCompleteSale = async (paymentMethod: string) => {
    try {
      const saleData = {
        products: currentSale.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        total: calculateTotal(),
        paymentMethod,
        status: "completed",
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Error al procesar la venta")
      }

      const savedSale: Sale = await res.json()
      console.log('Venta guardada:', savedSale)

      // Actualizar el stock localmente
      const updatedProducts = products.map(p => {
        const soldProduct = currentSale.find(item => item.id === p.id);
        if (soldProduct) {
          return {
            ...p,
            almacenVentas: {
              ...p.almacenVentas,
              stock: p.almacenVentas.stock - soldProduct.quantity
            }
          };
        }
        return p;
      });

      setProducts(updatedProducts);

      // Mapear los productos de la venta con los datos completos
      const enhancedSale: Sale = {
        ...savedSale,
        products: savedSale.products.map((sp) => ({
          ...sp,
          product: {
            id: sp.product?.id || sp.productId,
            name: sp.product?.name || 'Producto no encontrado',
            image: sp.product?.image || '/placeholder.svg'
          }
        }))
      }

      setDailySales(prev => [...prev, enhancedSale])
      setCurrentSale([])
      setCashRegister((prev) => ({
        ...prev,
        currentAmount: prev.currentAmount + calculateTotal(),
        sales: prev.sales + 1,
      }))
      toast.success("✅ Venta realizada con éxito")
    } catch (error) {
      console.error(error)
      toast.error("Error al completar la venta")
    }
  }

  const handleReturn = (saleId: number) => {
    const sale = dailySales.find((s) => s.id === saleId)
    if (!sale || sale.status === "returned") return

    if (pendingReturns.includes(saleId)) {
      setDailySales(dailySales.map((s) => (s.id === saleId ? { ...s, status: "returned" } : s)))
      setPendingReturns(pendingReturns.filter((id) => id !== saleId))
      setCashRegister((prev) => ({
        ...prev,
        currentAmount: prev.currentAmount - sale.total,
        returns: prev.returns + 1,
      }))
      toast.success("↩️ Devolución procesada con éxito")
    } else {
      setPendingReturns([...pendingReturns, saleId])
      toast.success("📩 Solicitud de devolución enviada")
    }
  }

  const sendWhatsAppMessage = (sale: Sale) => {
    const phoneNumber = "5354710329"
    const message = `Solicitud de devolución:
Venta #${sale.id}
Productos: ${sale.products.map((p) => `${p.quantity}x ${p.product?.name || "Producto no encontrado"}`).join(", ")}
Total: $${sale.total.toFixed(2)}
Causa: [Por favor, especifique la causa de la devolución]`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank")
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏪 Panel de Empleado</h1>
        <div className="flex items-center space-x-2">
          <MobileMenu activeTab={activeTab} setActiveTab={setActiveTab} />
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden md:grid w-full grid-cols-5">
          <TabsTrigger value="venta">🛍️ Nueva Venta</TabsTrigger>
          <TabsTrigger value="ventas">📊 Ventas del Día</TabsTrigger>
          <TabsTrigger value="caja">💰 Estado de Caja</TabsTrigger>
          <TabsTrigger value="devoluciones">↩️ Devoluciones</TabsTrigger>
          <TabsTrigger value="almacen">📦 Almacén</TabsTrigger>
        </TabsList>

        <TabsContent value="venta">
          <motion.div
            key="venta-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>🛍️ Nueva Venta</CardTitle>
                  <CardDescription>Agrega productos a la venta actual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProductSearch onSelect={handleAddProduct} products={products} isLoading={isLoading} />

                  {currentSale.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentSale.map((item) => (
                            <TableRow key={`current-sale-item-${item.id}`}>
                              <TableCell>
                                <div className="flex items-center">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-10 h-10 object-cover mr-2 rounded"
                                  />
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                                  min={0}
                                  max={products.find((p) => p.id === item.id)?.almacenVentas?.stock}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                              <TableCell>${(Number(item.price) * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                {currentSale.length > 0 && (
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="text-2xl font-bold">Total: ${calculateTotal().toFixed(2)}</div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full sm:w-auto">
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculadora
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>🧮 Calculadora de Cambio</DialogTitle>
                          </DialogHeader>
                          <ChangeCalculator total={calculateTotal()} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="default" className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Completar Venta
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>💰 Completar Venta</DialogTitle>
                            <DialogDescription>Selecciona el método de pago para completar la venta</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => handleCompleteSale("efectivo")} className="h-24">
                              💵<br />
                              Efectivo
                            </Button>
                            <Button onClick={() => handleCompleteSale("tarjeta")} className="h-24">
                              💳<br />
                              Tarjeta
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardFooter>
                )}
              </Card>

              <Card className="hidden md:block">
                <CardHeader>
                  <CardTitle>📝 Últimas Ventas</CardTitle>
                  <CardDescription>Ventas más recientes del día</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-[100px] w-full" />
                        <Skeleton className="h-[100px] w-full" />
                        <Skeleton className="h-[100px] w-full" />
                      </>
                    ) : (
                      dailySales
                        .filter((sale) => sale.status !== "returned")
                        .slice(-5)
                        .reverse()
                        .map((sale) => (
                          <Card key={`recent-sale-${sale.id}`}>
                            <CardHeader className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="font-semibold">
                                  Venta #{sale.id} - {formatDate(sale.createdAt)}
                                </div>
                                <Badge>
                                  {sale.paymentMethod === "efectivo" ? "💵" : "💳"}
                                  {sale.paymentMethod}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="font-bold">${sale.total.toFixed(2)}</div>
                              <div className="mt-2">
                                {sale.products.map((product) => (
                                  <div
                                    key={`recent-sale-${sale.id}-product-${product.product?.id}`}
                                    className="flex items-center mt-1"
                                  >
                                    <img
                                      src={product.product?.image || "/placeholder.svg"}
                                      alt={product.product?.name || "Producto no encontrado"}
                                      className="w-8 h-8 object-cover mr-2 rounded"
                                    />

                                    <span>
                                      {product.quantity}x {product.product?.name || "Producto no encontrado"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="ventas">
          <motion.div
            key="ventas-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>📊 Ventas del Día</CardTitle>
                <CardDescription>{format(new Date(), "PPPP", { locale: es })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>🆔 ID</TableHead>
                          <TableHead>🕒 Hora</TableHead>
                          <TableHead>🛒 Productos</TableHead>
                          <TableHead>💰 Total</TableHead>
                          <TableHead>💳 Método</TableHead>
                          <TableHead>🚦 Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailySales.map((sale) => (
                          <TableRow key={`daily-sale-${sale.id}`}>
                            <TableCell>#{sale.id}</TableCell>
                            <TableCell>{formatDate(sale.createdAt)}</TableCell>
                            <TableCell>
                              {sale.products.map((p) => (
                                <div key={`daily-sale-${sale.id}-product-${p.product?.id}`} className="flex items-center mb-1">
                                  <img
                                    src={p.product?.image || "/placeholder.svg"}
                                    alt={p.product?.name || "Producto no encontrado"}
                                    className="w-8 h-8 object-cover mr-2 rounded"
                                  />
                                  <span>
                                    {p.quantity}x {p.product?.name || "Producto no encontrado"}
                                  </span>
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>${sale.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {sale.paymentMethod === "efectivo" ? "💵" : "💳"}
                                {sale.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {sale.status === "returned" ? (
                                <Badge variant="destructive">Devuelto</Badge>
                              ) : (
                                <Badge variant="default">Completado</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="caja">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>💰 Estado de Caja</CardTitle>
                <CardDescription>{format(new Date(), "PPPP", { locale: es })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>💵 Fondo Inicial</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${cashRegister.initialAmount.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>🛒 Ventas Realizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">
                        {dailySales.reduce((acc, sale) => acc + sale.total, 0).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>↩️ Devoluciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">
                        {dailySales.filter(sale => sale.status === "returned").length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>💰 Total en Caja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        $
                        {(
                          cashRegister.initialAmount +
                          dailySales.reduce((acc, sale) => acc + sale.total, 0) -
                          dailySales.filter(sale => sale.status === "returned").length * 10 // Suponiendo un monto fijo por devolución
                        ).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="devoluciones">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>↩️ Devoluciones</CardTitle>
                <CardDescription>Gestionar devoluciones de ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>🆔 ID</TableHead>
                        <TableHead>🕒 Fecha y Hora</TableHead>
                        <TableHead>🛒 Productos</TableHead>
                        <TableHead>💰 Total</TableHead>
                        <TableHead>🚦 Estado</TableHead>
                        <TableHead>🔄 Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailySales
                        .filter((sale) => sale.status !== "returned")
                        .map((sale) => (
                          <TableRow key={`sale-${sale.id}`}>
                            <TableCell>#{sale.id}</TableCell>
                            <TableCell>{formatDate(sale.createdAt)}</TableCell>
                            <TableCell>
                              {sale.products.map((p) => (
                                <div key={`daily-sale-${sale.id}-product-${p.product?.id}`} className="flex items-center mb-1">
                                  <img
                                    src={p.product?.image || "/placeholder.svg"}
                                    alt={p.product?.name || "Producto no encontrado"}
                                    className="w-8 h-8 object-cover mr-2 rounded"
                                  />
                                  <span>
                                    {p.quantity}x {p.product?.name || "Producto no encontrado"}
                                  </span>
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>${sale.total.toFixed(2)}</TableCell>
                            <TableCell>
                              {pendingReturns.includes(sale.id) ? (
                                <Badge variant="secondary">Pendiente</Badge>
                              ) : (
                                <Badge variant="default">Completado</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Undo2 className="mr-2 h-4 w-4" />
                                    {pendingReturns.includes(sale.id) ? "Procesar Devolución" : "Solicitar Devolución"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {pendingReturns.includes(sale.id)
                                        ? "Procesar Devolución"
                                        : "Solicitar Devolución"}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {pendingReturns.includes(sale.id)
                                        ? "¿Estás seguro de que deseas procesar la devolución de esta venta?"
                                        : "¿Deseas enviar una solicitud de devolución para esta venta?"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    {pendingReturns.includes(sale.id) ? (
                                      <Button variant="destructive" onClick={() => handleReturn(sale.id)}>
                                        Confirmar Devolución
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() => {
                                          sendWhatsAppMessage(sale)
                                          handleReturn(sale.id)
                                        }}
                                      >
                                        Solicitar Devolución
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="almacen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>📦 Estado del Almacén</CardTitle>
                <CardDescription>Inventario actual en el almacén de ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="🔍 Buscar productos..." className="pl-8" />
                    </div>
                    <Select defaultValue="todos">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">📁 Todas las categorías</SelectItem>
                        <SelectItem value="electronicos">📱 Electrónicos</SelectItem>
                        <SelectItem value="computadoras">💻 Computadoras</SelectItem>
                        <SelectItem value="gaming">🎮 Gaming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    {isLoading ? (
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>📝 Producto</TableHead>
                            <TableHead>📁 Categoría</TableHead>
                            <TableHead>💰 Precio</TableHead>
                            <TableHead>📦 Stock</TableHead>
                            <TableHead>⚠️ Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence mode="sync">
                            {products.map((product) => (
                              <motion.tr
                                key={`product-${product.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="group hover:bg-muted/50 transition-colors"
                              >
                                <TableCell>
                                  <div className="flex items-center">
                                    <img
                                      src={product.image || "/placeholder.svg"}
                                      alt={product.name}
                                      className="w-10 h-10 object-cover mr-2 rounded"
                                    />
                                    {product.name}
                                  </div>
                                </TableCell>
                                <TableCell>{product.category.name}</TableCell>
                                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                <TableCell>{product.almacenVentas?.stock}</TableCell>
                                <TableCell>
                                  {product.almacenVentas?.stock < 5 ? (
                                    <Badge variant="destructive" className="animate-pulse">
                                      ⚠️ Stock Bajo
                                    </Badge>
                                  ) : (
                                    <Badge variant="default">✅ Normal</Badge>
                                  )}
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
                    <div>Mostrando {products.length} productos</div>
                    <div>Última actualización: {format(new Date(), "PPpp", { locale: es })}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

