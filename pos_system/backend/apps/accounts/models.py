from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('kasir', 'Kasir'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='kasir')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
