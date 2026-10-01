# Bitácora de prompts

Registro de los prompts usados con IA durante el proyecto. Los marcados con ⭐ son interesantes para la presentación (errores, fallos, decisiones importantes).

**Formato de cada entrada**
- **Fecha / herramienta** (claude.ai, Claude Code)
- **Prompt** (resumido o textual)
- **Resultado**: qué hizo la IA
- **Problema / aprendizaje** (si hubo)

---

## 1. ⭐ Definición de la idea y planificación — 29/09/2026 (claude.ai)
**Prompt:** Le pasé la consigna y la rúbrica, le pedí que evaluara mi idea (e-commerce simple con un producto con variantes de diseño y medida) y que propusiera otras.
**Resultado:** Se eligió una tienda de manteles antimanchas: cada diseño es un producto con variantes por medida (precio y stock propios). Se armó un cronograma de 9 semanas alineado a los entregables E1–E6.
**Aprendizaje:** Con solo 3 productos el filtrado no tiene sentido; hace falta un seed de 8–12 diseños con varias medidas. Next.js ya es React, no hace falta "empezar en React y migrar".

## 2. Pasar el proyecto a Claude Code — 29/09/2026 (claude.ai)
**Prompt:** "¿Cómo paso este proyecto a Claude Code?"
**Resultado:** Claude Code no ve los chats de claude.ai. El contexto se pasa con un `CLAUDE.md` en la raíz del repo, que se lee al inicio de cada sesión.

## 3. ⭐ Cambio de idea base: de manteles a café — 29/09/2026 (Claude Code)
**Prompt:** Le pedí cambiar la idea base del proyecto a una tienda de café de especialidad y actualizar `CLAUDE.md`, la portada y la bitácora, explicando antes qué archivos iba a tocar.
**Resultado:** Cambio de idea base de manteles a café de especialidad. Se definieron 3 perfiles con 2 cafés cada uno, variantes por peso y molienda como opción del pedido (no variante) para evitar 90 combinaciones de stock. Se agregó el cuestionario "Elegí tu café" como parte de E3. Nombre provisorio de la tienda: "Origen Café".

---

Antes de mergear, verificá que el PR tenga todos los commits.

---

