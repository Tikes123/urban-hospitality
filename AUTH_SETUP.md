# Auth & first super-admin

- **Vendor routes** (`/vendor/*`) are protected: only logged-in users with role `vendor` or `super_admin` can access. Others are redirected to `/login`.
- **Super-admin routes** (`/super-admin/*`) are protected: only role `super_admin` can access.
- **Vendor accounts** can only be created by a super-admin from the Super-admin → Vendors → Create vendor.
- **Normal users** (job seekers) can sign up at `/signup` and log in at `/login`. They can use "My applications" when `userId` is set on candidates (e.g. when applying while logged in).

## First super-admin

If you already have an admin user in `admin_users`, set their role to super_admin:

```sql
UPDATE admin_users SET role = 'super_admin' WHERE email = 'your@email.com';
```

If the table or columns don't exist yet, run:

```bash
npx prisma migrate deploy
npx prisma generate
```

Then create an admin user (e.g. via Prisma Studio or a one-off script) with `role = 'super_admin'` and a password hash (use bcrypt). Or run the migration that adds `role` and `avatar`, then update one row to `super_admin`.

## Environment

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for payments (Billing and HR seat payments).
- `DATABASE_URL` for Prisma.
