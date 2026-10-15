---
version: 1
slug: "app-login-page-tsx"
primary_target: "app/login/page.tsx"
related_targets: []
---

# Login (variante v2: Mosaico vivo de surtidos)

Scope: `/login` del cliente y del admin. Mode: operate (iniciar sesión en segundos), con la primera impresión de marca. Reversible: `NEXT_PUBLIC_LOGIN_VARIANT` (`v1` = login del Figma, `v2` = mosaico) y override `?login=v1|v2`.
Audiencia: personal de oficina que entra a pedir catering para su empresa. Contenido real: fotos de producto de `public/images/products`, `banners`, `categories`; nombres de surtidos del Figma. Sin claims inventados.
Sin cambios: paleta, Playfair + Inter, logo, píldoras, copy y comportamiento del formulario (errores, olvidé la contraseña, solicitar acceso).

## Direction contract

THESIS: El acceso es la vitrina viva del catering de Ofibites; rechaza la foto fija a la derecha del formulario.
OWN-WORLD: Fondo crema `background`, panel del formulario sólido, tarjetas de producto radio 22 sobre `surface-sand` con foto real y nombre en Inter Bold; CTA píldora `primary`; acento naranja solo en logo.
STORY: El visitante ve en un segundo que esto es catering corporativo real, encuentra el formulario donde lo espera y entra sin distracción.
FIRST VIEWPORT: Izquierda (≈45%): logo, "Iniciar sesión" en Playfair Black con el peso animado de 400 a 900 al entrar, subtítulo, correo, contraseña, CTA y enlaces. Derecha (≈55%): tres columnas de tarjetas de producto en desplazamiento vertical lento y opuesto (40-60 s por ciclo), con una tarjeta que gira cada pocos segundos para mostrar otro surtido; se pausa al enfocar un campo; estático con reduced-motion. Móvil: una franja horizontal del mosaico arriba y el formulario debajo.
FORM: Mosaico vivo de surtidos, candidato 3 de 7 de la lista ordenada; seed key 34f81264.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion grammar (todo el sitio)

Tokens de duración (120/200/320/480/700 ms) y easing (`cubic-bezier(0.16,1,0.3,1)` para entradas, salidas más cortas y con aceleración). Transiciones entre páginas con View Transitions de React/Next; modales con escala 0.96→1 y fundido; listas con stagger acotado. Siempre con alternativa para `prefers-reduced-motion`.
