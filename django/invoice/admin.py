from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse

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
            if queryset.model is Invoice:
                return queryset.filter(paid__isnull=not bool(int(self.value())))
            if queryset.model is Activity:
                return queryset.filter(invoice__paid__isnull=not bool(int(self.value())))

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

class InvoiceActivityInlineForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        # Only list activity types whose contracts' employee and employer match
        # the invoice's "billing" and "bill_to", respectively
        super().__init__(*args, **kwargs)
        if self.instance.invoice is not None:
            qs = self.fields["activity_type"].queryset = ActivityType.objects.filter(
                contract__employee=self.instance.invoice.billing,
                contract__employer=self.instance.invoice.bill_to,
                contract__start__lte=self.instance.date,
                contract__end__gte=self.instance.date,
            )

            self.fields["activity_type"].queryset = qs

class InvoiceActivityInline(admin.TabularInline):
    model = Activity
    fields = ['date', 'qty', 'rate', 'activity_type', 'notes', 'amount']
    readonly_fields = ['rate', 'amount']
    extra = 0
    show_change_link = True
    ordering = ['date']
    form = InvoiceActivityInlineForm

    def has_change_permission(self, request, obj):
        return obj.issued is None and request.user.is_superuser

    def has_add_permission(self, request, obj):
        return obj.issued is None and request.user.is_superuser

    def has_delete_permission(self, request, obj):
        return obj.issued is None and request.user.is_superuser

    def rate(self, obj):
        return f'${obj.activity_type.rate}'

    def amount(self, obj):
        return f'${obj.amount}'


class ActivityInline(admin.TabularInline):
    model = Activity
    fields = ['date', 'qty', 'amount', 'notes', 'invoice']
    readonly_fields = ['amount']
    extra = 0
    ordering = ['date']
    show_change_link = True

    def amount(self, obj):
        return f'${obj.amount}'

# Admin classes

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'number', 'bsb']

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['date', 'qty', 'activity_type', 'invoice', 'is_paid']
    list_filter = ['invoice__bill_to', IsInvoicedListFilter, IsPaidListFilter, 'activity_type__description']
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

    def get_readonly_fields(self, request, obj=None):
        if obj.invoice is not None:
            if obj.invoice.issued is not None:
                return ['invoice']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(invoice__bill_to__in=request.user.client_set.all())

@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    list_display = ['description', 'rate_str', 'contract']
    list_filter = ['contract__employer']
    list_display_links = ['description']
    search_fields = ['description']
    inlines = [ActivityInline]

    @admin.display(description='Rate')
    def rate_str(self, obj):
        return f'${obj.rate}'


@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'abn', 'is_gst_registered']

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_email']
    fields = ['name', 'bill_email', 'email_text', 'users']

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['start', 'end', 'employer', 'employee']
    list_filter = ['employer', 'employee']
    date_hierarchy = 'start'

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_to', 'total_amount', 'issued', 'paid_or_overdue']
    inlines = [InvoiceActivityInline]

    def bill_email(self, obj):
        return obj.bill_to.bill_email
    bill_email.short_description = "Email"

    def bill_to__name(self, obj):
        return obj.bill_to.name
    bill_to__name.short_description = "Name"

    def billing__name(self, obj):
        return obj.billing.name
    billing__name.short_description = "Name"

    def billing__address(self, obj):
        addr = f"{obj.billing.addr1}"
        if obj.billing.addr2 is not None:
            addr += f"\n{obj.billing.addr2}"
        return addr
    billing__address.short_description = "Address"

    def billing__phone(self, obj):
        return obj.billing.phone
    billing__phone.short_description = "Phone"

    def billing__email(self, obj):
        return obj.billing.email
    billing__email.short_description = "Email"

    def billing__abn(self, obj):
        return obj.billing.abn
    billing__abn.short_description = "ABN"

    def billing__is_gst_registered(self, obj):
        return obj.billing.is_gst_registered
    billing__is_gst_registered.short_description = "GST registered?"
    billing__is_gst_registered.boolean = True

    def account_name(self, obj):
        return obj.account.name
    account_name.short_description = "Account name"

    def account_bsb(self, obj):
        return obj.account.bsb
    account_bsb.short_description = "BSB"

    def account_number(self, obj):
        return obj.account.number
    account_number.short_description = "Account number"

    def payment_received_qstn(self, obj):
        return obj.payment_received is not None
    payment_received_qstn.boolean = True
    payment_received_qstn.short_description = "Payment received?"

    def is_paid(self, obj):
        return obj.paid is not None
    is_paid.boolean = True
    is_paid.short_description = "Paid?"

    def total_amount(self, obj):
        return f'${obj.total_amount}'
    total_amount.short_description = "Total amount"

    def get_fieldsets(self, request, obj=None):
        if request.user.is_superuser:
            payment_status_fields = ['issued', 'due']

            if obj.issued is not None:
                if obj.paid is not None:
                    payment_status_fields.append('paid')
                    payment_status_fields.append('payment_received')
                else:
                    payment_status_fields.append('is_paid')

            return [
                (
                    None, {'fields': ['name', 'billing', 'pdf']},
                ),
                (
                    "Bill to", {'fields': ['bill_to', 'bill_email']}
                ),
                (
                    'Payment advice', {'fields': ['account', 'account_name', 'account_bsb', 'account_number', 'total_amount']}
                ),
                (
                    'Payment status', {'fields': payment_status_fields},
                ),
            ]

        # Assert: user is a client
        payment_status_fields = ['issued', 'due', 'paid']
        if obj.paid is not None:
            payment_status_fields.append('payment_received_qstn')

        return [
            (
                None, {'fields': ['billing__name', 'billing__address', 'billing__phone', 'billing__email', 'billing__abn', 'billing__is_gst_registered', 'pdf']},
            ),
            (
                "Bill to", {'fields': ['bill_to__name']}
            ),
            (
                'Payment advice', {'fields': ['account_name', 'account_bsb', 'account_number', 'total_amount']}
            ),
            (
                'Payment status', {'fields': payment_status_fields},
            ),
        ]


    def get_list_filter(self, request, obj=None):
        if request.user.is_superuser:
            return ['bill_to', IsPaidListFilter, IsOverdueListFilter]

        return [IsPaidListFilter, IsOverdueListFilter]

    def get_inline_instances(self, request, obj=None):
        # Only show the (inline) activities if not creating a new invoice
        if obj is None:
            return []

        return [inline(self.model, self.admin_site) for inline in self.inlines]

    def get_readonly_fields(self, request, obj=None):
        fields = ['bill_email', 'account_name', 'account_bsb', 'account_number', 'total_amount', 'payment_received_qstn', 'is_paid']

        if obj is None:
            return fields

        if request.user.is_superuser:
            fields.append('paid')

            if obj.issued is None:
                return fields

            fields += ['billing', 'due', 'bill_to', 'pdf', 'account']
            if obj.paid is None:
                return fields

            fields += ['issued']
            return fields

        # Assert: user is a client
        fields = ['bill_email', 'account_name', 'account_bsb', 'account_number', 'total_amount', 'payment_received_qstn', 'billing', 'due', 'bill_to', 'pdf', 'account', 'issued', 'name', 'bill_to__name', 'billing__name', 'billing__address', 'billing__phone', 'billing__email', 'billing__abn', 'billing__is_gst_registered']

        if obj.payment_received is not None:
            fields.append('paid')

        return fields

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(bill_to__in=request.user.client_set.all(), issued__isnull=False)

