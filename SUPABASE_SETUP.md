# Supabase Setup Guide for Ovenly

This document explains how to configure Supabase for your Ovenly website so you can manage products, reviews, and image uploads securely.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account or sign in.
2. Click **New Project** and follow the prompts.
3. Save your database password securely.

## 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** > **API**.
2. Copy the **Project URL**.
3. Copy the **`anon` `public` API Key**.
4. Create a `.env.local` file in the root of your Ovenly project (next to `package.json`).
5. Add your keys like this:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Run the Migrations

To set up your database tables (Products and Reviews) along with the security policies:

1. Go to the **SQL Editor** in your Supabase dashboard.
2. Click **New Query**.
3. Open `supabase/migrations/001_initial_schema.sql` from your project code, paste its contents into the SQL Editor, and click **Run**.
4. Open `supabase/migrations/002_rls_policies.sql`, paste it, and click **Run**.
5. Open `supabase/migrations/003_storage_setup.sql`, paste it, and click **Run**.

## 4. Administrator Setup

You need to create an administrator account to access the `/admin` dashboard securely.

1. Go to **Authentication** > **Users** in your Supabase dashboard.
2. Click **Add User** > **Create New User**.
3. Enter your admin email and a secure password.
4. Uncheck "Auto Confirm User?" (or check it if you don't want to receive a confirmation email and just want to log in immediately).
5. Click **Create User**.

*Note: The RLS policies grant full access to any authenticated user. Since you disabled public registration, only the users you manually create here will have admin access.*

## 5. Storage Buckets

The `003_storage_setup.sql` script creates two buckets automatically:
* `product-images` (for admin product photos)
* `review-photos` (for customer review uploads)

You can verify them by going to **Storage** in the Supabase dashboard. Both buckets are marked public so images can be displayed on your website, but Row Level Security (RLS) ensures that only admins can upload/delete product images, while customers can only upload (but not delete) review photos.

## 6. Local Development and Deployment

**Locally:** 
Just run `npm run dev` and the website will automatically connect to your Supabase project using the `.env.local` file.

**Production (Vercel / Netlify):**
When deploying to your hosting provider, make sure to add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in their dashboard. 
*Do not upload `.env.local` to GitHub!*
