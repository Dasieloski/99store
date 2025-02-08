"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Calendar } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Mock data for historial
const mockHistorial = [
    {
        id: 1,
        timestamp: new Date("2024-02-05T10:30:00"),
        action: "stock_update",
        details: "Actualización de stock: Smartphone XYZ de 5 a 10 unidades",
        user: "admin@example.com",
        location: "Gran Almacén",
    },
    {
        id: 2,
        timestamp: new Date("2024-02-05T11:15:00"),
        action: "stock_transfer",
        details: "Transferencia: 3 unidades de Laptop Pro al Almacén de Ventas",
        user: "admin@example.com",
        location: "Gran Almacén",
    },
    {
        id: 3,
        timestamp: new Date("2024-02-05T12:00:00"),
        action: "stock_low",
        details: "Alerta: Stock bajo en Auriculares Gaming (2 unidades)",
        user: "sistema",
        location: "Almacén de Ventas",
    },
    {
        id: 4,
        timestamp: new Date("2024-02-05T14:30:00"),
        action: "stock_update",
        details: "Actualización de stock: Smart TV 55' de 15 a 12 unidades",
        user: "vendedor@example.com",
        location: "Almacén de Ventas",
    },
]

const actionTypes = {
    stock_update: { label: "Actualización de Stock", emoji: "📦" },
    stock_transfer: { label: "Transferencia", emoji: "🔄" },
    stock_low: { label: "Alerta de Stock", emoji: "⚠️" },
}

const locations = {
    "Gran Almacén": "🏭",
    "Almacén de Ventas": "🏪",
}

interface FilterState {
    dateRange: { from: Date | undefined; to: Date | undefined }
    actionType: string
    location: string
}

export default function Historial() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [filters, setFilters] = useState<FilterState>({
        dateRange: { from: undefined, to: undefined },
        actionType: "todos",
        location: "todos",
    })

    const clearFilters = () => {
        setFilters({
            dateRange: { from: undefined, to: undefined },
            actionType: "todos",
            location: "todos",
        })
    }

    const getActiveFilterCount = () => {
        let count = 0
        if (filters.dateRange.from || filters.dateRange.to) count++
        if (filters.actionType !== "todos") count++
        if (filters.location !== "todos") count++
        return count
    }

    const filteredHistorial = mockHistorial
        .filter((item) => {
            const matchesSearch =
                item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.user.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesDateRange =
                (!filters.dateRange.from || item.timestamp >= filters.dateRange.from) &&
                (!filters.dateRange.to || item.timestamp <= filters.dateRange.to)

            const matchesActionType = filters.actionType === "todos" || item.action === filters.actionType

            const matchesLocation = filters.location === "todos" || item.location === filters.location

            return matchesSearch && matchesDateRange && matchesActionType && matchesLocation
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Pagination calculations
    const totalFilteredItems = filteredHistorial.length
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = filteredHistorial.slice(startIndex, endIndex)

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

    const formatDate = (date: Date) => {
        return format(date, "PPpp", { locale: es })
    }

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">📜 Historial de Acciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="🔍 Buscar en el historial..."
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
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Registros por página" />
                                </SelectTrigger>
                                <SelectContent>
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
                                        <SheetDescription>Aplica filtros para encontrar registros específicos</SheetDescription>
                                    </SheetHeader>

                                    <div className="py-4 space-y-6">
                                        {/* Filtro por Rango de Fechas */}
                                        <div className="space-y-2">
                                            <Label>📅 Rango de Fechas</Label>
                                            <div className="flex flex-col gap-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {filters.dateRange.from
                                                                ? format(filters.dateRange.from, "PPP", { locale: es })
                                                                : "Seleccionar fecha inicial"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={filters.dateRange.from}
                                                            onSelect={(date) =>
                                                                setFilters((prev) => ({
                                                                    ...prev,
                                                                    dateRange: { ...prev.dateRange, from: date },
                                                                }))
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {filters.dateRange.to
                                                                ? format(filters.dateRange.to, "PPP", { locale: es })
                                                                : "Seleccionar fecha final"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={filters.dateRange.to}
                                                            onSelect={(date) =>
                                                                setFilters((prev) => ({
                                                                    ...prev,
                                                                    dateRange: { ...prev.dateRange, to: date },
                                                                }))
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        {/* Filtro por Tipo de Acción */}
                                        <div className="space-y-2">
                                            <Label>🎯 Tipo de Acción</Label>
                                            <Select
                                                value={filters.actionType}
                                                onValueChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todas las acciones</SelectItem>
                                                    {Object.entries(actionTypes).map(([key, { label, emoji }]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {emoji} {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Filtro por Ubicación */}
                                        <div className="space-y-2">
                                            <Label>📍 Ubicación</Label>
                                            <Select
                                                value={filters.location}
                                                onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar ubicación" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">Todas las ubicaciones</SelectItem>
                                                    {Object.entries(locations).map(([name, emoji]) => (
                                                        <SelectItem key={name} value={name}>
                                                            {emoji} {name}
                                                        </SelectItem>
                                                    ))}
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
                                            Ver {filteredHistorial.length} registros
                                        </Button>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Chips de filtros activos */}
                        {getActiveFilterCount() > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(filters.dateRange.from || filters.dateRange.to) && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        📅 {filters.dateRange.from ? format(filters.dateRange.from, "P", { locale: es }) : "..."} -{" "}
                                        {filters.dateRange.to ? format(filters.dateRange.to, "P", { locale: es }) : "..."}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateRange: { from: undefined, to: undefined },
                                                }))
                                            }
                                        />
                                    </Badge>
                                )}
                                {filters.actionType !== "todos" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {actionTypes[filters.actionType].emoji} {actionTypes[filters.actionType].label}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => setFilters((prev) => ({ ...prev, actionType: "todos" }))}
                                        />
                                    </Badge>
                                )}
                                {filters.location !== "todos" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {locations[filters.location]} {filters.location}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => setFilters((prev) => ({ ...prev, location: "todos" }))}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">📅 Fecha y Hora</TableHead>
                                        <TableHead className="w-[150px]">🎯 Tipo</TableHead>
                                        <TableHead>📝 Detalles</TableHead>
                                        <TableHead className="w-[150px]">👤 Usuario</TableHead>
                                        <TableHead className="w-[150px]">📍 Ubicación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((item) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {actionTypes[item.action].emoji} {actionTypes[item.action].label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.details}</TableCell>
                                            <TableCell>{item.user}</TableCell>
                                            <TableCell>
                                                {locations[item.location]} {item.location}
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {startIndex + 1}-{Math.min(endIndex, totalFilteredItems)} de {totalFilteredItems} registros
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

