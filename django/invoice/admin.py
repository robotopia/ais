from django.contrib import admin
from .models import *
from datetime import date

# Custom filters
class IsPaidListFilter(admin.SimpleListFilter):
    title = 'paid?'
    parameter_name = 'is_paid'

    def lookups(self, request, model_admin):
        return (
            ('0', 'Not paid'),
            ('1', 'Paid'),
        )

    def queryset(self, request, queryset):
        if self.value() is not None:
            return queryset.filter(invoice__paid__isnull=not bool(int(self.value())))
        else:
            return queryset

class IsInvoicedListFilter(admin.SimpleListFilter):
    title = 'invoiced?'
    parameter_name = 'is_invoiced'

    def lookups(self, request, model_admin):
        return (
            ('0', 'Not attached to invoice'),
            ('1', 'Attached to invoice'),
        )

    def queryset(self, request, queryset):
        if self.value() is not None:
            return queryset.filter(invoice__isnull=not bool(int(self.value())))
        else:
            return queryset


class IsOverdueListFilter(admin.SimpleListFilter):
    title = 'overdue?'
    parameter_name = 'is_overdue'

    def lookups(self, request, model_admin):
        return (
            ('0', 'Not overdue'),
            ('1', 'Overdue'),
        )

    def queryset(self, request, queryset):
        if self.value() == '1':
            return queryset.filter(issued__isnull=False, paid__isnull=True, due__lt=date.today())
        elif self.value() == '0':
            return queryset.exclude(issued__isnull=False, paid__isnull=True, due__lt=date.today())
        else:
            return queryset


# Admin classes

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'number', 'bsb']

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['date', 'qty', 'activity_type', 'invoice', 'is_paid']
    list_filter = ['invoice__bill_to', IsInvoicedListFilter, IsPaidListFilter, 'activity_type']
    date_hierarchy = 'date'

    # A column to say whether this activity has been paid or not
    @admin.display(ordering='invoice__paid', description='Paid?')
    def is_paid(self, obj):
        if obj.invoice is None:
            return False

        return obj.invoice.paid is not None

    is_paid.boolean = True

    # On the create/edit form, restrict the choice of available invoices to only those
    # which have not yet been issued
    def get_form(self, request, obj=None, **kwargs):
        form = super(ActivityAdmin, self).get_form(request, obj, **kwargs)
        form.base_fields['invoice'].queryset = Invoice.objects.filter(issued__isnull=True)
        return form

@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    list_display = ['description', 'rate']

@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'abn', 'is_gst_registered']

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_email']

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_to', 'issued', 'due', 'paid_or_overdue']
    list_filter = ['bill_to', IsOverdueListFilter]
