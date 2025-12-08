#!/usr/bin/env python3
import json
import base64
from typing import Dict, Any

def decode_jwt_payload(token: str) -> Dict[str, Any]:
    """
    Decode JWT token payload without verification.
    Returns the payload as a dictionary.
    """
    try:
        # Split the token into parts
        parts = token.split('.')
        if len(parts) != 3:
            return {"error": "Invalid JWT format"}
        
        # Get the payload (second part)
        payload = parts[1]
        
        # Add padding if needed (JWT base64 encoding may not include padding)
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        
        # Decode base64
        decoded_bytes = base64.urlsafe_b64decode(payload)
        
        # Parse JSON
        payload_json = json.loads(decoded_bytes.decode('utf-8'))
        
        return payload_json
    except Exception as e:
        return {"error": f"Failed to decode token: {str(e)}"}

def format_timestamp(timestamp: int) -> str:
    """Convert Unix timestamp to readable format."""
    import datetime
    try:
        dt = datetime.datetime.fromtimestamp(timestamp)
        return f"{timestamp} ({dt.strftime('%Y-%m-%d %H:%M:%S')})"
    except:
        return str(timestamp)

def pretty_print_payload(payload: Dict[str, Any], token_type: str):
    """Pretty print the decoded payload with better formatting."""
    print(f"\n{'='*60}")
    print(f"{token_type.upper()} TOKEN PAYLOAD")
    print(f"{'='*60}")
    
    if "error" in payload:
        print(f"Error: {payload['error']}")
        return
    
    # Format timestamps for better readability
    timestamp_fields = ['exp', 'iat', 'auth_time']
    
    for key, value in payload.items():
        if key in timestamp_fields:
            print(f"{key:20}: {format_timestamp(value)}")
        elif isinstance(value, dict):
            print(f"{key:20}:")
            for sub_key, sub_value in value.items():
                print(f"  {sub_key:18}: {sub_value}")
        elif isinstance(value, list):
            print(f"{key:20}: {value}")
        else:
            print(f"{key:20}: {value}")

# To use this script for debugging:
# 1. Login to your application in the browser
# 2. Open browser DevTools > Network tab
# 3. Find the Keycloak token response (look for requests to /protocol/openid-connect/token)
# 4. Copy the response JSON and paste it below, replacing the empty token_response dictionary
# 5. Run: python3 decode_jwt.py
#
# Example token_response structure:
# token_response = {
#     "access_token": "eyJhbGci...",
#     "expires_in": 1800,
#     "refresh_expires_in": 3600,
#     "refresh_token": "eyJhbGci...",
#     "token_type": "Bearer",
#     "id_token": "eyJhbGci...",
#     "not-before-policy": 0,
#     "session_state": "uuid-here",
#     "scope": "openid email profile"
# }

token_response = {
    "access_token": "",
    "expires_in": 0,
    "refresh_expires_in": 0,
    "refresh_token": "",
    "token_type": "Bearer",
    "id_token": "",
    "not-before-policy": 0,
    "session_state": "",
    "scope": ""
}

def main():
    print("JWT TOKEN DECODER")
    print("="*60)
    
    # Decode access token
    access_payload = decode_jwt_payload(token_response["access_token"])
    pretty_print_payload(access_payload, "access")
    
    # Decode refresh token
    refresh_payload = decode_jwt_payload(token_response["refresh_token"])
    pretty_print_payload(refresh_payload, "refresh")
    
    # Decode ID token
    id_payload = decode_jwt_payload(token_response["id_token"])
    pretty_print_payload(id_payload, "id")
    
    # Show token response metadata
    print(f"\n{'='*60}")
    print("TOKEN RESPONSE METADATA")
    print(f"{'='*60}")
    print(f"{'expires_in':20}: {token_response['expires_in']} seconds")
    print(f"{'refresh_expires_in':20}: {token_response['refresh_expires_in']} seconds")
    print(f"{'token_type':20}: {token_response['token_type']}")
    print(f"{'not_before_policy':20}: {token_response['not-before-policy']}")
    print(f"{'session_state':20}: {token_response['session_state']}")
    print(f"{'scope':20}: {token_response['scope']}")

if __name__ == "__main__":
    main()
