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

# Admin inlines

class ActivityInline(admin.TabularInline):
    model = Activity
    fields = ['date', 'qty', 'rate', 'activity_type', 'amount']
    readonly_fields = ['rate', 'amount']
    extra = 0
    show_change_link = True
    ordering = ['date']

    def has_change_permission(self, request, obj):
        return obj.issued is None

    def has_add_permission(self, request, obj):
        return obj.issued is None

    def has_delete_permission(self, request, obj):
        return obj.issued is None

    def rate(self, obj):
        return f'${obj.activity_type.rate}'

    def amount(self, obj):
        return f'${obj.amount}'

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
    list_display = ['contract', 'description', 'rate']
    list_filter = ['contract']
    list_display_links = ['description']
    search_fields = ['description']

@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'abn', 'is_gst_registered']

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_email']

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['start', 'end', 'employer', 'employee']

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_to', 'total_amount', 'issued', 'due', 'paid_or_overdue']
    list_filter = ['bill_to', IsOverdueListFilter]
    inlines = [ActivityInline]
    fieldsets = [
        (
            None, {'fields': ['name', 'billing', 'issued', 'due', 'paid', 'pdf']},
        ),
        (
            "Bill to", {'fields': ['bill_to', 'bill_email']}
        ),
        (
            'Payment advice', {'fields': ['account', 'account_name', 'account_bsb', 'account_number', 'total_amount']}
        ),
    ]
    readonly_fields = ['bill_email', 'account_name', 'account_bsb', 'account_number', 'total_amount']

    def bill_email(self, obj):
        return obj.bill_to.bill_email
    bill_email.short_description = "Email"

    def account_name(self, obj):
        return obj.account.name
    account_name.short_description = "Name"

    def account_bsb(self, obj):
        return obj.account.bsb
    account_bsb.short_description = "BSB"

    def account_number(self, obj):
        return obj.account.number
    account_number.short_description = "Number"

    def total_amount(self, obj):
        activities = obj.activity_set.all()
        total = sum([activity.amount for activity in activities])
        return f'${total}'
    total_amount.short_description = "Total amount"

    def get_inline_instances(self, request, obj=None):
        # Only show the (inline) activities if not creating a new invoice
        if obj is None:
            return []

        return [inline(self.model, self.admin_site) for inline in self.inlines]

    def get_readonly_fields(self, request, obj=None):
        fields = ['bill_email', 'account_name', 'account_bsb', 'account_number', 'total_amount']
        if obj is None:
            return fields

        if obj.issued is None:
            return fields

        fields += ['billing', 'due', 'bill_to', 'pdf', 'account']
        if obj.paid is None:
            return fields

        fields += ['issued']
        return fields

