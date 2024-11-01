from django.db import models
import invoice.models as invoice_models
from django.utils.html import mark_safe

import decimal

# Create your models here.

class Expense(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    receipt = models.ImageField(upload_to='receipts', max_length=1024, blank=True, null=True)
    fuel_kms = models.DecimalField(max_digits=10, decimal_places=1, blank=True, null=True)

    @property
    def tax_deductible_amount(self):
        if self.fuel_kms is None:
            return self.amount

        if not self.travel_set.exists():
            return decimal.Decimal('0.00')

        travel_kms = decimal.Decimal(sum([travel.kms for travel in self.travel_set.filter(activity__isnull=False)]))
        amount = self.amount * travel_kms / self.fuel_kms
        return amount.quantize(decimal.Decimal('0.01'))

    # For displaying the image on the admin site
    # Adapted from https://stackoverflow.com/questions/16307307/django-admin-show-image-from-imagefield
    def image(self):
        return mark_safe('<a href="%s"><img src="%s" width="auto" height="150" /></a>' % (self.receipt.url, self.receipt.url))

    def __str__(self) -> str:
        return f'${self.amount} on {self.date}'

    class Meta:
        managed = False
        db_table = 'expense'
        ordering = ['-date']


class TaxPeriod(models.Model):
    name = models.CharField(max_length=255)
    start = models.DateField()
    end = models.DateField()

    @property
    def taxable_income(self):
        activities = invoice_models.Activity.objects.filter(invoice__paid__gte=self.start, invoice__paid__lte=self.end)
        if activities.exists():
            total = sum([activity.amount for activity in activities])
        else:
            total = decimal.Decimal("0.00")
        return total.quantize(decimal.Decimal("0.01"))

    @property
    def tax_deductible_expenses(self):
        expenses = Expense.objects.filter(date__gte=self.start, date__lte=self.end)

        if not expenses.exists():
            return decimal.Decimal('0.00')

        amounts = [expense.tax_deductible_amount for expense in expenses]

        if len(amounts) > 0:
            total = sum(amounts)
        else:
            total = decimal.Decimal("0.00")

        return total.quantize(decimal.Decimal('0.01'))

    def __str__(self) -> str:
        return f'{self.name}'

    class Meta:
        managed = False
        db_table = 'tax_period'
        ordering = ['-start', '-end']


class Travel(models.Model):
    activity = models.ForeignKey(invoice_models.Activity, models.RESTRICT)
    from_location = models.CharField(max_length=1023, blank=True, null=True)
    to_location = models.CharField(max_length=1023, blank=True, null=True)
    expense = models.ForeignKey(Expense, models.RESTRICT, blank=True, null=True)
    kms = models.FloatField()
    date = models.DateField()

    def __str__(self) -> str:
        return f'{self.date} ({self.kms} km)'

    class Meta:
        managed = False
        db_table = 'travel'
        verbose_name_plural = 'Travel'
        ordering = ['-date']
