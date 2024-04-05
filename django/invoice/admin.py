from django.contrib import admin
from .models import *
from datetime import date
import decimal

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

# Admin inlines

class ActivityInline(admin.TabularInline):
    model = Activity
    fields = ['date', 'qty', 'rate', 'activity_type', 'amount']
    readonly_fields = ['date', 'qty', 'rate', 'activity_type', 'amount']
    extra = 0
    show_change_link = True
    can_delete = False

    def rate(self, obj):
        return f'${obj.activity_type.rate}'

    def amount(self, obj):
        if not obj.qty:
            return None

        decimal.getcontext().rounding = decimal.ROUND_UP
        return f'${decimal.Decimal(obj.qty) * obj.activity_type.rate}'

# Admin classes

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'number', 'bsb']

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['date', 'qty', 'activity_type', 'invoice', 'is_paid']
    list_filter = ['invoice__bill_to', IsInvoicedListFilter, IsPaidListFilter, 'activity_type']
    autocomplete_fields = ['activity_type']
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
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'invoice':
            kwargs['queryset'] = Invoice.objects.filter(issued__isnull=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    list_display = ['description', 'rate']
    search_fields = ['description']

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
    inlines = [ActivityInline]
    fieldsets = [
        (
            None, {'fields': ['name', 'billing', ('issued', 'due', 'paid')]},
        ),
        (
            "Bill to", {'fields': [('bill_to', 'bill_email')]}
        ),
        (
            'PDF', {'fields': ['pdf', 'pdf_viewed']}
        ),
        (
            'Payment advice', {'fields': ['account']}
        ),
    ]
    readonly_fields = ['bill_email']

    def bill_email(self, obj):
        return obj.bill_to.bill_email
    bill_email.short_description = "Email"
