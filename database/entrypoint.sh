#!/bin/bash

# Iniciar el script de importación de datos en segundo plano
/bin/bash /usr/src/app/import-data.sh &

# Iniciar SQL Server (proceso principal)
exec /opt/mssql/bin/sqlservr
