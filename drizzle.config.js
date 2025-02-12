/** @type { import("drizzle-kit").Config} */

export default{
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials:{
        url: 'postgresql://neondb_owner:npg_DuZxLO5wUm2g@ep-dark-resonance-a8a0kjdg-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    }
}