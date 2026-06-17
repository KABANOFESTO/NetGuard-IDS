# Generated manually to scope local blocks to a specific network segment.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("security", "0004_merge_20260615_1655"),
    ]

    operations = [
        migrations.AddField(
            model_name="blockedentity",
            name="network_scope",
            field=models.CharField(blank=True, db_index=True, max_length=120),
        ),
        migrations.AddIndex(
            model_name="blockedentity",
            index=models.Index(fields=["network_scope"], name="security_bl_network_f0b6be_idx"),
        ),
    ]
