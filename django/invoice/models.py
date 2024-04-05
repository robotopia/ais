# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.utils.html import format_html
from django.utils.timezone import now

from datetime import date
import decimal

class Account(models.Model):
    bsb = models.CharField(max_length=255)
    number = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return f'{self.name} ({self.number})'

    class Meta:
        managed = False
        db_table = 'account'
        ordering = ['name', 'bsb', 'number']


class Activity(models.Model):
    date = models.DateField(default=now)
    qty = models.FloatField(default=1.0)
    activity_type = models.ForeignKey('ActivityType', on_delete=models.RESTRICT)
    invoice = models.ForeignKey('Invoice', on_delete=models.RESTRICT, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    @property
    def amount(self):
        if not self.qty:
            return None

        return (decimal.Decimal(self.qty) * self.activity_type.rate).quantize(decimal.Decimal('0.01'))

    def __str__(self) -> str:
        return f'{self.qty}x {self.activity_type.description} on {self.date}'

    class Meta:
        managed = False
        db_table = 'activity'
        verbose_name_plural = 'Activities'
        ordering = ['-date', 'activity_type']


class ActivityType(models.Model):
    description = models.CharField(max_length=255)
    rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f'{self.description}'

    class Meta:
        managed = False
        db_table = 'activity_type'
        ordering = ['description', 'rate']


class Billing(models.Model):
    name = models.CharField(max_length=255)
    addr1 = models.CharField(max_length=255, blank=True, null=True)
    addr2 = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    abn = models.CharField(max_length=255, blank=True, null=True, verbose_name="ABN")
    is_gst_registered = models.BooleanField(default=False, verbose_name="GST registered?")

    def __str__(self) -> str:
        return self.name

    class Meta:
        managed = False
        db_table = 'billing'
        ordering = ['name']


class Client(models.Model):
    name = models.CharField(max_length=255)
    bill_email = models.CharField(max_length=255, blank=True, null=True)
    email_text = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        managed = False
        db_table = 'client'
        ordering = ['name']


class Contract(models.Model):
    employee = models.ForeignKey("Billing", models.RESTRICT, db_column='employee')
    employer = models.ForeignKey("Client", models.RESTRICT, db_column='employer')
    start = models.DateField()
    end = models.DateField()
    pdf = models.FileField(upload_to='contracts', max_length=1023)

    class Meta:
        managed = False
        db_table = 'contract'


#class


class Invoice(models.Model):
    created = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    bill_to = models.ForeignKey(Client, models.RESTRICT, db_column='bill_to')
    issued = models.DateField(blank=True, null=True, help_text="This field controls the editability of other fields.")
    due = models.DateField(blank=True, null=True)
    paid = models.DateField(blank=True, null=True)
    pdf = models.CharField(max_length=255, blank=True, null=True)
    pdf_viewed = models.BooleanField(default=False)
    billing = models.ForeignKey(Billing, models.RESTRICT)
    account = models.ForeignKey(Account, models.RESTRICT)

    @property
    def status(self) -> str:
        if self.paid is not None:
            return 'Paid: ' + f'{self.paid}'

        if self.issued is not None:
            return 'Issued: ' + f'{self.issued}'

        return 'Created: ' + f'{self.created}'

    @property
    def paid_or_overdue(self) -> str:
        if self.paid:
            return self.paid

        if not self.due:
            return None

        if self.due < date.today():
            return format_html("<span style='color: red;'><b>OVERDUE</b></span>")

        return None

    def __str__(self) -> str:
        return f'{self.name}, {self.bill_to}'


    class Meta:
        managed = False
        db_table = 'invoice'
        ordering = ['billing', '-created']


