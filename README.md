# Studio Libelula Launcher

## Descripción

Studio Libelula Launcher es un launcher personalizado para Minecraft, diseñado para proporcionar soporte para múltiples instancias del juego y basado en la plataforma Firebase para la gestión de perfiles y configuraciones.

## Características

- **Soporte para múltiples instancias:** Ejecuta varias versiones de Minecraft con perfiles separados para cada una.
- **Integración con Firebase:** Almacena perfiles de usuario, configuraciones y preferencias en la nube mediante Firebase Realtime Database.
- **Interfaz intuitiva:** Diseño limpio y fácil de usar para una experiencia de usuario sin complicaciones.
- **Funcionamiento de cuentas multiples:** Soporte de todo tipo de cuentas premiun de microsft o nopremiun.
- **Funcionamiento Externo por FirebaseDatabase:** Funcionamiento sin necesidad de hosting, teniendo varias ventajas y dando una auto actualizacion del launcher con cosas como versiones.

## Requisitos del Sistema

- **Sistema Operativo:** Windows 10, macOS, Linux
- **Java:** Se requiere Java 8 o superior para ejecutar Minecraft y el launcher.
- **Conexión a Internet:** Necesaria para descargar Minecraft, perfiles de usuario y actualizaciones.

## Instalación

1. Descarga la última versión del launcher desde [nuestro sitio web](https://example.com/launcher).
2. Ejecuta el instalador y sigue las instrucciones en pantalla.
3. Acepta la app diciendo que lo permites en el equipo, si bien en la pantalla sale que es un posible virus esto se debe a que no cuenta con la licencia de App de Microsoft.

## Uso

1. **Inicio de sesión:** Ingresa con tu cuenta de Minecraft o crea un nuevo perfil.
2. **Gestión de instancias:** Crea, edita y elimina instancias de Minecraft con diferentes configuraciones.
3. **Juego:** Selecciona una instancia y haz clic en "Jugar" para iniciar el juego.
4. **Actualizaciones:** El launcher se actualizará automáticamente cuando haya una nueva versión disponible de alguna de las instancias.

## Contribuciones

¡Agradecemos las contribuciones! Si encuentras problemas o tienes sugerencias, por favor, [crea un problema](https://github.com/stemdev0110/libelulalauncher/issues) en nuestro repositorio.

## Licencia

Este proyecto está bajo la Licencia - consulta el archivo [LICENSE.md](LICENSE.md) para más detalles.

<hr>

*Dev Information*

## Uso de firebase para el launcher

> Para poder hacer esto se necesita tener firebase ya configurado con el launcher, con el realtime database, ahora para tenerlo configurado debes asegurarte que la ruta este bien establecido a la version segun la Database, algo como esto:

<img src="https://imgur.com/YeEif8o.png">

con tu version creada puedes asegurarte de subir tus archivos, para esto necesitas los archivos de tu instancia, basicamente:

<img src="https://i.imgur.com/W4y5IE0.png">

Una ves le hayas dado click a añadir a archivo crealo en zip, con esto tendras el archivo .zip, asegurate de subirlo a un medio, entre estos puedes escojer varios, desde el propio firebase usando Firebase Storage:

<img src="https://imgur.com/gA0WpSc.png">

Seleccionas el link y es el que se usara en la configuracion de la database de firebase en el campo de archives_url, ahora con esto listo puedes pasar a configurar la instancia, como la version de minecraft, launcher como "forge", "fabric", o "quilt", tambien puedes usar el normal usando vanilla, o cualquier nombre para la version normal de mc sin modificaciones.

Una es echo esto el launcher iniciara la primera ves ejecutando y retirando archivos necesarios, despues de esto el juego al volver a ser iniciado lo hara normalmente
