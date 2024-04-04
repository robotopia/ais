# Generated by Django 5.0.4 on 2024-04-04 10:09

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Account",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("bsb", models.CharField(blank=True, max_length=255, null=True)),
                ("number", models.CharField(blank=True, max_length=255, null=True)),
                ("name", models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                "db_table": "account",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Activity",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField()),
                ("qty", models.FloatField(blank=True, null=True)),
                ("notes", models.CharField(blank=True, max_length=1023, null=True)),
            ],
            options={
                "db_table": "activity",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="ActivityType",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "description",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                ("rate", models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                "db_table": "activity_type",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Billing",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(blank=True, max_length=255, null=True)),
                ("addr1", models.CharField(blank=True, max_length=255, null=True)),
                ("addr2", models.CharField(blank=True, max_length=255, null=True)),
                ("phone", models.CharField(blank=True, max_length=255, null=True)),
                ("email", models.CharField(blank=True, max_length=255, null=True)),
                ("abn", models.CharField(blank=True, max_length=255, null=True)),
                ("is_gst_registered", models.IntegerField(blank=True, null=True)),
            ],
            options={
                "db_table": "billing",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Client",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("bill_email", models.CharField(blank=True, max_length=255, null=True)),
                ("email_text", models.TextField(blank=True, null=True)),
            ],
            options={
                "db_table": "client",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Expense",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("description", models.TextField(blank=True, null=True)),
                ("date", models.DateField()),
                ("receipt", models.CharField(blank=True, max_length=1024, null=True)),
                (
                    "fuel_kms",
                    models.DecimalField(
                        blank=True, decimal_places=1, max_digits=10, null=True
                    ),
                ),
            ],
            options={
                "db_table": "expense",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Invoice",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created", models.DateField(blank=True, null=True)),
                ("issued", models.DateField(blank=True, null=True)),
                ("due", models.DateField(blank=True, null=True)),
                ("paid", models.DateField(blank=True, null=True)),
                ("pdf", models.CharField(blank=True, max_length=255, null=True)),
                ("name", models.CharField(blank=True, max_length=255, null=True)),
                ("bill_to", models.IntegerField()),
                ("pdf_viewed", models.IntegerField()),
            ],
            options={
                "db_table": "invoice",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="TaxPeriod",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("start", models.DateField()),
                ("end", models.DateField()),
                ("name", models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                "db_table": "tax_period",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Travel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "from_location",
                    models.CharField(blank=True, max_length=1023, null=True),
                ),
                (
                    "to_location",
                    models.CharField(blank=True, max_length=1023, null=True),
                ),
                ("kms", models.FloatField()),
                ("date", models.DateField()),
            ],
            options={
                "db_table": "travel",
                "managed": False,
            },
        ),
    ]
