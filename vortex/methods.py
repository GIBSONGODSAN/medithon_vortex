import hashlib
import jwt
import datetime
import logging
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad
import os

# from Crypto.Random import get_random_bytes

# # Generate a random key of 32 bytes (store securely)
key = "qwertyuiopasdfghjklzxcvbnm"

logger = logging.getLogger(__name__)


BASE_DIR = r"E:\medithon"  # Use a raw string for Windows paths

def encrypt_password(raw_password):
    salt = hashlib.sha256()
    salt.update(raw_password.encode('utf-8'))
    salt_bytes = salt.digest()

    hashed_password = hashlib.sha256()
    hashed_password.update(raw_password.encode('utf-8') + salt_bytes)
    hashed_password_bytes = hashed_password.digest()

    return hashed_password_bytes.hex()

def users_encode_token(payload: dict):
    payload["exp"] = datetime.datetime.now(
        tz=datetime.timezone.utc
    ) + datetime.timedelta(days=7)
    token = jwt.encode(payload, "user_key", algorithm="HS256")
    return token

def admin_encode_token(payload: dict):
    payload["exp"] = datetime.datetime.now(
        tz=datetime.timezone.utc
    ) + datetime.timedelta(days=7)
    token = jwt.encode(payload, "admin_key", algorithm="HS256")
    return token


def encrypt_file(file_path, password):
    try:
        iv = get_random_bytes(16)
        # Create AES cipher using the password and the IV
        key = password.encode('utf-8')[:32]  # Using the first 32 bytes of password as key for AES-256
        cipher = AES.new(key, AES.MODE_CBC, iv)

        # Read the file to encrypt
        with open(file_path, 'rb') as f:
            plaintext = f.read()
        
        # Pad and encrypt the data
        ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))

        # Combine IV and ciphertext for decryption
        encrypted_file_path = f'{file_path}.enc'
        with open(encrypted_file_path, 'wb') as f_enc:
            f_enc.write(iv + ciphertext)

        return encrypted_file_path
    except Exception as e:
        logger.error(f"Error during file encryption: {e}")
        raise e