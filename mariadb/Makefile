update-init:
	mariadb-dump -p --no-data --skip-dump-date --skip-add-drop-table --flush-privileges -B $$DBNAME > init.sql
