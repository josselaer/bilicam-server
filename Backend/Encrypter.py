from cryptography.fernet import Fernet
key = b"cVNUtLjN12AEb_9H_SStUXwMzbLgmz7rNDEZIX3eMs4="
f = Fernet(key)
token = b'gAAAAABZB4DsGGtsACkXJa61jhmbiHEM0iOO9I3QPuuJ8hfHgwqYTv4C4v3t2otMuydSjUg6UU_CpwZe_0DnbAg4D4teLo81Ww=='
name = f.decrypt(token)
print("Key:", key)
print("Name:", name)