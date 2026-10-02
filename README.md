# Pasa Palo · tarjeta de enlaces

Página de Pasa Palo lista para publicarse en su propio repositorio. Usa el logo azul y la foto de la carta proporcionados por la marca.

## Abrir localmente

Desde la raíz de FLEXQR-DEMO:

```powershell
npm install
npm run dev:pasapalo
```

Abre http://localhost:8086. Para generar y revisar la versión de publicación:

```powershell
npm run build:pasapalo
npm run start:pasapalo
```

También se puede copiar únicamente esta carpeta a otro repositorio y ejecutar `npm install`, `npm run build` y `npm start` desde ella.

## Contenido

- El botón de carta abre la foto original dentro de una ventana. `+` amplía, `−` reduce; `×`, `Esc` o un toque fuera la cierran.
- Los pedidos abren WhatsApp de Pasa Palo al 974 736 120. El sitio no confirma pedidos ni procesa pagos.
- Instagram abre el perfil @pasapalo.pe. Las tres publicaciones compartidas por la marca muestran portadas locales y enlazan a sus publicaciones originales.
- La entrada de 6,7 segundos muestra los puntos, el logo y «Un abrazo hecho bocado» antes de llevar el logo a la cabecera. En escritorio se muestra una vez por sesión y en móvil en cada entrada. `?splash=full` permite revisarla siempre; con movimiento reducido se usa una versión breve.
- El pie distingue el contacto de FLEXCORE del número de pedidos de Pasa Palo.

La página y la entrada usan `public/pasapalo-logo-transparente.png` para que el logo no muestre un recuadro azul al moverse. `public/pasapalo-logo-azul.jpg` se conserva para el icono y la vista previa al compartir. La animación espera a que el logo cargue antes de comenzar. Para reemplazar la carta, conserva el nombre `public/pasapalo-carta.jpg`. La página no necesita backend.
