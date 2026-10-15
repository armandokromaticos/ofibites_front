# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Cliente (usuario de empresa)**: personal de oficina en Venezuela (office managers, compradores, finanzas, aprobadores) que pide coffee breaks, working lunches, desayunos y bebidas para reuniones y eventos de su empresa. Entra con cuenta corporativa creada por invitación; no hay registro abierto.
- **Admin Ofibites (plataforma)**: equipo interno (super admin, admin operativo, operador) que gestiona pedidos, cocina, logística, facturas, clientes y productos.

## Product Purpose

OfiBites es una plataforma B2B de aprovisionamiento corporativo de catering. Permite a una empresa pedir surtidos para sus oficinas y sedes, controlar quién compra y quién aprueba, pagar con línea de crédito o pago inmediato y seguir cada pedido hasta la entrega. Éxito para el cliente: pedir en minutos lo que su reunión necesita, repetir pedidos sin fricción y tener la facturación en orden. Éxito para Ofibites: operar pedidos, cobro y clientes desde un solo lugar.

## Positioning

No es un delivery de comida para personas: es el canal de compra de catering de una empresa, con roles por empresa (comprador, aprobador, finanzas), sedes y direcciones, línea de crédito corporativa con bloqueo por facturas vencidas y pedidos que pasan por aprobación interna antes de confirmarse.

## Operating Context

- Acceso: solicitud de ingreso de la empresa → aprobación por Ofibites → invitación por correo → cambio de contraseña obligatorio → onboarding de la empresa. Después, login con correo y contraseña, y recuperación por enlace al correo.
- Flujo principal del cliente: dashboard → ordenar (categorías, cards con rango de precio) → ficha del producto (selector de personas) → carrito → checkout en dos pasos (entrega, pago) → pedido confirmado → seguimiento y facturas.
- Negocio en hora de Caracas (UTC-4). Contenido bilingüe ES/EN; la interfaz está en español.
- Se usa desde la oficina, mayoritariamente en escritorio; el Figma solo trae diseños de escritorio (1440 px).

## Capabilities and Constraints

- Frontend Next.js 16 (App Router) + React 19 + HeroUI + Tailwind 4 + framer-motion; consume la API NestJS de `../ofibites`.
- Precios siempre calculados por el servidor; el front los muestra, nunca los decide.
- Las transiciones de estado de un pedido las define la máquina de estados del back; el front no ofrece acciones que no permita.
- Pendiente de decidir: diseño móvil (no existe en Figma) y pantallas del Admin (no existen en Figma).

## Brand Commitments

- Marca Ofibites, logo naranja; paleta y tipografías del Figma (Playfair Display en títulos de marca, Inter en el resto), botones e inputs en píldora. Cambios de paleta, fuentes o forma de componentes pasan por diseño (equipo Kromáticos Design).
- Fuente de diseño: Figma `yNNsju1jIcNEPu9tCqdoQy`, copia local en `../diseno/figma/`; normas en la skill `ofibites-design`.
- Voz: español cercano y directo, de tú ("¿Qué quieres pedir hoy?", "Aquí empieza tu experiencia de catering").

## Evidence on Hand

- Fotografía real de producto entregada por diseño en `public/images/products/` (cajas, galería de pasapalos y café), `public/images/banners/` y `public/images/categories/`; ilustraciones planas de comida en `public/images/decor/`.
- Sin testimonios, clientes publicables, métricas ni precios de referencia: no se inventan.

## Product Principles

1. La tarea primero: pedir, aprobar y pagar sin fricción; la marca vive en los detalles.
2. El catering real es el protagonista visual: la comida y las cajas de Ofibites, no la decoración genérica.
3. Confianza corporativa: estados claros, cifras que vienen del servidor, nada que parezca improvisado.
4. Cada flujo comunica en qué paso está la empresa (solicitud, aprobación, pedido, entrega, factura).

## Accessibility & Inclusion

- WCAG AA: los ajustes de contraste frente al Figma están en la skill `ofibites-design` (naranja `accent` no se usa en texto pequeño ni como fondo de botón con texto blanco).
- Todo movimiento respeta `prefers-reduced-motion`.
