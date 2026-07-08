#!/bin/bash

# Esperar a que SQL Server esté completamente listo y acepte conexiones
echo "Esperando a que SQL Server esté listo..."
for i in {1..50}; do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TuPassword123!" -C -Q "SELECT 1" &> /dev/null
    if [ $? -eq 0 ]; then
        echo "SQL Server está listo. Iniciando importación de init.sql..."
        /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TuPassword123!" -C -i /usr/src/app/init.sql
        echo "Esquema y datos iniciales importados correctamente."
        break
    else
        echo "SQL Server aún no está listo, esperando (intento $i)..."
        sleep 2
    fi
done
