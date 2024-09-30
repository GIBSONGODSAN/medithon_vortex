from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, ScheduleDetails
from .authentication import AdminTokenAuthentication
from .methods import encrypt_password, users_encode_token, admin_encode_token, encrypt_file
from rest_framework import status
from .serializers import UserSerializer, ScheduleDetailsSerializer, SentDetailsSerializer
from django.core.paginator import Paginator
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
import os
from pathlib import Path
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from zipfile import ZipFile
import datetime

import logging

logger = logging.getLogger(__name__)

path = r"E:\medithon\root"

# Create your views here.
class DummyAPIView(APIView):
    def get(self, request):
        return Response({"data": "Hello World"})
    
#SIGN IN API
class SignInAPIView(APIView):

    def post(self, request):
        try:
            data = request.data
            email = data.get("email")
            password = data.get("password")
            user = User.objects.get(email=email)
            encryptPassword = encrypt_password(password)  # Assuming this is defined elsewhere
            
            if user.password == encryptPassword:
                if user.role == "nurse":
                    token = users_encode_token({"id": str(user.id), "role": user.role})
                else:
                    token = admin_encode_token({"id": str(user.id), "role": user.role})
                
                refresh = RefreshToken.for_user(user)

                # Serialize the user object
                serialized_user = UserSerializer(user)
                
                return Response(
                    {
                        "token": str(token),
                        "access": str(refresh.access_token),
                        "data": serialized_user.data,  # Correctly access .data
                        "message": "User logged in successfully",
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        except User.DoesNotExist:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            logger.error(e)
            return Response({"message": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

#SIGN UP API / CREATE USER API
class SignUpAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            raw_password = serializer.validated_data.get('password')
            encrypted_password = encrypt_password(raw_password)
            serializer.save(password=encrypted_password)
            return Response({'data': serializer.data, 'message': "User created successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        paginator = Paginator(User.objects.all(), 10)  # Adjust page size as needed
        page = request.query_params.get('page', 1)
        result_page = paginator.get_page(page)
        serializer = UserSerializer(result_page, many=True)
        return Response({'data': serializer.data, 'message': "User details listed successfully"}, status=status.HTTP_200_OK)

    def put(self, request, pk, *args, **kwargs):
        data = request.data
        user = User.objects.get(pk=pk)
        serializer = UserSerializer(user, data=data)
        
        if serializer.is_valid():
            raw_password = serializer.validated_data.get('password')
            encrypted_password = encrypt_password(raw_password)
            serializer.save(password=encrypted_password)
            return Response({'data': serializer.data, 'message': "User updated successfully"})
        else:
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response({'message': "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

logger = logging.getLogger(__name__)

class DirStructAPIView(APIView):
    def get(self, request):
        try:
            structure = []
            
            for root, directories, files in os.walk(path):
                structure.append({
                    'root': root,
                    'directories': directories,
                    'files': files
                })

            return Response({'data': structure, 'message': 'Directory structure listed successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
    
# class ShareFileAPIView(APIView):
#     def post(self, request):
#         data = request.data
        
#         directory_path = data.get('directory_path', '')
#         from_email = data.get('from_email', '')
#         to_email = data.get('to_email', '')

#         serialized_data = SentDetailsSerializer(data=data)
#         if serialized_data.is_valid():
#             serialized_data.save()
#         else:
#             return Response({'error': serialized_data.errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         if os.path.exists(directory_path):
#             print("Directory exists")
#             # unique_name = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
#             zip_file_path = os.path.join("D:/", f'zipped_files_.zip')
#             file_name = []
#             print("Zipping files")
#             with ZipFile(zip_file_path, 'w') as zip_file:
#                 for root, dirs, files in os.walk(directory_path):
#                     for file in files:
#                         file_path = os.path.join(root, file)
#                         file_name.append(file)
#                         arcname = os.path.relpath(file_path, directory_path)
#                         zip_file.write(file_path, arcname=arcname)
#             print("Zipping completed")
#             print("Sending email")
#             email_subject = 'Zipped Files'
#             email_body = 'Please find attached the zipped files.'

#             msg = MIMEMultipart()
#             msg.attach(MIMEText(email_body, 'plain'))
#             print("Email body attached")
#             with open(zip_file_path, 'rb') as attachment:
#                 attached_file = MIMEApplication(attachment.read(), _subtype="zip")
#                 attached_file.add_header('Content-Disposition', 'attachment', filename=os.path.basename(zip_file_path))
#                 msg.attach(attached_file)

#             smtp_server = 'smtp.gmail.com'
#             smtp_port = 587
#             smtp_username = 'gibson.25cs@licet.ac.in'
#             smtp_password = 'GIBson6103@'
#             print("Email being sent")
#             # Send the email
#             with smtplib.SMTP(smtp_server, smtp_port) as server:
#                 server.starttls()
#                 server.login(smtp_username, smtp_password)
#                 server.sendmail(smtp_username, to_email, msg.as_string())
#             print("Email sent")
#             # Send a response indicating the file path and email status
#             return Response({'data': file_name, 'message': 'Zip file created and email sent successfully.',
#                              'zip_file_path': zip_file_path, 'to_email': to_email},
#                             status=status.HTTP_200_OK)
#         else:
#             return Response({'message': 'Directory does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
     

class ShareFileAPIView(APIView):
    authentication_classes = [AdminTokenAuthentication]
    def post(self, request):
        data = request.data
        
        directory_path = data.get('directory_path', '')
        from_email = data.get('from_email',''),
        to_email = data.get('to_email', '')
        recipient_username = data.get('recipient_username', '')  # Assume this is sent in request for encryption

        if os.path.exists(directory_path):
            unique_name = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            zip_file_path = os.path.join("E://medithon//files", f'zipped_files{unique_name}.zip')
            file_name = []
            with ZipFile(zip_file_path, 'w') as zip_file:
                print("Zipping files")
                print(directory_path)
                for root, dirs, files in os.walk(directory_path):
                    for file in files:
                        print(file)
                        file_path = os.path.join(root, file)
                        file_name.append(file)
                        arcname = os.path.relpath(file_path, directory_path)
                        zip_file.write(file_path, arcname=arcname)
                print("Zipping completed", zip_file_path)

            # Encrypt the zip file using AES encryption
            encrypted_zip_path = encrypt_file(zip_file_path, recipient_username)
            
            # Send the email with the encrypted zip file
            email_subject = 'Encrypted Zipped Files'
            email_body = 'Please find attached the encrypted zip file. Use your username as the password to decrypt it.'

            msg = MIMEMultipart()
            msg.attach(MIMEText(email_body, 'plain'))
            
            with open(encrypted_zip_path, 'rb') as attachment:
                attached_file = MIMEApplication(attachment.read(), _subtype="zip")
                attached_file.add_header('Content-Disposition', 'attachment', filename=os.path.basename(encrypted_zip_path))
                msg.attach(attached_file)

            smtp_server = 'smtp.gmail.com'
            smtp_port = 587
            smtp_username = 'gibson.25cs@licet.ac.in'
            smtp_password = 'GIBson6103@'

            # Send the email
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.sendmail(smtp_username, to_email, msg.as_string())

            # Cleanup: remove temporary zip and encrypted files
            os.remove(zip_file_path)
            os.remove(encrypted_zip_path)

            # Send response with success message
            return Response({'message': 'Encrypted zip file created and email sent successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Directory does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
   
class ScheduleAPIView(APIView):
    authentication_classes = [AdminTokenAuthentication]
    def post(self, request):
        data = request.data
        serialized_data = ScheduleDetailsSerializer(data=data)
        if serialized_data.is_valid():
            serialized_data.save()
            return Response({'data': serialized_data.data, 'message': 'Schedule created successfully.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': serialized_data.errors}, status=status.HTTP_400_BAD_REQUEST)