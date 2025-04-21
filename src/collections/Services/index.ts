import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { slugField } from '@/fields/slug'


export const Services: CollectionConfig = {
  slug: 'services',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'packages',
      type: 'array',
      required: true,
      maxRows: 3,
      minRows: 3,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          required: true,
        },
        {
          name: 'features',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Enter each feature on a new line'
          }
        }
      ]
    },
    {
      name: 'faqs',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        }
      ]
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  versions: {
    drafts: true,
  },
} 