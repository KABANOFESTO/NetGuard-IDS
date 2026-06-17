# Generated manually to scope local blocks to a specific network segment.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("security", "0003_blockedentity_mac_address"),
    ]

    operations = [
        migrations.AddField(
            model_name="blockedentity",
            name="network_scope",
            field=models.CharField(blank=True, db_index=True, max_length=120),
        ),
        migrations.AddIndex(
            model_name="blockedentity",
            index=models.Index(fields=["network_scope"], name="sec_block_scope_idx"),
        ),
    ]
