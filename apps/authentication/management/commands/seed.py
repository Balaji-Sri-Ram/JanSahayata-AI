from django.core.management.base import BaseCommand
from seed import run_seed

class Command(BaseCommand):
    help = 'Seeds initial administrative, departmental officer, and citizen data into MongoDB.'

    def handle(self, *args, **options):
        run_seed()
        self.stdout.write(self.style.SUCCESS('Successfully seeded JanSahayata MongoDB database.'))

