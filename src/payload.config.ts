// Import necessary Payload modules and collections
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig, PayloadRequest } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp' // sharp-import remains

// ===== ADD CLOUD STORAGE IMPORTS =====
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'; // <-- Use default import
import { s3Adapter } from '@payloadcms/storage-s3';
// ======================================

// Your Collections and Globals
import { Categories } from './collections/Categories'
import { Media } from './collections/Media' // Ensure Media is imported correctly
import { Services } from './collections/Services'
import { Testimonials } from './collections/Testimonials'
import Portfolio from './collections/Portfolio'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'

// Your other imports and utilities
import { plugins } from './plugins' // Assuming this contains other plugins you use
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ===== CONFIGURE S3 ADAPTER FOR SUPABASE =====
const adapter = s3Adapter({
  config: {
    // Construct the endpoint URL using your Supabase project reference
    endpoint: `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1`,
    // Use credentials from environment variables
    // IMPORTANT: Use the SERVICE_ROLE_KEY for secretAccessKey
    credentials: {
      accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || 'service_role', // Often 'service_role' if using Service Key directly
      secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || '', // YOUR SERVICE ROLE SECRET KEY
    },
    // region: process.env.SUPABASE_REGION || 'us-east-1', // Usually optional for Supabase, uncomment if needed
    // forcePathStyle: true, // Might be required depending on the S3 client interaction, test if needed
  },
  // Bucket name from environment variable
  bucket: process.env.SUPABASE_BUCKET || '', // YOUR SUPABASE BUCKET NAME
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
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  // Editor config
  editor: defaultLexical,
  // Database Adapter (Supabase/Postgres)
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  // Collections
  collections: [Pages, Posts, Media, Categories, Users , Services, Testimonials, Portfolio],
  // CORS settings
  cors: [getServerSideURL(), 'http://localhost:3000'].filter(Boolean),
  // Globals
  globals: [Header, Footer],
  // Plugins
  plugins: [
    // Include your other plugins if defined elsewhere
    ...plugins,

    // ===== ADD THE CONFIGURED CLOUD STORAGE PLUGIN =====
    cloudStorage({
      collections: {
        // Enable cloud storage for the 'media' collection slug
        // Ensure 'Media.slug' matches the slug defined in './collections/Media.ts'
        [Media.slug]: {
          adapter: adapter, // Pass the S3 adapter configured above
          // Optional: Disable Payload's default local storage for this collection
          disableLocalStorage: true,
          // Optional: Define a prefix for files stored in S3/Supabase Storage bucket
          // prefix: 'media', // Example: files will be stored in 'your-bucket/media/...'
        },
        // Add configuration for other collections that need cloud storage
        // Example:
        // ['other-uploads']: { // Use the collection slug
        //   adapter: adapter,
        //   disableLocalStorage: true,
        // },
      },
    }),
    // ====================================================
  ],
  // Payload Secret
  secret: process.env.PAYLOAD_SECRET,
  // Sharp for image processing
  sharp,
  // Typescript generation
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Jobs config (if needed)
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
