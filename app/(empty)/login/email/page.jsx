// 'use client'

// import axios from 'axios';
// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
// import { useRouter } from 'next/navigation';
// import url from '../../../../api/url';

// const URL_API = `${url}/api/reset_password`;

// export default function Page()  {

//     const [email, setEmail] = useState("");
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!email.trim()) {
//             Swal.fire("Error", "Por favor ingresa tu correo electrónico", "error");
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await axios.post(`${URL_API}`, { email });

//             Swal.fire({
//                 title: "Éxito , Revisa tu Spam",
//                 text: response.data.message,
//                 icon: "success",
//                 timer: 3000,
//                 showConfirmButton: false
//             });

//             setTimeout(() => {
//                 router.push(`/login`);
//             }, 3000); 
//         } catch (error) {
//             Swal.fire("Error", error.response?.data?.message || "Hubo un problema, intenta de nuevo", "error");
//         }
//         setLoading(false);
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//                 <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">
//                     Reestablecimiento de Contraseña
//                 </h1>
//                 <p className="text-gray-600 text-center mb-4">
//                     Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
//                 </p>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <input 
//                         onChange={(e) => setEmail(e.target.value)}
//                         value={email}
//                         type="email"
//                         placeholder="Email"
//                         className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button 
//                         type="submit"
//                         className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-pink-700 transition flex justify-center items-center"
//                         disabled={loading}
//                     >
//                         {loading ? (
//                             <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
//                         ) : (
//                             "Enviar"
//                         )}
//                     </button>
//                 </form>
//                 <div className="text-center mt-4">
//                     <a href="/login" className="text-blue-600 hover:underline">← Volver al login</a>
//                 </div>
//             </div>
//         </div>
//     );
// }
// Nueva versión:
// En general, sí funciona para un flujo básico de recuperación de contraseña en Next.js (App Router), pero tiene varios detalles importantes de UX, seguridad y buenas prácticas que conviene mejorar.

// Lo que está bien
// Usa 'use client' y useRouter de next/navigation correctamente para App Router.

// Valida que el correo no venga vacío (con .trim()).

// Muestra estado de carga (loading) y deshabilita el botón mientras se envía la petición.

// Problemas y mejoras recomendadas
// Fuga de información / Enumeración de correos:
// Si el backend devuelve un error distinto cuando el correo no existe, un atacante podría descubrir qué emails están registrados. Lo ideal en restablecimiento de contraseña es que el backend responda con un mensaje genérico de éxito (p. ej., "Si el correo está registrado, recibirás un enlace...") y que el frontend muestre ese mismo mensaje.

// Limpieza del setTimeout al desmontar el componente:
// Si el usuario cierra o navega fuera de la página antes de los 3000 ms, el setTimeout sigue corriendo. Es mejor limpiar el temporizador en un useEffect o navegar directamente cuando el usuario cierre la alerta.

// Accesibilidad y semántica (<label> y <Link>):

// El <input> no tiene un <label> asociado (htmlFor), lo cual afecta a lectores de pantalla.

// Para volver a /login en Next.js, conviene usar <Link href="/login"> de next/link en lugar de <a href="/login"> para evitar recargas completas innecesarias.

// Consistencia visual y ortografía:

// En el título pusiste "Reestablecimiento" (es más común "Restablecimiento").

// El botón tiene bg-blue-600 y hover:bg-pink-700, un cambio de azul a rosa fuerte que puede verse accidental si el resto de tu diseño es azul.

// Falta autoComplete="email" en el input.

//NUEVA VERSION
'use client';

import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import url from '../../../../api/url';

const URL_API = `${url}/api/reset_password`;

export default function Page() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim();

        if (!cleanEmail) {
            Swal.fire('Error', 'Por favor ingresa tu correo electrónico', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(URL_API, { email: cleanEmail });

            await Swal.fire({
                title: 'Revisa tu correo (y tu carpeta de spam)',
                text:
                    response.data?.message ||
                    'Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
            });

            timeoutRef.current = setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error) {
            Swal.fire(
                'Error',
                error.response?.data?.message || 'Hubo un problema, intenta de nuevo',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-700 text-center mb-2">
                    Restablecimiento de Contraseña
                </h1>
                <p className="text-gray-600 text-center text-sm mb-6">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-60 transition flex justify-center items-center font-medium"
                    >
                        {loading ? (
                            <span
                                aria-label="Enviando"
                                className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"
                            />
                        ) : (
                            'Enviar'
                        )}
                    </button>
                </form>

                <div className="text-center mt-5">
                    <Link href="/login" className="text-sm text-blue-600 hover:underline">
                        ← Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
}