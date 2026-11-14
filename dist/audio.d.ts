# Platform support

| Player | apt | dnf (Fedora) | pacman (Arch) |
|---|---|---|---|
| `paplay` | `sudo apt install pulseaudio-utils` | `sudo dnf install pulseaudio-utils` | `sudo pacman -S libpulse` |
| `pw-play` | `sudo apt install pipewire-bin` | `sudo dnf install pipewire-utils` | `sudo pacman -S pipewire` |
| `aplay` | `sudo apt install alsa-utils` | `sudo dnf install alsa-utils` | `sudo pacman -S alsa-utils` |
| `ffplay` | `sudo apt install ffmpeg` | `sudo dnf install ffmpeg` | `sudo pacman -S ffmpeg` |

*Note: The `ffmpeg` package on Fedora requires the RPM Fusion repo enabled.*