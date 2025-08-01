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

# The token response from your request
token_response = {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOQWlSNVRiUnNVWER4eTRhWHE2b3Z5VGJ3TmdNZWFvWjdybTAwaFlvRnJVIn0.eyJleHAiOjE3NTQwODI0NDAsImlhdCI6MTc1NDA4MDY0MCwiYXV0aF90aW1lIjoxNzU0MDgwNjM5LCJqdGkiOiJmOTcwZWVkNy1kODZlLTRjNTQtYTYwYy1iNzEwYmYyZDFjYjMiLCJpc3MiOiJodHRwczovL2tleWNsb2FrLmNkYW8udXMvYXV0aC9yZWFsbXMvYmFieS15b2RhIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjQ3Y2E4YjA2LTBkZjYtNDlmMy05NzJjLTRiYTlkOWZmMzI1ZSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1hcmtldHBsYWNlIiwic2lkIjoiNWIwNTc4ZjUtMWZhYi00MGE0LTg0NWQtOTA1MWRjZjAxNDg2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2FkdmFuYS1tYXJrZXRwbGFjZS5hcHAuYWR2YW5hLmNkYW8udXMiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmFieS15b2RhIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFya2V0cGxhY2UiOnsicm9sZXMiOlsibWFya2V0cGxhY2UtcmVxdWVzdG9yIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiS2lsaWFuIEJlcnJlcyIsInByZWZlcnJlZF91c2VybmFtZSI6ImtiZXJyZXMiLCJnaXZlbl9uYW1lIjoiS2lsaWFuIiwiZmFtaWx5X25hbWUiOiJCZXJyZXMiLCJlbWFpbCI6ImtiZXJyZXNAbWV0cm9zdGFyLmNvbSJ9.oZEpWCTXoLfU7_X4U8EdQ9_K3xKR40VaxN1fMvA810xdOnXFBc9Ok5ufyIvGK0jn6EsF-_u5VqBZrb_ffH-dSI2reO-CXJz8IsUhNCwqe8HNcdSv0DoOB0Ffb3nxCB38A8v8r4-bTyK6wL8dc43JsFuqAbJb3bEot_U_sxhjYv4Yut9lWcfzXXMHsYzM-DITaGwHio5nT58Ipd5qk6HZLVmB_7GUYnhWtB7migEKimOxBVtndrbnCN-JjwgYPsCSAzyvV2eXj9exoVl8zQO9chr-KUuR6zTz7lkcMcaKQSyPCBfztJoJTzawiT9m6j1t1KQSb4_p6rzZJOwjulHOPA",
    "expires_in": 1800,
    "refresh_expires_in": 3600,
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI2Mjc1NGJkMS0zZGYwLTQ3NGMtYTA3Ni1iNmQ2YmI5YjRjODMifQ.eyJleHAiOjE3NTQwODQyNDAsImlhdCI6MTc1NDA4MDY0MCwianRpIjoiMjNiNzEyZWYtYjdhOS00YzBmLWFmYWMtMDk5OTc2YmNjMDgwIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5jZGFvLnVzL2F1dGgvcmVhbG1zL2JhYnkteW9kYSIsImF1ZCI6Imh0dHBzOi8va2V5Y2xvYWsuY2Rhby51cy9hdXRoL3JlYWxtcy9iYWJ5LXlvZGEiLCJzdWIiOiI0N2NhOGIwNi0wZGY2LTQ5ZjMtOTcyYy00YmE5ZDlmZjMyNWUiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoibWFya2V0cGxhY2UiLCJzaWQiOiI1YjA1NzhmNS0xZmFiLTQwYTQtODQ1ZC05MDUxZGNmMDE0ODYiLCJzY29wZSI6Im9wZW5pZCB3ZWItb3JpZ2lucyBlbWFpbCBiYXNpYyByb2xlcyBwcm9maWxlIGFjciJ9.CzlRamsTtF4sxsJaU6ymk9hMHPb2Le-rF-yaSzlWh_SuyCxxe75grLIHJP6ZByqIo7zRPfoO7kfx0IM-sgtU3Q",
    "token_type": "Bearer",
    "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOQWlSNVRiUnNVWER4eTRhWHE2b3Z5VGJ3TmdNZWFvWjdybTAwaFlvRnJVIn0.eyJleHAiOjE3NTQwODI0NDAsImlhdCI6MTc1NDA4MDY0MCwiYXV0aF90aW1lIjoxNzU0MDgwNjM5LCJqdGkiOiIxZWU2NWEyYi1hMzRhLTQ0YTEtYmQxMC0zOTk5ZTE0NDY1NGYiLCJpc3MiOiJodHRwczovL2tleWNsb2FrLmNkYW8udXMvYXV0aC9yZWFsbXMvYmFieS15b2RhIiwiYXVkIjoibWFya2V0cGxhY2UiLCJzdWIiOiI0N2NhOGIwNi0wZGY2LTQ5ZjMtOTcyYy00YmE5ZDlmZjMyNWUiLCJ0eXAiOiJJRCIsImF6cCI6Im1hcmtldHBsYWNlIiwibm9uY2UiOiI3ZDU1MzczYS04Y2M5LTQ1Y2EtYjI2Yi0yYThkNmUxNjcxOWQiLCJzaWQiOiI1YjA1NzhmNS0xZmFiLTQwYTQtODQ1ZC05MDUxZGNmMDE0ODYiLCJhdF9oYXNoIjoiU3BUZTBVT0pNbUVwenF0ZU5fTmhFUSIsImFjciI6IjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJLaWxpYW4gQmVycmVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoia2JlcnJlcyIsImdpdmVuX25hbWUiOiJLaWxpYW4iLCJmYW1pbHlfbmFtZSI6IkJlcnJlcyIsImVtYWlsIjoia2JlcnJlc0BtZXRyb3N0YXIuY29tIn0.LynciNQVzT2GmeBEosSVar-lPufNVOZnu5efsRzMsFJ8XD3Hpo4xRjrOOoKOwv23r1BODKjuzeZr_AA8YdOdTyV_L0X9rli46TQvMEIaB0P3EHiRffUKCFgXZCLLb2N-EqgH2NrI3tVA9Q5bHFCXise6V_h6vfiQvDejqBaPvtaTk9W-wxBIRYpXbKFoUjj68H-1GSy4dq4xVdfnTNXJdza3WbkRaKhLkC-DYyC-D8AhoeSDeyJEVssT64i0KfPihM3MeyLwQbi-o5KQ5T3h83yLTwdJsL0r85Q1v_baOJ-_omJsfDF9JH11qCqvq21JqQSGRBEf09YS7kkHsef8Og",
    "not-before-policy": 0,
    "session_state": "5b0578f5-1fab-40a4-845d-9051dcf01486",
    "scope": "openid email profile"
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
