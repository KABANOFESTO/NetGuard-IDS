# Generated manually to support MAC-based network blocking.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("security", "0002_networkedgeprofile_networkedgeactionlog"),
    ]

    operations = [
        migrations.AddField(
            model_name="blockedentity",
            name="mac_address",
            field=models.CharField(blank=True, db_index=True, max_length=100),
        ),
    ]
