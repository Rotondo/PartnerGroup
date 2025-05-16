import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  BarChart3, 
  Handshake, 
  Users, 
  Settings, 
  Menu, 
  X 
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Oportunidades",
      href: "/opportunities",
      icon: <Handshake className="h-5 w-5" />,
    },
    {
      title: "Parceiros",
      href: "/partners",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card shadow-lg transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-20 items-center border-b px-6">
          <h2 className="text-xl font-bold">A8 Partnership Hub</h2>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={closeSidebar}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium">Grupo A&EIGHT</p>
              <p className="text-xs text-muted-foreground">Dashboard de Parcerias</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
