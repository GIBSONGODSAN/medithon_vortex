import uuid
from django.db import models
from django.utils import timezone

# USER MODEL
class User(models.Model):
    Roles = [
        ("nurse", "nurse"),
        ("doctor", "doctor"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, default="")
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    profile_image = models.TextField(null=True, blank=True)
    role = models.CharField(max_length=255,choices=Roles, default="nurse")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=255, null=True, blank=True)
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.email

class ScheduleDetails(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    filepath = models.JSONField(max_length=255, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    from_email = models.EmailField(max_length=255, null=True, blank=True)
    to_email = models.EmailField(max_length=255, null=True, blank=True)
    subject = models.CharField(max_length=255, null=True, blank=True)
    email_body = models.TextField(max_length=255, null=True, blank=True)
    
class SentDetails(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_username = models.EmailField(max_length=255, null=True, blank=True)
    to_email = models.EmailField(max_length=255, null=True, blank=True)
    directory_path = models.JSONField(max_length=255, null=True, blank=True)
    sent_at = models.DateTimeField(default=timezone.now, editable=False)
    
    def __str__(self):
        return self.email
