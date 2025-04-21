// Import necessary Payload modules and collections
import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig, PayloadRequest } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import sharp from 'sharp'; // sharp-import remains

// ===== CORRECTED CLOUD STORAGE IMPORTS =====
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'; // Named import for plugin
import { s3Adapter } from '@payloadcms/storage-s3'; // Default import for adapter
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

// ===== CONFIGURE S3 ADAPTER FOR SUPABASE =====
// Using the default import 's3Adapter' here
const adapter = s3Adapter({
  config: {
    endpoint: `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1`,
    credentials: {
      accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || 'service_role',
      secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || '',
    },
    // region: process.env.SUPABASE_REGION || 'us-east-1',
    // forcePathStyle: true,
  },
  bucket: process.env.SUPABASE_BUCKET || '',
});
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
  db: postgresAdapter({ /* ... */ }),
  collections: [Pages, Posts, Media, Categories, Users, Services, Testimonials, Portfolio],
  cors: [getServerSideURL(), 'http://localhost:3000'].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    // Include your other plugins
    ...otherPluginsFromExternalFile, // Use the renamed variable

    // ===== ADD THE CONFIGURED CLOUD STORAGE PLUGIN =====
    // *** USE THE CORRECT IMPORTED VARIABLE NAME HERE ***
    cloudStoragePlugin({
      collections: {
        [Media.slug]: {
          adapter: adapter, // Pass the S3 adapter instance
          disableLocalStorage: true,
          // prefix: 'media', // Optional prefix
        },
      },
    }),
    // ============================================================
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: { /* ... */ },
  jobs: { /* ... */ },
});
