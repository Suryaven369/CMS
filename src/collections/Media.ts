import type { CollectionConfig } from 'payload';
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';

import { s3Storage } from '@payloadcms/storage-s3';
import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

const adapter = s3Storage({
  config: {
    endpoint: `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1`,
    credentials: {
      accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || 'service_role',
      secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || ''
    },
    forcePathStyle: true,
    region: 'us-east-1' // Supabase requires this but it doesn't matter what we set
  },
  bucket: process.env.SUPABASE_BUCKET || '',
  collections: {
    media: {
      prefix: 'media'
    }
  }
});

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
  upload: {
    //
    disableLocalStorage: true,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
};
