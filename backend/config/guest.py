from dataclasses import dataclass


@dataclass
class GuestUserConfig:
    name: str = "Guest User"
    password: str = "guest_password"
