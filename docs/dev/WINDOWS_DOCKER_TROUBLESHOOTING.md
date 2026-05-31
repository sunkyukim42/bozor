# Windows Docker Troubleshooting

This note documents the local Windows Docker PATH issue observed during BozorCheck verification.

## Symptom

In PowerShell, `docker compose up -d postgres` can exit with no useful output when the shell resolves this shim first:

```text
C:\Windows\System32\docker
```

The actual Docker Desktop CLI works when called directly:

```text
C:\Program Files\Docker\Docker\resources\bin\docker.exe
```

## Confirm Which Docker Is Used

Run:

```powershell
where.exe docker
Get-Command docker | Select-Object -ExpandProperty Source
```

Expected healthy resolution should prefer Docker Desktop's resources directory before `C:\Windows\System32`.

## Temporary Workaround

Call Docker Desktop's CLI by absolute path:

```powershell
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' version
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose up -d postgres
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose ps
```

## Check PostgreSQL Health

From `backend`:

```powershell
cd backend
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose ps
```

Expected:

```text
bozorcheck-postgres   postgres:16-alpine   Up ... (healthy)   0.0.0.0:5432->5432/tcp
```

Also verify the port:

```powershell
Test-NetConnection -ComputerName localhost -Port 5432
```

Expected:

```text
TcpTestSucceeded : True
```

## PATH Cleanup

Open Windows environment variable settings and move Docker Desktop's path above `C:\Windows\System32` for Docker resolution:

```text
C:\Program Files\Docker\Docker\resources\bin
```

Then restart all terminals and verify:

```powershell
Get-Command docker | Select-Object -ExpandProperty Source
docker version
docker compose ps
```

## Notes

- This is an environment issue, not an application code issue.
- Do not change backend source code to work around this.
- Use the absolute Docker CLI path in verification logs if PATH is still unresolved.
