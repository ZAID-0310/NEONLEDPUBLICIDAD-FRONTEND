"use client";
import { useState, useEffect } from "react";
import DropdownLink from "./components/DropdownLink";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AutContext";
import auth_service from "@/app/dashboard/users/services/auth.service";
import { dashboardLinks } from "@/app/dashboard/dashboardLinks/dashboardLinks";
import { ChevronDown } from "lucide-react";
import { getCookie } from "cookies-next";
import { safeJsonParse } from "@/lib/safe-json";
import styles from "./Header.module.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { LogOut } from "lucide-react";
import { Button } from "../../../../components/ui/button";

export default function Header() {
  const [menuActive, setMenuActive] = useState(false);
  const [containerFullHeight, setContainerFullHeight] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [menuInitialized, setMenuInitialized] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(
    "/header_footer/Logo.oficial.Neon.Led.Publicidad.webp",
  );
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Filtrado de los links segun permisos y roles del usuario
  const filterLinks = dashboardLinks.filter((item) => {
  const hasPermission = !item.permission || auth_service.hasPermission(item.permission);
  
  let hasRole = true;
  if (item.roles && item.roles.length > 0) {
    hasRole = item.roles.some((rolPermitido) => auth_service.hasRole(rolPermitido));
  }
  
  return hasPermission && hasRole;
});

  useEffect(() => {
    const savedMenuState = localStorage.getItem("menuActive");
    if (savedMenuState !== null) {
      setMenuActive(Boolean(safeJsonParse(savedMenuState, false)));
    }

    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 850) {
        setIsSmallScreen(true);
        if (!menuInitialized) {
          setMenuInitialized(true);
          if (!savedMenuState) {
            setMenuActive(true);
          }
          setContainerFullHeight(true);
        }
      } else {
        setCurrentMenu("main");
        setIsSmallScreen(false);
        setMenuActive(false);
        setContainerFullHeight(false);
        setMenuInitialized(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuInitialized]);

  useEffect(() => {
    localStorage.setItem("menuActive", JSON.stringify(menuActive));
    if (menuActive) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [menuActive]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1281) {
        setLogoSrc("/header_footer/Logo.oficial.Neon.Led.Publicidad.webp");
      } else if (width >= 769 && width <= 1280) {
        setLogoSrc("/header_footer/Logo_corto_nlp_header.webp");
      } else {
        setLogoSrc("/header_footer/Logo.oficial.Neon.Led.Publicidad.webp");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsPanelOpen(false);
    }
  }, [isAuthenticated]);

  const toggleMenu = () => {
    if (menuActive) {
      setCurrentMenu("main");
      setContainerFullHeight(false);
    } else {
      setContainerFullHeight(true);
    }
    setMenuActive(!menuActive);
  };

  const goToSubMenu = (menu) => {
    setCurrentMenu(menu);
  };

  const goBack = () => {
    setCurrentMenu("main");
  };

  const isActiveLink = (href) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsPanelOpen(false);
    setLogoutDialogOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="h-[100px]" style={{ willChange: "transform" }} />
      <header
        className={`h-[100px] bg-[#000017] flex items-center fixed top-0 left-0 right-0 z-[1000] w-full ${
          isSmallScreen
            ? "justify-between px-4"
            : "justify-center px-8 lg:px-16 xl:px-32"
        }`}
      >
        {currentMenu === "main" ? (
          <div
            className={`
            transition-all duration-300
            ${
              isSmallScreen
                ? "absolute left-1/2 transform -translate-x-1/2 w-28"
                : "absolute left-8 md:left-15 lg:left-20 xl:left-30"
            }
          `}
          >
            {!isSmallScreen && (
              <a href="/">
                <img
                  src={logoSrc}
                  alt="Logotipo de Neon Led Publicidad"
                  title="Neon Led Publicidad especialistas en letreros led"
                  width={213}
                  height={75}
                  className={`
          object-contain transition-transform duration-300 will-change-transform
          ${logoSrc.includes("Logo_corto_nlp_header") ? "w-[52px]" : "w-[144px]"}
        `}
                />
              </a>
            )}

            {isSmallScreen && (
              <a href="/">
                <img
                  src="/header_footer/Logo.oficial.Neon.Led.Publicidad.webp"
                  alt="Logotipo móvil Neon Led Publicidad"
                  width="213"
                  height="75"
                  className="w-[144px] h-auto cursor-pointer object-contain"
                />
              </a>
            )}
          </div>
        ) : (
          <div
            className={`
            flex items-center absolute left-2 lg:left-8
            ${isSmallScreen ? "w-20" : "w-32"}
          `}
          >
            <a
              href="#"
              onClick={goBack}
              className="text-white font-bold cursor-pointer text-sm lg:text-base"
            >
              &lt; Volver
            </a>
          </div>
        )}

        <nav
          className={`
          items-center transition-all
          ${isSmallScreen ? "hidden" : "flex gap-8 lg:gap-10 xl:gap-16"}
        `}
        >
          <a
            href="/"
            className={`transition-colors ${
              isActiveLink("/")
                ? "text-blue-400"
                : "text-white hover:text-gray-300"
            }`}
          >
            INICIO
          </a>

          <a
            href="/nosotros"
            className={`transition-colors ${
              isActiveLink("/nosotros")
                ? "text-blue-400"
                : "text-white hover:text-gray-300"
            }`}
          >
            NOSOTROS
          </a>

          <a
            href="/productos"
            className={`transition-colors ${
              isActiveLink("/productos")
                ? "text-blue-400"
                : "text-white hover:text-gray-300"
            }`}
          >
            PRODUCTOS
          </a>

          <a
            href="/contacto"
            className={`transition-colors ${
              isActiveLink("/contacto")
                ? "text-blue-400"
                : "text-white hover:text-gray-300"
            }`}
          >
            CONTACTO
          </a>

          <a
            href="/blog"
            className={`transition-colors ${
              isActiveLink("/blog")
                ? "text-blue-400"
                : "text-white hover:text-gray-300"
            }`}
          >
            BLOG
          </a>
          {/*----- Panel options -----*/}
          {isAuthenticated ? (
            <li
              className={`relative cursor-pointer list-none ${
                isActiveLink("/login") || isActiveLink("/dashboard/main")
                  ? "text-blue-400"
                  : "text-white hover:text-gray-300"
              }`}
              onClick={() => setIsPanelOpen((prev) => !prev)}
            >
              <p className="flex items-center gap-1">
                Panel{" "}
                <ChevronDown
                  className="w-4 h-4"
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
              </p>

              {isPanelOpen && (
                <ul
                  className={`${styles.minimalscrollbar}
          absolute right-0 mt-2 bg-[#000017] rounded-lg shadow-lg text-white w-56 z-[99999]
          max-h-[80vh]
          overflow-y-auto
          overflow-x-hidden`}
                >
                  {filterLinks.map((link) => (
                    <li key={link.href} className="px-4 py-2 hover:bg-blue-600">
                      <a
                        href={link.href}
                        className="block"
                        onClick={() => setIsPanelOpen(false)}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}

                  <li className="px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white">
                    <a
                      href="#"
                      className="block"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        setIsPanelOpen(false);
                        setLogoutDialogOpen(true);
                      }}
                    >
                      Cerrar sesión
                    </a>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <a
              href="/login"
              className={`transition-colors ${
                isActiveLink("/login")
                  ? "text-blue-400"
                  : "text-white hover:text-gray-300"
              }`}
            >
              Ingresar
            </a>
          )}
        </nav>

        {isSmallScreen && (
          <div
            className="flex items-center cursor-pointer"
            onClick={toggleMenu}
          >
            <span
              className={`text-white mr-2 ${
                menuActive ? "text-base" : "text-2xl"
              }`}
            >
              {menuActive && currentMenu === "main"
                ? "Cerrar"
                : !menuActive
                  ? "\u2630"
                  : ""}
            </span>
            {menuActive && currentMenu === "main" && (
              <div className="w-10 h-10 bg-gradient-to-r from-[--azul_brillante] to-[--azul_intenso] flex items-center justify-center relative">
                <div className="relative w-8 h-8 bg-[--azul_oscuro]">
                  <div className="absolute w-4/5 h-0.5 bg-white top-1/2 left-1 transform -translate-y-1/2 rotate-45"></div>
                  <div className="absolute w-4/5 h-0.5 bg-white top-1/2 left-1 transform -translate-y-1/2 -rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <div
        className={`
          fixed top-[100px] left-0 right-0 h-[calc(100vh-100px)] 
          bg-gradient-to-r from-[--azul_brillante] to-[--azul_intenso]
          flex flex-col overflow-y-auto z-[9999] scrollbar-hidden
          transition-all duration-300 ease-in-out
          ${
            menuActive
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }
          ${!isSmallScreen ? "hidden" : ""}
        `}
      >
        {currentMenu === "main" && (
          <>
            <DropdownLink
              text={"Inicio"}
              link={"/"}
              isInicio={true}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
              }}
            />
            <DropdownLink
              text={"Nosotros"}
              link={"/nosotros"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
              }}
            />
            <DropdownLink
              text={"Productos"}
              link={"/productos"}
              isInicio={false}
              final={false}
              onClick={() => goToSubMenu("productos")}
            />
            <DropdownLink
              text={"Contacto"}
              link={"/contacto"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
              }}
            />
            <DropdownLink
              text={"Blog"}
              link={"/blog"}
              isInicio={false}
              final={true}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
              }}
            />
            {!isAuthenticated ? (
              <DropdownLink
                text={"Login"}
                link={"/login"}
                isInicio={false}
                final={false}
                closeMenu={() => {
                  setMenuActive(false);
                  setContainerFullHeight(false);
                }}
              />
            ) : (
              <DropdownLink
                text={"Panel"}
                link={"#"}
                isInicio={false}
                final={false}
                onClick={() => goToSubMenu("panel")}
              />
            )}
          </>
        )}
        {currentMenu === "productos" && (
          <>
            <DropdownLink
              text={"Todos los productos"}
              link={"/productos"}
              isInicio={true}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Letras de acrílico"}
              link={"/productos/letras-acrilico"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Letras aluminio doradas 3D"}
              link={"/productos/letras-doradas"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Letras aluminio plateadas 3D"}
              link={"/productos/letras-plateadas"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Letreros luminosos"}
              link={"/productos/letreros-luminosos"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Letras de Neón"}
              link={"/productos/letras-neon"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Neón Led"}
              link={"/productos/neon-led"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Impresión en vinilos decorativos"}
              link={"/productos/impresion-vinilo"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Menú Board"}
              link={"/productos/menu-board"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Letras pintadas en MDF"}
              link={"/productos/letras-pintadas"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Displays"}
              link={"/productos/displays"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Pantallas Led"}
              link={"/productos/pantalla-led"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Hológrafico"}
              link={"/productos/holografico"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Pixel Led"}
              link={"/productos/pixel-led"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Sillas Luminosas"}
              link={"/productos/sillas-luminosas"}
              isInicio={false}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
            <DropdownLink
              text={"Techos Led"}
              link={"/productos/techos-led"}
              isInicio={false}
              final={true}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />
          </>
        )}
        {currentMenu === "panel" && (
          <>
            <DropdownLink
              text={"Panel"}
              link={"/dashboard/main"}
              isInicio={true}
              final={false}
              closeMenu={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
              }}
            />

            {filterLinks.map((link) => (
              <DropdownLink
                key={`${link.href}-${link.title}`} 
                text={link.title}
                link={link.href}
                isInicio={false}
                final={false}
                closeMenu={() => {
                  setMenuActive(false);
                  setContainerFullHeight(false);
                  setCurrentMenu("main");
                }}
              />
            ))}

            <DropdownLink
              text={"Cerrar sesión"}
              link={"#"}
              isInicio={false}
              final={true}
              onClick={() => {
                setMenuActive(false);
                setContainerFullHeight(false);
                setCurrentMenu("main");
                setLogoutDialogOpen(true);
              }}
            />
          </>
        )}
        <div className="flex-1 bg-gradient-to-b from-blue-500 to-blue-800 flex justify-center items-center min-h-[400px] pt-16 pb-16">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
            <img
              className="w-20 h-20 object-contain"
              src="/header_footer/logo_azul_letraNegra_ledneonpublicidad2.webp"
              alt="Logotipo de Neon LED Publicidad con letras negras"
            />
          </div>
        </div>
      </div>
      <>
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent>
            <div className="flex justify-center mb-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <LogOut className="w-7 h-7 text-red-600" />
              </div>
            </div>

            <DialogHeader className="items-center text-center">
              <DialogTitle>
                ¿Estás seguro de que deseas cerrar sesión?
              </DialogTitle>

              <DialogDescription>
                Tendrás que volver a iniciar sesión para acceder al panel.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setLogoutDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setLogoutDialogOpen(false);
                  handleLogout();
                }}
                className="w-full sm:w-auto"
              >
                Cerrar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </>
  );
}
