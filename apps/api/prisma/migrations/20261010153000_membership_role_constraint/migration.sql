ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_role_check" CHECK ("role" <> 'platformAdmin');
