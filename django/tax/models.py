from django.db import models
import invoice.models as invoice_models

# Create your models here.

class Expense(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    receipt = models.CharField(max_length=1024, blank=True, null=True)
    fuel_kms = models.DecimalField(max_digits=10, decimal_places=1, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'expense'


class TaxPeriod(models.Model):
    start = models.DateField()
    end = models.DateField()
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tax_period'


class Travel(models.Model):
    activity = models.ForeignKey(invoice_models.Activity, models.DO_NOTHING, blank=True, null=True)
    from_location = models.CharField(max_length=1023, blank=True, null=True)
    to_location = models.CharField(max_length=1023, blank=True, null=True)
    expense = models.ForeignKey(Expense, models.DO_NOTHING, blank=True, null=True)
    kms = models.FloatField()
    date = models.DateField()

    class Meta:
        managed = False
        db_table = 'travel'
