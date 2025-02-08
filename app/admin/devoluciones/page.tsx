/* eslint-disable */
"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import {  Dialog, DialogTrigger, 
DialogContent, DialogHeader, DialogTitle, DialogDescription,
 DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Search, SortAsc, SortDesc } from "lucide-react"

import { fetchReturnRequests, authorizeReturnRequest } from "@/lib/api"
import { toast } from "sonner"
import { Sale } from "@prisma/client"


interface ReturnRequest {
  id: number
  saleId: number
  products: any // Define adecuadamente según tu estructura
  total: number
  status: string
  createdAt: string
  updatedAt: string
  sale: Sale
}

export default function DevolucionesPage() {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"id" | "dateTime" | "total">("dateTime")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterTotal, setFilterTotal] = useState<"all" | "less100" | "100to200" | "more200">("all")

  useEffect(() => {
    const loadReturnRequests = async () => {
      try {
        const data = await fetchReturnRequests()
        setReturnRequests(data)
      } catch (error) {
        console.error("Error al cargar devoluciones:", error)
        toast.error("Error al cargar devoluciones")
      } finally {
        setIsLoading(false)
      }
    }

    loadReturnRequests()
  }, [])

  const handleAuthorize = async (id: number) => {
    try {
      const updatedReturn = await authorizeReturnRequest(id, "AUTHORIZED")
      setReturnRequests(prev =>
        prev.map(r => r.id === id ? updatedReturn : r)
      )
      toast.success("Devolución autorizada exitosamente")
    } catch (error) {
      console.error("Error al autorizar devolución:", error)
      toast.error("Error al autorizar devolución")
    }
  }

  const filteredAndSortedRequests = useMemo(() => {
    return returnRequests
      .filter((request) => {
        const matchesSearch =
          request.id.toString().includes(searchTerm.toLowerCase()) ||
          request.products.some((product: any) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

        let matchesFilter = true
        if (filterTotal === "less100") matchesFilter = request.total < 100
        else if (filterTotal === "100to200") matchesFilter = request.total >= 100 && request.total <= 200
        else if (filterTotal === "more200") matchesFilter = request.total > 200

        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [returnRequests, searchTerm, sortField, sortOrder, filterTotal])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">↩️ Solicitudes de Devoluciones</h1>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Buscar por ID o producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <Select value={filterTotal} onValueChange={(value: any) => setFilterTotal(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filtrar por total" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="less100">Menos de $100</SelectItem>
            <SelectItem value="100to200">$100 - $200</SelectItem>
            <SelectItem value="more200">Más de $200</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="dateTime">Fecha y Hora</SelectItem>
            <SelectItem value="total">Total</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
        </Button>
      </motion.div>

      {isLoading ? (
        <p>Cargando devoluciones...</p>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Venta ID</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.saleId}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {request.products.map((product: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <span>
                          {product.name} (x{product.quantity})
                        </span>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>${request.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      request.status === "AUTHORIZED" ? "success" :
                      request.status === "REJECTED" ? "destructive" :
                      "secondary"
                    }>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === "PENDING" ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>✅ Autorizar</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Autorizar Devolución</DialogTitle>
                            <DialogDescription>
                              ¿Estás seguro de que deseas autorizar esta devolución?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="destructive" onClick={() => handleAuthorize(request.id)}>
                              Confirmar Autorización
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button disabled>✅ Autorizada</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </motion.div>
  )
}

