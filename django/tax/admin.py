from django import forms
from django.contrib import admin
from django.utils.html import format_html, format_html_join
from .models import *
from django.db.models import Q

# Custom form for expenses (reverse look-up for available travels to expense)
class ExpenseTravelForm(forms.ModelForm):

    travels = forms.ModelMultipleChoiceField(
        queryset=Travel.objects.all(),
        widget=admin.widgets.FilteredSelectMultiple(
            verbose_name=Travel._meta.verbose_name,
            is_stacked=False,
        ),
        required=False,
    )

    def save(self, commit=True):
        expense = super(ExpenseTravelForm, self).save(commit=commit)

        # Get the travels that have been "chosen" in the widget
        travels = self.cleaned_data.get('travels', None)

        # Get the travels that are still "available" in the widget
        existing_travels = Travel.objects.filter(expense__pk=expense.pk)

        # Identify the ones to be removed from this expense
        # = is in existing_travels, but isn't in travels
        travels_to_be_removed = existing_travels.difference(travels)

        # Identify the ones to be added to this expense
        # = is in travels, but isn't in existing_travels
        travels_to_be_added = travels.difference(existing_travels)

        # Change the travels accordingly
        for travel in travels_to_be_removed:
            travel.expense = None
            travel.save()
        for travel in travels_to_be_added:
            travel.expense = expense
            travel.save()

        return expense

    class Meta:
        model = Expense
        fields = '__all__'


# ModelAdmins

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    form = ExpenseTravelForm
    list_display = ['date', 'amount_str', 'fuel_kms', 'tax_deductible_amount_str']
    fields = ['date', 'amount', ('receipt', 'image'), 'fuel_kms', 'description', 'travels']
    readonly_fields = ['image']

    def amount_str(self, obj):
        return f'${obj.amount}'
    amount_str.short_description = "Amount"

    def tax_deductible_amount_str(self, obj):
        return f'${obj.tax_deductible_amount}'
    tax_deductible_amount_str.short_description = "Tax deductible amount"

    def get_form(self, request, obj=None, **kwargs):
        form = super(ExpenseAdmin, self).get_form(request, obj, **kwargs)
        if obj is not None:
            form.base_fields['travels'].queryset = Travel.objects.filter(
                Q(expense__isnull=True) | Q(expense__exact=obj)
            )
            form.base_fields['travels'].initial = Travel.objects.filter(Q(expense__exact=obj))
        else:
            form.base_fields['travels'].queryset = Travel.objects.filter(expense__isnull=True)
        return form


@admin.register(Travel)
class TravelAdmin(admin.ModelAdmin):
    list_display = ['date', 'activity', 'from_location', 'to_location', 'expense', 'kms']

    def get_form(self, request, obj=None, **kwargs):
        form = super(TravelAdmin, self).get_form(request, obj, **kwargs)
        if obj is not None:
            form.base_fields['expense'].queryset = Expense.objects.filter(date__gte=obj.date)
        return form


@admin.register(TaxPeriod)
class TaxPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start', 'end', 'tax_income_breakdown_html', 'tax_deductible_expenses_str']

    def tax_deductible_expenses_str(self, obj):
        return f'${obj.tax_deductible_expenses}'
    tax_deductible_expenses_str.short_description = "Tax-deductible expenses"

    def tax_income_breakdown_html(self, obj):
        return format_html(
            "<table>{}<tr><td><b>Total</b></td><td><b>{}</b></td></table>",
            format_html_join(
                "",
                "<tr><td>{}</td><td>${}</td></tr>",
                ((row["invoice__bill_to__name"], row["total"]) for row in obj.taxable_income_breakdown),
            ),
            f'${obj.taxable_income}',
        )
    tax_income_breakdown_html.short_description = "Income"

