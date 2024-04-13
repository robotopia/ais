from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['date', 'amount_str', 'fuel_kms', 'tax_deductible_amount_str']
    fields = ['date', 'amount', ('receipt', 'image'), 'fuel_kms', 'description']
    readonly_fields = ['image']

    def amount_str(self, obj):
        return f'${obj.amount}'
    amount_str.short_description = "Amount"

    def tax_deductible_amount_str(self, obj):
        return f'${obj.tax_deductible_amount}'
    tax_deductible_amount_str.short_description = "Tax deductible amount"


@admin.register(Travel)
class TravelAdmin(admin.ModelAdmin):
    list_display = ['date', 'activity', 'from_location', 'to_location', 'expense', 'kms']

@admin.register(TaxPeriod)
class TaxPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start', 'end', 'taxable_income', 'tax_deductible_expenses_str']

    def taxable_income(self, obj):
        return f'${obj.taxable_income}'
    taxable_income.short_description = "Taxable income"

    def tax_deductible_expenses_str(self, obj):
        return f'${obj.tax_deductible_expenses}'
    tax_deductible_expenses_str.short_description = "Tax-deductible expenses"

