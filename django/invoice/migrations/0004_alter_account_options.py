# Generated by Django 5.0.4 on 2024-04-05 08:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("invoice", "0003_alter_account_options"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="account",
            options={"ordering": ["name", "bsb", "number"]},
        ),
    ]
