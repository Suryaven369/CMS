// Import necessary Payload modules and collections
import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig, PayloadRequest } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import sharp from 'sharp'; // sharp-import remains

// ===== CORRECTED CLOUD STORAGE IMPORTS =====
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'; // Named import for plugin
import { s3Storage } from '@payloadcms/storage-s3';
 // Default import for adapter
// ==================================================

// Your Collections and Globals
import { Categories } from './collections/Categories';
import { Media } from './collections/Media'; // Ensure Media is imported correctly
import { Services } from './collections/Services';
import { Testimonials } from './collections/Testimonials';
import Portfolio from './collections/Portfolio';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Users } from './collections/Users';
import { Footer } from './Footer/config';
import { Header } from './Header/config';

// Your other imports and utilities
import { plugins as otherPluginsFromExternalFile } from './plugins'; // Renamed variable
import { defaultLexical } from '@/fields/defaultLexical';
import { getServerSideURL } from './utilities/getURL';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// ===== CONFIGURE S3 STORAGE FOR SUPABASE =====
const s3Config = {
  endpoint: `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1`,
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || 'service_role',
    secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || '',
  },
  region: process.env.SUPABASE_REGION || '',
};
// ============================================

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: { /* ... */ },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI, // Ensure this environment variable is set
    },
  }),
  collections: [Pages, Posts, Media, Categories, Users, Services, Testimonials, Portfolio],
  cors: [getServerSideURL(), 'http://localhost:3000'].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    // Include your other plugins
    ...otherPluginsFromExternalFile, // Use the renamed variable

    // ===== ADD THE S3 STORAGE PLUGIN =====
    s3Storage({
      collections: {
        [Media.slug]: true,
      },
      config: s3Config,
      bucket: process.env.SUPABASE_BUCKET || '',
    }),
    // ============================================================
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: { /* ... */ },
  jobs: {
    tasks: [],
  },
});
