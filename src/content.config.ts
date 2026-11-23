import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const documentos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/documentos' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.enum(['Estructura', 'Doctrina', 'Reglamento', 'Transparencia']),
    version: z.string(),
    fecha: z.string(),
    organoEmisor: z.string(),
    resumen: z.string(),
    pdfUrl: z.string().optional(),
  }),
});

const actas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actas' }),
  schema: z.object({
    numero: z.string(),
    titulo: z.string(),
    fecha: z.string(),
    organo: z.enum([
      'Triunvirato (Nivel 1)',
      'Poder Constitucional (Nivel 2)',
      'Asamblea Dirigencial (Nivel 3)',
      'Infraestructura Digital',
    ]),
    resumen: z.string(),
    estado: z.enum(['Publicada', 'En constitución']),
  }),
});

export const collections = { documentos, actas };
