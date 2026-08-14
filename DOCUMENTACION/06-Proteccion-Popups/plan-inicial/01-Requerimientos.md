# Requerimientos

**Fecha:** 2026-08-14
**Componente:** 06 - Protección contra Popups

## Problema
Los canales que se reproducen mediante iframes a menudo abren nuevas pestañas o ventanas emergentes cuando el usuario hace clic en el reproductor. Esto puede ser molesto y potencialmente peligroso, ya que algunos servicios de streaming redirigen a sitios externos o muestran publicidad agresiva.

## Objetivos
- Implementar un sistema que bloquee la apertura de nuevas pestañas desde iframes
- Mantener la funcionalidad normal de los reproductores de confianza
- Permitir al usuario controlar cuando desactivar la protección
- Identificar dominios de confianza que funcionan correctamente sin restricciones

## Alcance
- Implementación de overlay transparente que intercepta clicks
- Whitelist de dominios de confianza (YouTube, Vimeo, Dailymotion)
- Sistema de activación/desactivación por parte del usuario
- Indicadores visuales de estado de protección

## Restricciones
- No usar atributo sandbox que cause errores de "Protección Anti-Sandbox"
- Mantener compatibilidad con reproductores existentes
- No afectar la reproducción normal de video
- Permitir desactivación temporal cuando el usuario lo necesite