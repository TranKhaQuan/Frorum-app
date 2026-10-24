#!/bin/bash

# Tạo thư mục backup nếu chưa có
mkdir -p backup

# Tạo timestamp cho tên file (YYYYMMDD-HHMMSS)
stamp=$(date +%Y%m%d-%H%M%S)
db_name="forum_db"
backup_file="backup/${db_name}-${stamp}.sql.gz"

# Chạy mysqldump qua container MySQL (forum15-db) và nén bằng gzip
docker exec forum15-db mysqldump -uroot -proot ${db_name} 2>/dev/null | gzip > "${backup_file}"

echo "created ${backup_file}"

