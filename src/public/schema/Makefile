update-schema:
	mariadb-dump -p --no-data --skip-dump-date -B ppc_invoices | sed -E 's/DEFINER=[^]+@[^]+/DEFINER=CURRENT_USER/g' > schema.sql
