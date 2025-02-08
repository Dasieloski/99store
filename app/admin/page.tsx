"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Loader2 } from "lucide-react"

interface Stats {
  totalCategories: number
  totalProducts: number
  monthlySales: number
  topSellingProducts: { name: string; sales: number }[]
  lowStockProducts: { name: string; stock: number }[]
  salesByCategory: { name: string; value: number }[]
  salesComparison: { month: string; sales: number }[]
  salesByPaymentMethod: { method: string; value: number }[]
  salesByHour: { hour: string; sales: number }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simular una llamada a la API
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const data: Stats = {
          totalCategories: 15,
          totalProducts: 150,
          monthlySales: 50000,
          topSellingProducts: [
            { name: "Producto A", sales: 100 },
            { name: "Producto B", sales: 80 },
            { name: "Producto C", sales: 60 },
            { name: "Producto D", sales: 40 },
            { name: "Producto E", sales: 20 },
          ],
          lowStockProducts: [
            { name: "Producto X", stock: 5 },
            { name: "Producto Y", stock: 3 },
            { name: "Producto Z", stock: 2 },
          ],
          salesByCategory: [
            { name: "Electrónicos", value: 30000 },
            { name: "Ropa", value: 15000 },
            { name: "Hogar", value: 10000 },
            { name: "Deportes", value: 8000 },
            { name: "Libros", value: 7000 },
          ],
          salesComparison: [
            { month: "Mes Anterior", sales: 45000 },
            { month: "Mes Actual", sales: 50000 },
          ],
          salesByPaymentMethod: [
            { method: "Tarjeta de Crédito", value: 30000 },
            { method: "Efectivo", value: 10000 },
            { method: "Transferencia", value: 5000 },
            { method: "PayPal", value: 5000 },
          ],
          salesByHour: [
            { hour: "9:00", sales: 1000 },
            { hour: "12:00", sales: 2000 },
            { hour: "15:00", sales: 1500 },
            { hour: "18:00", sales: 2500 },
            { hour: "21:00", sales: 1000 },
          ],
        }
        setStats(data)
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Ocurrió un error inesperado.")
        } else {
          setError("Ocurrió un error inesperado.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <motion.h1
        className="text-3xl font-bold"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        👋 ¡Bienvenido al Panel de Administración! 🎉
      </motion.h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorías Totales 🗂️</CardTitle>
                  <span className="text-2xl">📁</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCategories} 🏷️</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Totales 🛍️</CardTitle>
                  <span className="text-2xl">📦</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProducts} 🎁</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Mensuales 💰</CardTitle>
                  <span className="text-2xl">💵</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.monthlySales.toLocaleString()} 🚀</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Producto Más Vendido 🏆</CardTitle>
                  <span className="text-2xl">🥇</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.topSellingProducts[0].name}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.topSellingProducts[0].sales} unidades vendidas
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Productos Más Vendidos 📊🛍️</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.topSellingProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Inventario Bajo 📉</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {stats?.lowStockProducts.map((product) => (
                      <li key={product.name} className="flex justify-between items-center">
                        <span>{product.name}</span>
                        <span className="text-red-500 font-bold">{product.stock} unidades</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría 🍰</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats?.salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats?.salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Comparativa de Ventas 📈</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.salesComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Método de Pago 💳</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats?.salesByPaymentMethod}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats?.salesByPaymentMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Hora ⏰</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.salesByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}

