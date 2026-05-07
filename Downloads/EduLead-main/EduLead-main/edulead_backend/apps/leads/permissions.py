from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'superadmin'


class IsTenantAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            'college_admin', 'agency_admin'
        )


class PlanPermission(BasePermission):
    required_plan = None
    plan_hierarchy = {'basic': 0, 'pro': 1, 'premium': 2}

    @classmethod
    def require(cls, plan: str):
        class _Permission(cls):
            pass
        _Permission.required_plan = plan
        return _Permission

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'superadmin':
            return True
        tenant = getattr(request.user, 'tenant', None)
        if not tenant:
            return False
        user_level = self.plan_hierarchy.get(tenant.plan, 0)
        required_level = self.plan_hierarchy.get(self.required_plan, 0)
        return user_level >= required_level


class PhoneRevealPermission(PlanPermission):
    required_plan = 'premium'

    def has_permission(self, request, view):
        return super().has_permission(request, view)


class ExportPermission(PlanPermission):
    required_plan = 'premium'

    def has_permission(self, request, view):
        return super().has_permission(request, view)


class MaskedCallPermission(PlanPermission):
    required_plan = 'pro'

    def has_permission(self, request, view):
        return super().has_permission(request, view)


class SameTenantPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'superadmin':
            return True
        tenant = getattr(request.user, 'tenant', None)
        obj_tenant = getattr(obj, 'tenant', None) or getattr(obj, 'tenant_id', None)
        if not tenant or not obj_tenant:
            return False
        return str(tenant.id) == str(obj_tenant.id if hasattr(obj_tenant, 'id') else obj_tenant)
