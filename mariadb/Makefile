update-init:
	mariadb-dump -p --no-data --skip-dump-date --skip-add-drop-table -B $$DBNAME | sed -E 's/DEFINER=[^]+@[^]+/DEFINER=CURRENT_USER/g' | sed 's/CREATE TABLE/CREATE TABLE IF NOT EXISTS/' > init.sql
