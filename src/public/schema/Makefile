update-schema:
	mariadb-dump -p --no-data --skip-dump-date --skip-add-drop-table ppc_invoices | sed -E 's/DEFINER=[^]+@[^]+/DEFINER=CURRENT_USER/g' | sed 's/CREATE TABLE/CREATE TABLE IF NOT EXISTS/' > schema.sql
