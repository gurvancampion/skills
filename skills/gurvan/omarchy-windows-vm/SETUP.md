# Machine setup

One-time, per Linux machine. Each step needs the user (sudo, an interactive installer, or the Windows desktop); hand them the commands rather than running them.

1. `omarchy-windows-vm install` (interactive). 8G RAM and 4 cores suit Node/Electron dev work. The first boot installs Windows and takes about 10 minutes.
2. `scripts/winvm setup` from this skill's folder. It links `winvm` into `~/.local/bin`, creates the winvm SSH key, copies the guest script into the VM's shared folder, and prints the two remaining commands:
   - a `sudo install` of a polkit rule that lets this user run exactly `omarchy-windows-vm __priv up_wait|down|status` without a password prompt. Agents run inside a systemd user service with no active seat, so they can never answer a prompt.
   - a PowerShell command to run as Administrator inside the VM (`winvm gui` opens it): it enables OpenSSH, authorizes the key, creates `C:\worktrees`, adds Defender exclusions, and installs Git, mise and PowerShell 7.
3. Check: `winvm up && winvm run 'cmd /c ver' && winvm down`.

## How it works

- Start and stop go through `omarchy-windows-vm`'s own privileged actions, so Omarchy keeps owning the VM's compose file, mounts and updates. If an Omarchy update renames `__priv` actions, `winvm up` fails with a polkit error: compare `valid_priv_action` in `/usr/bin/omarchy-windows-vm` with the rule in `/etc/polkit-1/rules.d/50-omarchy-windows-vm.rules`.
- The VM publishes only RDP (3389) and noVNC (8006) on localhost. dockur forwards every port of the container's bridge IP to the guest, so `winvm` finds that IP by probing port 22 on Docker bridges and pins the host key under the alias `winvm`.
- Leases live in `~/.local/state/winvm/leases`: `WINVM_LEASE` if set, else `PASEO_AGENT_ID`, else the worktree id, so agents outside Paseo get one lease per worktree. `winvm down` arms a `winvm-reap` user timer; the reaper stops the VM only when no lease is left and nobody is connected over RDP or noVNC. Leases untouched for 4 hours count as abandoned.

## Troubleshooting

- `pkexec` asks for a password or fails with "No authentication agent": the polkit rule is missing or no longer matches.
- `winvm up` hangs on SSH: open `winvm gui` and check `Get-Service sshd` in the VM. If sshd runs, `rm ~/.local/state/winvm/ip` and retry.
- `winvm up` fails right after "starting Windows VM" with no reason: `omarchy-windows-vm` demands `~/Windows` be mode exactly `700`, and the guest file share can set the setgid bit. `winvm up` clears it; `stat -c %a ~/Windows` shows `2700` if it came back.
- Host key mismatch after reinstalling the VM: `rm ~/.local/state/winvm/known_hosts`.
