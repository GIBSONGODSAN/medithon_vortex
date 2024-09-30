from rest_framework import serializers
from .models import User, ScheduleDetails, SentDetails

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        
class ScheduleDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleDetails
        fields = '__all__'
        
class SentDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentDetails
        fields = '__all__'