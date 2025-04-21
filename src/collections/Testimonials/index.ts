import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'role', 'company', 'updatedAt'],
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The testimonial quote from the client'
      }
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the person giving the testimonial'
      }
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'The role/position of the person'
      }
    },
    {
      name: 'company',
      type: 'text',
      required: true,
      admin: {
        description: 'The company the person represents'
      }
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  versions: {
    drafts: true,
  },
} 