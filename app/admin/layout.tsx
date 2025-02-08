"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // Recuperar preferencia de tema
    const isDark = localStorage.getItem("adminDarkMode") !== "false"
    setDarkMode(isDark)
    document.documentElement.classList.toggle("dark", isDark)

    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("adminDarkMode", (!darkMode).toString())
  }

  if (!isMounted) {
    return null
  }

  // Si estamos en la página de login, renderizar solo los children sin el AdminLayout
  if (pathname === "/admin/auth/login") {
    return <>{children}</>
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/admin/auth/login")
      } else {
        console.error("Error al cerrar sesión")
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const menuItems = [
    { path: "/admin", label: "📊 Dashboard", emoji: "📊" },
    { path: "/admin/categories", label: "📁 Categorías", emoji: "📁" },
    { path: "/admin/products", label: "📦 Productos", emoji: "📦" },
    { path: "/admin/offers", label: "🔥 Ofertas", emoji: "🔥" },
    { path: "/admin/currencies", label: "💰 Monedas", emoji: "💰" },
    { path: "/admin/gran-almacen", label: "🏭 Gran Almacén", emoji: "🏭" },
    { path: "/admin/almacen-ventas", label: "🏪 Almacén de Ventas", emoji: "🏪" },
    { path: "/admin/warehouse-transfer", label: "🚚 Transferencia de Almacén", emoji: "🚚" },
    { path: "/admin/historial", label: "📜 Historial", emoji: "📜" },
    { path: "/admin/carts", label: "🛒 Carritos de Clientes", emoji: "🛒" },
    { path: "/admin/devoluciones", label: "🔄 Devoluciones", emoji: "🔄" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle>⚡ Menú Admin</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-4">
                  {menuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button variant={pathname === item.path ? "secondary" : "ghost"} className="w-full justify-start">
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/admin">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                ⚡ Admin Dashboard
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-xl">
              {darkMode ? "🌙" : "☀️"}
            </Button>
            <Link href="/" className="hidden sm:block">
              <Button variant="ghost">🏪 Ver tienda</Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout} className="hidden sm:flex">
              🚪 Cerrar sesión
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  👤
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-2">
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start">
                      🏪 Ver tienda
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleLogout} className="w-full justify-start">
                    🚪 Cerrar sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <div className="flex min-h-[calc(100vh-73px)]">
        <aside className="hidden lg:block w-64 border-r p-4 space-y-2">
          <AnimatePresence>
            {menuItems.map((item) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Link href={item.path}>
                  <Button variant={pathname === item.path ? "secondary" : "ghost"} className="w-full justify-start">
                    {item.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

