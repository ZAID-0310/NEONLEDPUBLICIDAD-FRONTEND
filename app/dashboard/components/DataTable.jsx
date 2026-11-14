"use client"

import { getCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, Pencil, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { safeJsonParse } from "@/lib/safe-json"

const headerLabels = {
  id_empleado: "ID",
  nombre: "Nombre",
  apellido: "Apellido",
  email: "Email",
  dni: "DNI",
  telefono: "Teléfono",
  rol: "Rol",
};

export default function DataTable({ headers, data, onDelete, onUpdate, onShow }) {
  const router = useRouter()
  const [expandedRow, setExpandedRow] = useState(null)

  const empleadoCookie = getCookie("empleado")
  const empleadoAutenticado = safeJsonParse(empleadoCookie, null)
  const empleadoAutenticadoId = empleadoAutenticado?.id_empleado
  const empleadoAutenticadoEmail = empleadoAutenticado?.email

  const restrictedEmails = ["joseluisjlgd123@gmail.com", "keving.kpg@gmail.com", "tmlighting@hotmail.com"]
  
  const isPrivilegedUser = empleadoAutenticadoEmail === "tmlighting@hotmail.com"

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  const verificarEditDelete = (dataRow) => {
    // si el usuario es privilegiado, permitir editar cualquier registro
    if (isPrivilegedUser) return true
    
    // permitir que el usuario edite su propio perfil
    if (empleadoAutenticadoId && dataRow.id_empleado === empleadoAutenticadoId) return true
    
    // en cualquier otro caso, se debe verificar si es un email restringido
    return !restrictedEmails.includes(dataRow.email)
  }

  const renderMobileView = () => {
    return (
      <div className="grid gap-4 md:hidden ">
        {data.map((dataRow, index) => {
          const isEmpleadoAutenticado = empleadoAutenticadoId && dataRow.id_empleado === empleadoAutenticadoId
          const canEditDelete = verificarEditDelete(dataRow)

          return (
            <Card
              key={dataRow.id || `card-${index}`}
              className={`overflow-hidden ${isEmpleadoAutenticado ? "border-[#8c52ff] border-2 dark:bg-gray-900" : "border-gray-200"}`}
            >
              <div className={`p-3 ${isEmpleadoAutenticado ? "bg-[#f0ebff] dark:bg-gray-900" : "bg-white"}`}>
                {headers.slice(0, 2).map((header) => (
                  <div key={`mobile-${dataRow.id}-${header}`} className="mb-1">
                    <span className="font-semibold text-xs text-gray-500 dark:bg-gray-900">{header.toUpperCase()}: </span>
                    <span className="font-medium dark:bg-gray-900">{dataRow[header]}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRowExpansion(index)}
                    className="text-xs text-[#8c52ff] hover:text-[#6c3dbf] p-0 h-auto"
                  >
                    {expandedRow === index ? "Ver menos" : "Ver más"}
                  </Button>

                  <div className="flex space-x-1">
                    {!isEmpleadoAutenticado && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#8c52ff]"
                        onClick={() => onShow(dataRow.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {!isEmpleadoAutenticado && onUpdate && canEditDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500"
                        onClick={() => onUpdate(dataRow.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    {isEmpleadoAutenticado && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#305dfe]"
                        onClick={() => router.push("/dashboard/main")}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    )}

                    {!isEmpleadoAutenticado && onDelete && canEditDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => onDelete(dataRow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {expandedRow === index && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  {headers.slice(2).map((header) => (
                    <div key={`mobile-expanded-${dataRow.id}-${header}`} className="mb-1">
                      <span className="font-semibold text-xs text-gray-500">{header.toUpperCase()}: </span>
                      <span className="font-medium">{dataRow[header]}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    )
  }

  const renderDesktopView = () => {
    return (
      <div className="hidden md:block overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <Table>
          <TableHeader className="bg-blue-600">
            <TableRow className="hover:bg-blue-600">
              {headers.map((header) => (
                <TableHead
                  key={`header-${header}`}
                  className="px-3 py-5 text-center font-medium text-white"
                >
                  {headerLabels[header] || header}
                </TableHead>
              ))}
              <TableHead className="whitespace-nowrap px-3 py-5 text-center font-medium text-white">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((dataRow, index) => {
              const isEmpleadoAutenticado = empleadoAutenticadoId && dataRow.id_empleado === empleadoAutenticadoId;
              const canEditDelete = verificarEditDelete(dataRow);
              
              return (
                <TableRow 
                  key={dataRow.id || `row-${index}`}
                  className={`${
                    isEmpleadoAutenticado 
                      ? "bg-[#caeafe] text-black" 
                      : index % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  {headers.map((header) => (
                    <TableCell
                      key={`${dataRow.id}-${header}`}
                      className={`px-3 py-5 text-center ${
                        header === "nombre" || header === "apellido"
                          ? "whitespace-nowrap"
                          : header === "email"
                            ? "break-all"
                            : ""
                      }`}
                    >
                      {dataRow[header]}
                    </TableCell>
                  ))}
                  <TableCell className="whitespace-nowrap px-3 py-5 text-center">
                    <div className="flex justify-center space-x-1">
                      {!isEmpleadoAutenticado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#7794ff] hover:text-[#ca53e7] hover:bg-[#f0ebff]"
                          onClick={() => onShow(dataRow.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver perfil</span>
                        </Button>
                      )}

                      {!isEmpleadoAutenticado && onUpdate && canEditDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => onUpdate(dataRow.id)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      )}

                      {isEmpleadoAutenticado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#305dfe] hover:text-[#3e329a] hover:bg-blue-50"
                          onClick={() => router.push("/dashboard/main")}
                        >
                          <User className="h-4 w-4" />
                          <span className="sr-only">Ver mi perfil</span>
                        </Button>
                      )}

                      {!isEmpleadoAutenticado && onDelete && canEditDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(dataRow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  )
}